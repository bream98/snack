# Kế hoạch Cấu trúc Cây Website & Kiến trúc Màn hình Kanban

Tài liệu này xác định cấu trúc cây luồng màn hình (Site Tree), kiến trúc layout và các module tính năng cho ứng dụng web (Client) trong thư mục `client`.

---

## 1. Cấu trúc Cây Website (Website Site Tree)

```
Root (/)
├── 🔐 Auth Suite (/auth)
│   ├── Login (/auth/login)             --> Màn hình Đăng nhập
│   ├── Register (/auth/register)       --> Màn hình Đăng ký
│   ├── Forgot Password (/auth/forgot)  --> Màn hình Khôi phục mật khẩu
│   └── Logout (/auth/logout)           --> Xử lý Đăng xuất & Clear State
│
└── 📊 Dashboard Workspace (/app) [Sử dụng DashboardLayout]
    ├── Topbar (Thanh công cụ trên cùng)
    │   ├── Workspace Switcher          --> Đổi Workspace
    │   ├── Global Search Bar           --> Tìm kiếm tin nhắn & công việc
    │   ├── Notification Center         --> Thông báo
    │   ├── Theme Switcher              --> Chuyển chế độ Sáng/Tối
    │   └── User Profile Menu           --> Menu cá nhân & Logout
    │
    ├── Sidebar (Thanh điều hướng bên trái)
    │   ├── 💬 Channel Messages (CM)    --> Danh sách kênh nhóm (#general, #kanban-dev...)
    │   ├── 👤 Direct Messages (DM)     --> Danh sách hội thoại cá nhân 1-1
    │   └── 📋 Kanban Boards            --> Danh sách các bảng Kanban
    │
    └── 📌 Main Content Area (Khu vực nội dung chính)
        ├── 📋 Kanban Board Screen (/app/kanban/:boardId)
        │   ├── Header Toolbar          --> Tiêu đề bảng, Filter, Search card, Member avatars
        │   ├── Board Columns (Cột trạng thái)
        │   │   ├── Backlog
        │   │   ├── To Do (Cần làm)
        │   │   ├── In Progress (Đang làm)
        │   │   ├── Review (Kiểm thử)
        │   │   └── Done (Hoàn thành)
        │   └── Kanban Card Components  --> Task item (Title, Priority, Assignee, Comments)
        │
        ├── 💬 Channel Chat Screen (/app/channels/:channelId)
        │   └── Tích hợp bảng Kanban rút gọn góc phải (Quick Task Panel)
        │
        ├── 👤 Direct Message Screen (/app/dm/:userId)
        └── ⚙️ Settings (/app/settings)
```

---

## 2. Thiết kế Layouts & Components

### 2.1 AuthLayout (`src/layouts/AuthLayout.tsx`)
- Giao diện trung tâm (Centered Card Layout) trên nền gradient/glassmorphism mượt mà.
- Form nhập dữ liệu kế thừa từ Design System (`Input`, `Button`, `Text`, `Heading`).

### 2.2 DashboardLayout (`src/layouts/DashboardLayout.tsx`)
- Bố cục 2 cột linh hoạt (Sidebar fixed 260px + Topbar sticky + Scrollable Content Area).
- Hỗ trợ ẩn/hiện Sidebar (Responsive Drawer).

### 2.3 Kanban Board Layout (`src/features/kanban/`)
- Màn hình chứa các cột song song (Horizontal Scroll Container).
- Drag & Drop state management với Zustand (`useKanbanStore`).
- Modal xem chi tiết & chỉnh sửa Task.

---

## 3. Cấu trúc Thư mục Code (`client/src/`)

```
client/src/
├── api/
│   ├── axiosClient.ts
│   ├── authApi.ts
│   └── kanbanApi.ts
├── store/
│   ├── useAuthStore.ts
│   ├── useKanbanStore.ts
│   └── useChatStore.ts
├── design-system/                  <-- Tokens & Primitives đã dựng
│   ├── tokens/
│   ├── components/
│   └── index.ts
├── layouts/
│   ├── AuthLayout.tsx
│   └── DashboardLayout.tsx
├── components/
│   ├── layout/
│   │   ├── Topbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ChannelList.tsx
│   │   └── DMList.tsx
│   └── common/
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── kanban/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── KanbanCard.tsx
│   │   └── TaskDetailModal.tsx
│   └── chat/
│       └── ChatBox.tsx
└── App.tsx
```

---

## 4. Các bước Triển khai Dự kiến (Execution Roadmap)

1. **Bước 1:** Khởi tạo `useAuthStore` & màn hình Auth (`Login`, `Register`, `Logout`).
2. **Bước 2:** Xây dựng khung `DashboardLayout` gồm `Topbar` & `Sidebar` (phân chia khu vực CM - Channel Message & DM - Direct Message).
3. **Bước 3:** Khởi tạo `useKanbanStore` & dựng giao diện **Kanban Board** (Các cột Backlog, To Do, In Progress, Done & Thẻ công việc).
4. **Bước 4:** Tích hợp chuyển đổi luồng màn hình mượt mà và kiểm thử build ứng dụng.
