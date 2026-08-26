# Snack

## Mục tiêu

Xây dựng phần mềm chat với throughput cao và latency thấp.

## Tính chất

- Thông lượng đạt được nên là 10k message/s
- Latency < 100ms
- Daily active users ~ 100k

Để biết hệ thống có đáp ứng được yêu cầu về hiệu suất hay không, cần thực hiện các bài test để đánh giá.

## Chức năng

- CM chat, là một conversation cho giao tiếp 1-1
- DM chat, chat theo nhóm, gọi một nhóm là channel và 1 channel hỗ trợ < 1k member
- Chat theo nhánh từ 1 message ban đầu, có thể gọi chức năng này là Branch
- Presence, hệ thống thu thập và hiển thị trạng thái của user
- Activity, nhận thông báo khi 1 member được người khác tag vào 1 message hoặc branch mà người dùng đó đang tham gia có tin nhắn mới
- Member trong 1 conversation có thể theo dõi trạng thái của message
- Thêm reaction cho message

## High Level Design
![high-level-design](https://github.com/user-attachments/assets/3699706e-d655-49cb-afa5-bd81ead27fad)

### LB / WS Gateway / Redis

Mỗi user khi kết nối với hệ thống sẽ tạo 1 connection WS, LB (load balancer) sẽ chia đều tải cho các node WS Gateway.

Như vậy, 1 node chỉ giữ các kết nối với 1 phần user đang hoạt động. Vậy 1 câu hỏi cần đặt ra là: nếu 1 node cần gửi tin nhắn tới 1 connection đang nằm ở 1 node khác thì làm như thế nào?

=> Mọi connection trong hệ thống được theo dõi ở một nơi mà tất cả node có thể truy cập, và một node có khả năng ra lệnh cho 1 node khác gửi message cho user mà node đó đang sở hữu.

=> Dùng Redis như một trung tâm điều phối vì Redis có khả năng ghi trên RAM và sử dụng Pub/Sub để một Node ra lệnh cho Node khác.

### Kafka / Worker

Kafka dùng để xử lý luồng event sinh ra khi có message mới, với đặc điểm có khả năng chịu tải cao và tách bạch trách nhiệm của việc nhắn tin với các chức năng như Reaction / Presence / Bot / Prevent Spam / Analytics.

Ngoài ra, tính năng xử lý theo lô sẽ giảm số lần ghi vào Database.

## Thiết kế Websocket

Websocket thiết lập một kết nối 2 chiều giữa Server và Client. Server có thể sập do mất điện, bảo trì; Client có thể mất mạng. Do đó, cần một cơ chế kiểm tra kết nối giữa 2 node.

=> Dùng heartbeat để xác nhận. Mỗi 10s Server gửi 1 message về Client và Client sẽ phản hồi lại. Nếu sau 10s Server không nhận được phản hồi từ Client, Server có thể coi rằng Client đã disconnect và thực hiện xóa Connection đang lưu trên Server. Ngược lại, Client nếu sau một khoảng thời gian không nhận được tín hiệu từ Server sẽ xóa kết nối hiện tại và thực hiện Retry.

Vì một user có thể đăng nhập trên nhiều thiết bị nên User này cũng có nhiều kết nối tới Server. Trường hợp Client thực hiện Retry và có MessageElement mới tới, khi Retry thành công Client cần thực hiện Sync MessageElement từ last_message_id.

## MessageElement

User gửi 1 message vào WS Gateway.

Kiểm tra quyền:

- Nếu là CM thì kiểm tra User có phải là Member không?
- Nếu là DM thì kiểm tra giữa 2 User đã có DM trong DB chưa?

Trường hợp không thành công thì trả message lỗi 401: Not member hoặc DM not exist.

Lưu message vào DB.

Kiểm tra Redis trạng thái Presence của User. Nếu User Online, gửi MessageElement cho User thông qua kết nối WS.

- Lấy danh sách tất cả Member trong Cache, nếu trong Cache chưa tồn tại thì query DB rồi lưu vào Cache
- Đi qua từng member trong CM hoặc Receiver trong DM
- Nếu trạng thái đang Online, tìm WS Gateway của Member đó và bắn Event qua Redis Pub/Sub
- WS Gateway nhận MessageElement mới với User và gửi về Client qua connection của User đó

MessageElement được gửi cho Worker để xử lý.

## Read & Unread status

Cách xử lý thứ nhất là trạng thái đi theo message. Với Channel có 1k Member, 1 message mới sẽ sinh ra 1k status.

Ưu điểm của cách này là có thể theo dõi chính xác MessageElement nào User đã xem và MessageElement nào User chưa xem. Nhưng số Status mới tỉ lệ thuận với số lượng MessageElement trong Channel, với công thức:

`Status = N (MessageElement) * M (Member)`

Cách xử lý thứ 2 là trạng thái đi theo Channel. Với cách này, số lượng Status của Channel = M (Member). User được theo dõi là đã đọc tới MessageElement nào. Nếu có MessageElement tới sau MessageElement User đã đọc thì được coi là MessageElement mới.

## Reaction

Reaction sẽ đi theo MessageElement. Và mỗi Member sẽ được lưu trạng thái Reaction riêng so với Member khác. Tất cả các Reaction sẽ được đưa vào Kafka và xử lý theo lô mỗi 0.1ms để lưu vào DB.

Vì khi Member react một tin nhắn nhưng Member khác đang Online cũng nhìn thấy, nên Reaction cũng được coi là 1 message và được gửi tới Member khác qua kết nối WS.

Phía người ấn Reaction nhận được thông báo thành công, tức là yêu cầu đó mới đi vào Kafka và Server hoàn toàn không biết khi nào Reaction đó được lưu thành công.

## Tag

MessageElement được đưa vào Kafka để phân tích tag.

Nếu phát hiện Tag trong MessageElement, sẽ tạo Activity thông báo cho User khác.

## Presence

Sau khi khởi tạo kết nối thành công với WS Gateway, User gửi 1 message Verification với Jwt Token để xác thực.

=> Nếu xác thực thành công, ghi trạng thái kết nối của User đó vào Redis.

## Activity

Activity sẽ được gửi như một thông báo khi User được Tag vào 1 tin nhắn hoặc Branch có tin nhắn mới mà User đó đang tham gia.

## Database Design
![db-design](https://github.com/user-attachments/assets/6894a92a-6fa8-4851-8920-f3dce541e45a)

## Caching

Sử dụng Redis lưu Member của CM trên RAM vì số lượng Member tối đa là 1000, nên nếu query Relational DB sẽ có chi phí về thời gian và truyền tải cao.

Khi Member thêm / xóa Member, cần Invalidate cache.

## Test

### DB

- DB Read: lấy dữ liệu Member của Channel
- DB Write: ghi MessageElement

### WS Gateway

- Số lượng Connection kết nối tại một thời điểm
- Tại thời điểm đó, các Connection gửi tin nhắn cũng tốn khả năng tính toán của Server

### Redis

- Khả năng Caching
- Pub/Sub tại một thời điểm có thể xử lý bao nhiêu tin nhắn