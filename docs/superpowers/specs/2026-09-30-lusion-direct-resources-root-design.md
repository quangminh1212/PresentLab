# Đưa Lusion thành trang gốc

## Mục tiêu

Trang `/` mở trực tiếp trang Lusion và tải CSS, JavaScript cùng asset Lusion theo URL gốc. Trang Portal không còn được hiển thị tại `/`. Route `/lusion/` bị bỏ hẳn; không dùng iframe hay tài liệu nhúng.

## Hiện trạng

- `web/portal/index.html` là trang gốc hiện tại; khu vực `#templates` tải Lusion qua iframe tại `/lusion/?water-page-embed=1`.
- `scripts/build-vercel.mjs` sao chép Portal thành `index.html`, tạo thêm `public/lusion/index.html` và sửa bundle để dùng `/lusion/` làm route mặc định.
- Lusion có sẵn tài liệu trang chủ, CSS, JavaScript và asset; các tài nguyên đó có thể được phục vụ trực tiếp từ cùng origin mà không cần iframe.

## Thiết kế

1. Build phục vụ trang chủ Lusion làm `public/index.html`; tài liệu gốc của Lusion là nguồn markup. CSS và JavaScript được nạp bằng tham chiếu tài nguyên trong trang này; ảnh, font, model và asset khác tiếp tục dùng URL gốc hiện có.
2. Trang `/` hiển thị Lusion trực tiếp, không hiển thị Portal, iframe, `srcdoc` hoặc tài liệu HTML con được nạp lúc chạy. Không cần giới hạn CSS Lusion vào một vùng con vì trang gốc chỉ khởi tạo Lusion.
3. Route trang chủ và các liên kết quay về trang chủ dùng `/`. Bundle không có fallback hoặc route prefix `/lusion/`.
4. Build không xuất `public/lusion/index.html`. Các trang nội dung Lusion tại `/about` và `/projects` tiếp tục được giữ để liên kết nội bộ hoạt động. Portal có thể tiếp tục được phục vụ riêng tại `/portal/`; không phải nội dung của trang gốc và không nằm trong phạm vi kiểm tra.
5. Bộ kiểm tra asset xác nhận `public/index.html` là trang Lusion, các tài nguyên Lusion được tham chiếu trực tiếp, không có iframe hoặc URL `/lusion/`, và không xuất trang Lusion trùng lặp tại `/lusion/`.

## Phạm vi thay đổi dự kiến

- `scripts/build-vercel.mjs`: xuất tài liệu Lusion thành `public/index.html`, giữ Portal riêng tại `/portal/`, bỏ đầu ra `public/lusion/index.html` và bỏ các route prefix `/lusion/`.
- `vercel.json` và cấu hình phục vụ local liên quan: để `/` trỏ tới tài liệu Lusion, `/portal/` trỏ riêng tới Portal, và không có route cho `/lusion/`.
- `scripts/verify-portal-assets.mjs`: xác nhận hợp đồng trang gốc Lusion cùng các tài nguyên trực tiếp.

Các thay đổi đang có sẵn trong working tree được giữ nguyên; chúng không thuộc commit triển khai này trừ khi một hunk cụ thể cần thiết để hoàn thành thiết kế và được rà soát riêng.

## Chấp nhận

- `http://127.0.0.1:4173/` mở trang Lusion trực tiếp và tải các CSS, script, font, ảnh cùng asset cần thiết.
- Trang gốc không hiển thị Portal và không tạo iframe.
- Điều hướng về trang chủ Lusion dùng `/`; địa chỉ `/lusion/` không được tạo hoặc dùng.
- Chỉ xác nhận trên `/`; không mở hoặc kiểm tra trang `/lusion/`.

## Rủi ro cần xử lý khi triển khai

Runtime và CSS Lusion đã chạy trong một tài liệu riêng; chuyển trang Lusion thành trang gốc tránh xung đột DOM/CSS với Portal. Khi triển khai vẫn cần rà soát bundle và History API để mọi điều hướng trang chủ đi về `/` và không tạo URL `/lusion/`.
