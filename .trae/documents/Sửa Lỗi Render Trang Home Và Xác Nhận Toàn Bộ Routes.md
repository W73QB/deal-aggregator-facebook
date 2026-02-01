## Tình Trạng
- Dev server đang chạy. `/deals` phản hồi 200. `/blog` cần xác nhận preview. `/` đã từng báo "Element type is invalid".

## Kế Hoạch Sửa Lỗi
1) Khởi động lại dev (clear Fast Refresh state), truy cập `/` để lấy lỗi chi tiết (stack/overlay).
2) Cô lập nguyên nhân trong `HomePage`:
- Tạm thay thế phần nội dung bằng markup tối giản để xác định component gây lỗi.
- Kiểm tra sự tồn tại của `HomePage.module.css` và imports (`OptimizedImage`, `RatingStars`, `CategoryIcon`).
3) Sửa component/import gây lỗi:
- Nếu import sai default/named export: chỉnh lại import.
- Nếu component trả về object: chỉnh return về JSX.
- Nếu CSS module thiếu: tạo file hoặc fallback classNames.
4) Xác nhận CSP dev vẫn cho phép Fast Refresh, không thay đổi cấu hình prod.

## Kiểm Tra Toàn Bộ Routes
- `/deals`: xác nhận render và thẻ SEO.
- `/blog`: xác nhận render và thẻ SEO.
- `/blog/[slug]`: xác nhận thẻ `og:image/og:image:alt` và `twitter:image` đã bổ sung.

## Bàn Giao
- Chạy lint/test, cung cấp trạng thái cuối cùng không lỗi.
- Bổ sung ghi chú ngắn về thay đổi để bạn kiểm tra.

Xác nhận để tôi tiến hành thực hiện theo kế hoạch, sửa và xác nhận trực tiếp trên preview.