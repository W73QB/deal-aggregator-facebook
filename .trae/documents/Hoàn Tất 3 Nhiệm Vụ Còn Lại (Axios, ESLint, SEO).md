## Mục Tiêu
- Chuẩn hoá các Redux slices dùng axios theo `lib/utils/http` + `resolveApiBaseUrl()`.
- Hoàn thiện ESLint overrides cho thư mục tests/migrations để không sinh cảnh báo không cần thiết.
- Bổ sung đầy đủ thẻ SEO hình ảnh (`og:image`, `twitter:image`) cho trang Deals và Blog (listing + chi tiết).

## Phạm Vi
- Thư mục `lib/store/slices/*` (tất cả slice còn dùng axios trực tiếp).
- Cấu hình `.eslintrc.cjs` (chỉ ở overrides cho tests/migrations/`__tests__`).
- Các trang: `pages/deals.js`, `pages/blog/index.js`, `pages/blog/[slug].js` (hoặc component page tương ứng), và xác nhận schema/Head.

## Triển Khai Chi Tiết
### 1) Chuẩn hoá axios ở Redux slices
- Rà soát tất cả file trong `lib/store/slices/`:
  - Thay `import axios from 'axios'` bằng `import axios from '../../utils/http'`.
  - Thêm `import { resolveApiBaseUrl } from '../../utils/apiConfig'` và set `const API_BASE = resolveApiBaseUrl()`.
  - Chuẩn hoá endpoint: mọi request dùng `${API_BASE}/...`.
  - Giữ nguyên kiểu trả về, unify error (throw `error.response?.data?.message || error.message`).
- Slices dự kiến tác động: `notificationSlice`, `inAppNotificationsSlice`, các slice khác nếu còn axios.
- Kết quả: tất cả call đi qua axios cấu hình chung và nguồn base URL nhất quán.

### 2) ESLint overrides cho tests/migrations
- Mở rộng `overrides` trong `.eslintrc.cjs`:
  - Đối tượng files: `server/test/**/*.js`, `server/tests/**/*.js`, `server/migrations/**/*.js`, `__tests__/**`, `tests/**`.
  - rules: tắt `no-unused-vars`, `no-useless-escape`, `@next/next/no-img-element`, `@next/next/no-html-link-for-pages`, `react-hooks/exhaustive-deps` cho các khu vực test/migration.
- Không đổi rule ở app code (giữ nghiêm các rule đã bật).
- Kết quả: lint sạch ở test/migration, không ảnh hưởng chất lượng app.

### 3) Bổ sung og:image cho Deals & Blog
- `pages/deals.js`: thêm `<meta property="og:image">` và `<meta name="twitter:image">` trỏ `https://dealradarus.com/og-share.png`.
- `pages/blog/index.js`: tương tự, đã có thẻ — xác nhận và chuẩn hoá alt.
- `pages/blog/[slug].js`: thêm động các thẻ dựa vào dữ liệu bài viết (ảnh thumbnail nếu có, fallback `og-share.png`).
- Đảm bảo `link rel="canonical"` chuẩn và không trùng lặp.

## Kiểm Thử & Xác Nhận
- Chạy `npm run lint` để xác nhận không còn lỗi/cảnh báo.
- Chạy `npm test` để đảm bảo test không vỡ.
- Chạy dev full, mở `http://localhost:3000/` kiểm tra:
  - Trang Deals: Head có `og:image`/`twitter:image`.
  - Trang Blog listing và Blog post chi tiết: Head meta đầy đủ.
  - Kiểm tra các thao tác slice gọi API dùng base URL thống nhất (log request URL).

## Rủi Ro & Phương Án
- Rủi ro axios: endpoint dùng base URL mới — nếu biến môi trường chưa đặt, dùng resolver fallback như hiện tại.
- Rủi ro ESLint: phạm vi override quá rộng — giữ chỉ trong `tests/migrations/__tests__` để tránh che lỗi app.
- SEO: nếu bài viết không có ảnh, fallback `og-share.png` để tránh thẻ thiếu.

Bạn xác nhận để tôi tiến hành cập nhật mã, cấu hình lint, và chạy kiểm thử.