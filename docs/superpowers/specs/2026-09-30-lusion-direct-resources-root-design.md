# Tích hợp Lusion trực tiếp vào trang gốc

## Mục tiêu

Giữ Portal làm trang `/`, nhưng thay Lusion iframe hiện được tải tại khu vực thư viện bằng DOM, CSS, JavaScript và asset được phục vụ trực tiếp từ cùng trang. Trang `/lusion/` không còn được tạo hoặc dùng làm trang kiểm tra.

## Hiện trạng

- `web/portal/index.html` đặt iframe Lusion trong khu vực `#templates` và tải `/lusion/?water-page-embed=1`.
- `scripts/build-vercel.mjs` sao chép trang Lusion sang `public/lusion/index.html` và sửa bundle để dùng `/lusion/` làm route mặc định.
- Lusion dựa vào CSS toàn cục, DOM ID, điều hướng History API và cuộn ảo; iframe hiện cô lập các trạng thái đó khỏi Portal.

## Thiết kế

1. Portal tiếp tục là trang chủ và giữ các phần hiện có. Nội dung trang Lusion được đưa vào DOM Portal tại vị trí iframe hiện tại; không dùng iframe, `srcdoc` hoặc nạp một tài liệu HTML con lúc chạy.
2. Bộ build lấy markup trang chủ Lusion từ mã nguồn hiện có và tạo trang gốc đã hợp nhất. CSS và JavaScript Lusion được nạp như tài nguyên của tài liệu gốc. Ảnh, font, model và các asset khác tiếp tục được phục vụ qua URL gốc hiện có.
3. CSS Lusion được giới hạn trong vùng Lusion. Các quy tắc hiện tác động lên `html`, `body` hoặc `:root` được chuyển thành trạng thái của vùng Lusion hoặc được thay bằng quy tắc tương đương không làm thay đổi Portal.
4. Runtime Lusion khởi tạo trong vùng DOM của nó. Route trang chủ là `/`; không có fallback, liên kết hoặc URL kiểm tra `/lusion/`. Luồng cuộn và điều hướng được điều chỉnh để hoạt động trong tài liệu Portal chung, không khóa hoặc dịch chuyển toàn bộ Portal như khi chạy trong iframe.
5. Build không xuất `public/lusion/index.html`. Các trang nội dung Lusion đang nằm ở `/about` và `/projects` tiếp tục được giữ để những liên kết hiện tại còn hoạt động; phạm vi kiểm tra trình duyệt của thay đổi này chỉ là `/`.
6. Bộ kiểm tra asset xác nhận trang gốc có markup và tham chiếu trực tiếp tới tài nguyên Lusion, không có iframe Lusion, không có tham chiếu `/lusion/`, và không xuất trang chủ Lusion riêng.

## Phạm vi thay đổi dự kiến

- `web/portal/index.html` và `web/portal/app.js`: thay iframe và cầu nối iframe bằng khởi tạo Lusion trực tiếp trong tài liệu Portal.
- `web/portal/styles.css`, CSS Lusion và `web/lusion/scripts/site-overrides.js`: giới hạn kiểu dáng và hành vi vào vùng Lusion.
- `scripts/build-vercel.mjs`: ghép markup/tài nguyên vào trang gốc, bỏ đầu ra `/lusion/` và route prefix tương ứng.
- `scripts/verify-portal-assets.mjs` cùng rewrite liên quan: xác nhận hợp đồng mới cho trang gốc.

Các thay đổi đang có sẵn trong working tree được giữ nguyên; chúng không thuộc commit triển khai này trừ khi một hunk cụ thể cần thiết để hoàn thành thiết kế và được rà soát riêng.

## Chấp nhận

- `http://127.0.0.1:4173/` tải Portal và nội dung Lusion trực tiếp trong một tài liệu, không tạo iframe.
- CSS, script và asset Lusion được tải thành công từ `/` và không ghi đè layout hoặc cuộn của Portal.
- Điều hướng trang chủ Lusion quay về `/`; không có request hoặc điều hướng tới `/lusion/`.
- Chỉ xác nhận trên `/`; không mở hoặc kiểm tra trang `/lusion/`.

## Rủi ro cần xử lý khi triển khai

Runtime Lusion hiện giả định có một `document` riêng và dùng cuộn ảo. Khi nhập vào tài liệu Portal, các truy vấn DOM, CSS toàn cục, xử lý wheel/touch và History API phải được rà soát cùng nhau. Nếu không thể giữ các tương tác Lusion hiện tại trong cuộn Portal, dừng trước khi thay đổi trải nghiệm và báo rõ điểm không tương thích.
