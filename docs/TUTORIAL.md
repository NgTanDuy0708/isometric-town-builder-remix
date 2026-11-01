# Tutorial cho người mới và hướng dẫn tính năng

Luồng khởi đầu có 28 bước. Thứ tự bắt buộc là chọn Nhà Tranh → đặt → thoát công cụ → chờ xây xong → có 4 dân → mua/đặt một luống → thoát đặt → chọn hạt lúa mì → thoát gieo → chờ chín → thu hoạch → bán một lúa → xem nhiệm vụ, kho và thao tác.

- Bàn tay SVG và viền sáng theo đúng nút, thẻ hàng hoặc vị trí trên map; cập nhật theo pan/zoom và cửa sổ đang mở.
- Chuột: nhấp đặt, Space + kéo, con lăn, R/E, Esc, các phím zoom/căn giữa/gỡ/hoàn tác.
- Cảm ứng: chạm chọn vị trí rồi ✓ xác nhận, vuốt/pinch và nhấn giữ. Chọn kiểu theo thiết bị trỏ thực tế; có nút đổi hướng dẫn thủ công cho máy lai.
- Nhà chưa hoàn tất không được tính là đã có dân. Tutorial không thay đổi quy tắc lao động hoặc cấp nhà/ruộng miễn phí.
- Hoàn tất lần đầu thưởng 200 vàng + 20 XP; xem lại không thưởng thêm. Bỏ qua không thưởng.
- Để sau giữ nguyên bước và hiện nút xem tiếp. Cài đặt → Xem Hướng Dẫn để học lại.

Mỗi cấp 1–25 có tour riêng. Công trình, hạt mới và giới hạn chuồng lấy từ catalog đang dùng; tour bổ sung giải thích công nhân/nguyên liệu (4), quản gia (5), tháp/vệ binh/tàu (6), pháp sư (8), rừng/quái rừng (10), rồng (12), cùng các tiện ích sẵn có. Mỗi món trong cửa hàng có bước mở Cửa hàng → chọn danh mục → chỉ đúng thẻ. Các món được giới thiệu riêng, có giá và cách dùng; cùng danh mục thì chuyển thẳng sang món tiếp theo. Chọn thẻ sẽ hướng dẫn đặt trên map; chọn Chỉ xem, tiếp tục sẽ giữ nguyên tiền và bỏ qua đặt. Đặt xong/hủy sẽ cất công cụ để tránh xây lặp. Hạt giống mới được chỉ trong bảng hạt của luống trống. Không tự mua hàng hoặc tiêu kim cương. Lần đầu xuất hiện Hội chợ, Thương đoàn và Mùa vàng cũng xếp một hướng dẫn riêng.

`save.tutorial` lưu bước tân thủ, dấu mốc gieo/thu/bán, thưởng đã nhận, cấp đã biết, các tour đã xem/đang xem/chờ và trạng thái để sau. Có trong lưu thường, backup và JSON xuất/nhập. Hàng đợi lên cấp chờ đóng thông báo lên cấp; nhảy nhiều cấp vẫn giữ đủ tour. Đi giữa các vùng dùng chung tiến trình tutorial.

## Các file chính

- `src/data/tutorialGuides.js`: nội dung, trình tự, đích chỉ tay và nguồn mở khóa theo cấp.
- `src/engine/tutorialProgress.js`: chuẩn hóa save và điều kiện hoàn thành theo dữ liệu thật.
- `src/engine/tutorialManager.js`: tiến trình, hàng đợi, khôi phục, thưởng một lần.
- `src/engine/tutorialRouting.js`: đổi đích chỉ tay theo cửa hàng đang đóng/mở, danh mục hiện tại và bảng hạt; khôi phục đường đi khi người chơi quay lại hoặc đóng bảng.
- `src/engine/tutorialView.js`, `src/tutorial.css`: thẻ hướng dẫn, bàn tay, vị trí tránh che mục tiêu.
- `src/studioEngine.js`: đích tọa độ map, mở bảng, callback hành động/lên cấp/sự kiện.

## Kiểm tra

`npm test`, `npm run lint`, `npm run build`.

Đã chạy 28 bước qua giao diện bản build bằng chuột và cảm ứng giả lập: đặt nhà có thời gian xây thật, nhận dân, mua một luống, gieo/chờ/thu/bán, mở nhiệm vụ và kho; cả hai hoàn tất và lưu đủ dấu mốc, không lỗi JavaScript. Đã xem thẻ cửa hàng trên màn hình nhỏ và tour công nhân cấp 4.

Khi bổ sung tính năng: đặt đúng cấp mở vào catalog và thêm tour trong `SPECIAL_TOURS` nếu có cơ chế mới. Khai báo panel/selector và callback mở bảng nếu là cửa sổ mới. Khi thay id/class nút, cập nhật selector tutorial cùng lúc.

## Điều chỉnh luồng mở khóa (01/11/2026)

- Bàn tay đi tiếp trong cửa hàng, chỉ nút quay lại nếu vào nhầm danh mục, tự cuộn tới đúng thẻ. Đóng bảng giữa bước đọc thì hướng dẫn quay về mở bảng; chỉ cho xác nhận đọc khi đang xem đúng mục.
- Mỗi công trình/hạt/chuồng vừa tăng giới hạn có thẻ riêng, thay vì liệt kê nhiều tên nhưng chỉ trỏ món đầu. Cửa hàng và tutorial dùng chung danh sách món bị loại bỏ.
- Cài đặt → Hướng dẫn cấp hiện tại để xem lại riêng nội dung cấp đó. Không trả thêm thưởng và không đánh dấu các tour còn chờ là đã xem.
- Đã thử trực tiếp luồng mở cửa hàng → Nông trại → Chuồng gà, bước chọn/đặt, cửa hàng trên màn hình nhỏ, quay lại từ danh mục sai và đóng/mở lại giữa bước đọc.
