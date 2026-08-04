# Kế hoạch Thiết kế & Phát triển Design System (Client App)

Tài liệu này phác thảo kế hoạch chi tiết xây dựng hệ thống **Design System** hoàn chỉnh cho ứng dụng React + Vite trong thư mục `client`, sử dụng **styled-components** và **@headlessui/react**.

---

## 1. Mục tiêu & Định hướng (Core Objectives)

* **Consistency (Tính nhất nhất):** Chuẩn hóa tất cả các thành phần UI (Màu sắc, Typography, Khoảng cách, Bóng, Bo góc).
* **Flexibility (Tính linh hoạt):** Tích hợp mượt mà chế độ **Light Mode** & **Dark Mode** qua `styled-components` ThemeProvider.
* **Accessibility (Khả năng truy cập):** Kết hợp các phần tử unstyled từ **Headless UI** để đảm bảo chuẩn ARIA và điều hướng bằng bàn phím.
* **Developer Experience (DX):** Auto-complete đầy đủ TypeScript type definitions cho tất cả các Design Tokens.

---

## 2. Cấu trúc Design Tokens (Design Token Architecture)

Tất cả các token sẽ được định nghĩa tại `src/design-system/tokens/`:

### 2.1 Color Tokens (`colors.ts`)
- **Primary / Brand:** `#6366F1` (Indigo 500), các shade từ `50` đến `900`.
- **Secondary:** `#EC4899` (Pink 500).
- **Neutral / Surface:** Slate series (`#0F172A`, `#1E293B`, `#334155`, `#F8FAFC`, v.v.).
- **Status Colors:** Success (`#10B981`), Warning (`#F59E0B`), Danger (`#EF4444`), Info (`#3B82F6`).
- **Gradients & Glass:** Linear gradients cho CTA & hiệu ứng Glassmorphism.

### 2.2 Typography Tokens (`typography.ts`)
- **Font Family:** Primary (`Inter` / `Plus Jakarta Sans`), Monospace (`Fira Code`).
- **Font Scale:**
  - `xs`: 12px / line-height 16px
  - `sm`: 14px / line-height 20px
  - `base`: 16px / line-height 24px
  - `lg`: 18px / line-height 28px
  - `xl`: 20px / line-height 28px
  - `2xl`: 24px / line-height 32px
  - `3xl`: 30px / line-height 36px
  - `4xl`: 36px / line-height 40px

### 2.3 Spacing, Border & Elevation (`layout.ts`)
- **Spacing Scale:** Multiples of 4px (`4`, `8`, `12`, `16`, `24`, `32`, `48`, `64`).
- **Border Radii:** `sm` (4px), `md` (8px), `lg` (12px), `xl` (16px), `full` (9999px).
- **Shadows & Glows:** Multi-layer ambient shadows (`sm`, `md`, `lg`, `xl`, `glowPrimary`).

---

## 3. Danh mục Component Cần Xây Dựng (Component Roadmap)

### Phase 1: Base Primitives (Thành phần Cơ bản)
- [ ] **Typography Component:** `Heading`, `Text`, `Label` (hỗ trợ variant, color, weight).
- [ ] **Button Component:** Primary, Secondary, Outline, Ghost, Danger (hỗ trợ size `sm`, `md`, `lg`, loading state, icon).
- [ ] **Input & Form Elements:** `TextInput`, `TextArea`, `Checkbox`, `Radio`.
- [ ] **Badge & Tag:** Status indicators với màu sắc động.
- [ ] **Card & Container:** Container kính mờ (Glassmorphism), Card bề mặt có hover animation.

### Phase 2: Headless UI Integrations (Thành phần Phức tạp)
- [ ] **Dropdown Menu:** Kết hợp `@headlessui/react` `Menu` với Styled-Components styling.
- [ ] **Modal Dialog:** Kết hợp `@headlessui/react` `Dialog` & `Transition` cho hiệu ứng popup mượt mà.
- [ ] **Switch Toggle:** Kết hợp `@headlessui/react` `Switch` bọc kiểu dáng nút toggle Light/Dark mode.
- [ ] **Tabs:** Kết hợp `@headlessui/react` `TabGroup` cho điều hướng thẻ.

### Phase 3: Layout & Feedback
- [ ] **Flex / Grid Utility Components:** `Flex`, `Grid`, `Spacer`, `Divider`.
- [ ] **Skeleton Loader:** Hiệu ứng shimmer chờ nạp dữ liệu.
- [ ] **Toast / Alert Banner:** Thông báo trạng thái ứng dụng.

---

## 4. Cấu trúc Thư mục Đề xuất (Folder Structure)

```
client/src/
└── design-system/
    ├── tokens/
    │   ├── colors.ts
    │   ├── typography.ts
    │   ├── shadows.ts
    │   ├── radii.ts
    │   └── spacing.ts
    ├── components/
    │   ├── Button/
    │   │   ├── Button.tsx
    │   │   └── Button.styles.ts
    │   ├── Input/
    │   ├── Card/
    │   ├── Modal/
    │   └── Dropdown/
    ├── styles/
    │   ├── GlobalStyle.ts
    │   ├── theme.ts
    │   └── styled.d.ts
    ├── hooks/
    │   └── useTheme.ts
    └── index.ts
```

---

## 5. Lộ trình Thực thi (Execution Steps)

1. **Bước 1:** Tổ chức lại thư mục `src/design-system` và khai báo đầy đủ Design Tokens.
2. **Bước 2:** Cập nhật `styled.d.ts` & `theme.ts` hỗ trợ mượt mà Light / Dark Mode.
3. **Bước 3:** Phát triển tập các Base Primitive Components (`Button`, `Input`, `Card`, `Typography`).
4. **Bước 4:** Xây dựng tập các Headless UI Wrapper Components (`Dropdown`, `Modal`, `Switch`).
5. **Bước 5:** Tạo một trang **Design System Showcase / Playground** tại `App.tsx` để xem và test tương tác trực quan tất cả phần tử UI.

---

## 6. Kiểm thử & Đánh giá (Verification)

* **Type Safety:** Chạy `tsc -b` kiểm tra không lỗi TypeScript với Theme.
* **Build Check:** Chạy `npm run build` đóng gói sản phẩm thành công.
* **Visual Audit:** Kiểm tra độ tương phản màu sắc, responsive và mượt mà trong cả chế độ Light và Dark mode.
