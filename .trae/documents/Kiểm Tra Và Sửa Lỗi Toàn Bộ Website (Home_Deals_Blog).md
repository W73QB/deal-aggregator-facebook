## Mục Tiêu
- Xác định và khắc phục triệt để lỗi rendering trên trang Home ("Element type is invalid").
- Rà soát và xác nhận các trang Deals/Blog hoạt động ổn định, thẻ SEO đúng.
- Đảm bảo dev server chạy ổn định (CSP dev, refresh), không còn lỗi server/client.

## Kiểm Tra & Chẩn Đoán
1) Ghi nhận lỗi hiện tại
- Theo log, trang Home đã từng 500 với lỗi "Element type is invalid". Deals trả 200, Blog cần kiểm tra lại.
- Thu thập lại log khi truy cập `/` và xem overlay error để định vị stack.

2) Khoanh vùng nguyên nhân trang Home
- Kiểm tra `pages/index.js` và `components/pages/HomePage.js`:
  - Xác thực tất cả import là component hợp lệ (Link, OptimizedImage, RatingStars, CategoryIcon).
  - Xác thực CSS module tồn tại (`HomePage.module.css`).
- Nếu lỗi tiếp tục, thay thế tạm thời nội dung HomePage bằng markup tối giản để xác định phần tử gây lỗi.

3) Rà soát components dùng trong Home
- `CategoryIcon` và `RatingStars` đã xác nhận là component hợp lệ; nếu cần, tách từng phần để thử.
- Kiểm tra `OptimizedImage` props (đã bổ sung alt), xác nhận không truyền handler sai vào `Image`.

4) Xác nhận CSP dev
- Dev CSP đã thêm `'unsafe-eval'` chỉ ở dev để hỗ trợ React Fast Refresh; xác nhận không ảnh hưởng prod.

## Sửa Lỗi Dự Kiến
- Nếu nguyên nhân là import sai hoặc default/named export:
  - Sửa import cho đúng hoặc đổi sang named export phù hợp.
- Nếu component trả về object thay vì JSX:
  - Sửa return trả về JSX hợp lệ hoặc bao bọc trong fragment.
- Nếu thiếu CSS module:
  - Tạo file module hoặc dự phòng className.
- Nếu lỗi từ `OptimizedImage`:
  - Kiểm tra và sửa props, đảm bảo chỉ truyền props hợp lệ.

## Kiểm Tra Lại
- Chạy lại `npm run dev:full`, truy cập:
  - `/` Home: render bình thường, không error.
  - `/deals` Deals: 200, nội dung đúng.
  - `/blog` và `/blog/[slug]`: render đúng, thẻ SEO `og:image`/`twitter:image` hiển thị.
- Chạy `npm run lint` đảm bảo không còn lỗi.

## Bàn Giao
- Tổng hợp thay đổi, điểm ảnh hưởng, xác nhận dev OK.
- Gợi ý bước tiếp theo: chạy kiểm tra e2e nhẹ hoặc thêm smoke test cho Home.

Bạn xác nhận để tôi triển khai sửa và kiểm tra theo các bước trên.