# Xưởng dựng map khởi đầu

Mở `/map-editor`. Danh mục gồm 123 vật phẩm có ảnh trong game: công trình, các cấp nâng cấp, cây ăn quả, 18 loại cây trên luống, chuồng và số con, đường, hàng rào, tài nguyên, cảnh quan, ba kỳ quan, cổng thành, cảng biển và tàu Hoàng Gia. Các nút chọn nhanh Cổng thành / Cảng biển / Tàu biển nằm trên đầu danh mục.

- Tìm theo tên hoặc chọn nhóm. Chọn cấp rồi kéo chuột để đặt; giữ Space hoặc chuột giữa/phải để kéo map, cuộn để zoom.
- Nhấn **R** hoặc nút **Xoay vật phẩm** để đổi hướng vật phẩm đang chuẩn bị đặt. Dùng công cụ Chọn (V) rồi R để xoay món đã đặt. Đường dùng các hướng nối có sẵn; những món chỉ có một ảnh dùng lật gương. X lật hướng trước khi đặt. Công cụ vẽ vùng nền dùng G.
- Chọn **Mặc định (không thể gỡ)** hoặc **Có thể gỡ** trước khi đặt. Có thể đổi quyền sau đó bằng công cụ Chọn. Game giữ quyền theo từng vật phẩm/vị trí; hàng rào lưu riêng theo cạnh ô. Bên trong xưởng vẽ vẫn có thể dùng Tẩy (E) để sửa đồ đã khóa.
- Có thể đặt, chọn, xoay và xóa cảnh quan ở vùng ngoài lưới, từ hàng/cột -24 đến 55. Xóa cảnh quan sinh tự động để lại một dấu trống đã lưu, tránh nó mọc lại sau khi tải. Nền đất và cây trên luống vẫn dùng lưới 32 × 32. Tòa thị chính và footprint trung tâm được giữ lại.
- Cổng, cầu cảng và tàu có vị trí riêng; đặt một vị trí mới sẽ chuyển món đó khỏi vị trí cũ. Vùng tương tác giao thương theo vị trí cảng/tàu mới.
- Hoàn tác/Làm lại hỗ trợ Ctrl+Z, Ctrl+Shift+Z. Nhập/xuất JSON mang theo nền, vật phẩm, cấp, hướng, quyền gỡ, hàng rào, cây và kỳ quan. JSON nền cũ vẫn nhập được.

**Lưu map khởi đầu (máy này)** lưu mẫu riêng cho địa chỉ trình duyệt đang mở, dùng khi bắt đầu game mới hoặc bấm Chơi lại tại đây. Không thay game đang chạy và không cập nhật file mặc định chung trong dự án. **Áp dụng vào game** gửi bản vẽ sang tab game cùng địa chỉ, hoặc được nạp khi mở game lần kế tiếp. Lưu một bản dự phòng của save trước khi gửi. Vàng, tài nguyên và tiến trình chung được giữ; các việc thi công, phân công khai thác và trận chiến gắn với bố cục cũ được xóa để không trỏ vào những ô đã thay đổi.

Map khởi đầu chung nằm tại `src/data/village-initial-map-32x32.json` (file người dùng cung cấp ngày 01/11/2026), được nhúng vào bản build. Game mới và Chơi lại dùng bố cục này trên localhost, IP và bản online. Nền, đường, quyền gỡ, 17 đoạn hàng rào và 149 mục cảnh quan đều đi cùng map; không chỉ riêng lưới ô đất.

Bản nháp và mẫu riêng vẫn lưu trên trình duyệt theo từng địa chỉ. Xuất JSON để sao lưu hoặc chuyển sang trình duyệt/máy khác. Khi thay file mặc định chung và build lại, phiên bản mẫu tự đổi theo nội dung; mẫu riêng từ bản cũ không lấn át map mới, nhưng được giữ lại để mở trong xưởng vẽ. Bấm Lưu map khởi đầu (máy này) để chủ động dùng lại một mẫu riêng.

Theo yêu cầu cập nhật ngày 01/11/2026, bản lưu còn bố cục cũ tự nhận map mới một lần khi mở game. `townMapRevision` đi theo save thường và JSON xuất/nhập để các lần tải lại sau giữ công trình người chơi xây thêm. Nếu đang ở Rừng Cổ Thụ, chỉ thay snapshot làng; map rừng hiện tại và nhiệm vụ vùng vẫn giữ.

Lần cập nhật giữ vàng, kim cương, tài nguyên trong kho, cấp/XP, nhiệm vụ, tutorial và đất đã mở. Công trình/ruộng/cảnh quan cũ được thay theo map mới; việc thi công, sản xuất, công nhân và lính gắn với vị trí cũ được dọn. Tiến trình diễn tập và số đợt đã chơi giữ lại, lịch tấn công dừng để xây lại phòng thủ. Trang trí kim cương đang đặt ở làng được trả về túi đúng một lần. Bản lưu trước thay map được lưu riêng tại khóa `isometric_town_builder_before_map_<revision>` khi bộ nhớ cho phép.

Nút Chơi lại vẫn đặt lại tiến trình chơi. Trong xưởng vẽ, Dùng map mặc định của game chỉ thay bản nháp, không tự reset game.

Các khóa: `isometric_town_builder_map_draft_v2`, `isometric_town_builder_starter_map_v2`, `isometric_town_builder_map_apply_v2`. Phiên bản mẫu riêng dùng khóa `isometric_town_builder_starter_map_v2_revision`. Save v3 lưu `mapLocks`, `mapScenery`, `customMapLayout`; snapshot từng vùng cũng giữ các trường này.

Kiểm tra: toàn bộ 272 kiểm thử qua; kiểm thử trực tiếp bootstrap, renderer game và giao diện React, JSON/save-load, footprint chuồng/kho, xoay đường, cảng/tàu và quyền gỡ. Lint và build qua. Việc căn hình dùng cùng renderer và tọa độ tiếp đất với game.
