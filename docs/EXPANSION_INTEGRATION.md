# Tích hợp vật phẩm mở rộng

Đã đăng ký 41 vật phẩm mới và giữ 3 loại cây ăn quả có sẵn, tương ứng 44 đối tượng trong bộ prompt. Một họ công trình là một sản phẩm trong cửa hàng; Lv1–Lv3 đổi ảnh khi nâng cấp.

| Tab | Vật phẩm mở rộng |
| --- | --- |
| Nhà | Nhà đất sét, lều, nhà dài Bắc Âu, biệt thự Địa Trung Hải |
| Sản xuất | Xưởng mộc, xưởng dệt, xưởng bơ sữa, phòng giả kim, nhà kính |
| Nông trại | Táo, dừa, me có sẵn; ca cao, cherry, việt quất, sầu riêng, cam mới |
| Đường & cầu | Đường thẳng, ngã tư, ngã ba, góc L, cầu đá, kênh đào, suối |
| Phong cảnh | Giếng, quầy chợ, công viên, thông, vườn anh đào, đèn, tượng, xe hàng, vườn hồng, đồng cỏ hoa, núi băng, hồ băng, cá voi, suối nóng, hồng hạc |
| Kỳ quan | Tháp pháp sư, chùa gỗ, thư viện, cổng thành, hải đăng; giữ nguyên ba Đại Kỳ Quan hiện có |

## Hành vi

- Giữ các ID lịch sử để bản lưu cũ nhận lại hình; không sửa bản đồ hoặc vàng của người chơi.
- Có giá, cấp mở khóa, thời gian xây, preview, đặt, di chuyển và tháo dỡ theo cơ chế sẵn có.
- Chín họ công trình ba cấp có cấu hình nâng cấp; xưởng dệt và bơ sữa dùng chuỗi sản xuất có sẵn. Không bổ sung tài nguyên mới cho xưởng mộc/giả kim/nhà kính.
- Công trình mới có footprint logic một ô và scale/điểm tiếp đất riêng; kho và tòa thị chính giữ footprint đặc biệt cũ.
- Bảy module phẳng vẽ trước world objects. Kênh/suối không được tính là đường đi bộ.
- Cá voi chỉ đặt trên biển, hồng hạc trên biển/bờ cát, cầu đá có thể đặt trên nước. Preview, click và kéo đặt dùng cùng quy tắc bảo vệ khu trung tâm/bến cảng. Vật phẩm nước trên vùng biển mặc định vẫn di chuyển và tháo được.
- Lưu riêng nền dưới vật phẩm nước; bản lưu và JSON xuất/nhập giữ mặt nước kể cả hồ nhân tạo trong đất liền.
- Xoay không chuyển sang ID chưa có ảnh. Ảnh gốc được giữ nguyên byte, căn bằng renderer.

## Giới hạn ảnh hiện tại

- 20 ảnh cây còn thiếu. Ba cây táo/dừa/me vẫn dùng bộ ảnh và chu kỳ thu hoạch hiện có; năm loài mới có nhãn **Cây trang trí**, chưa cho thu hoạch.
- Chùa Lv3 tạm dùng hình Lv2 vì PNG Lv3 cắt mất móng; lợi ích nâng cấp vẫn áp dụng.
- Nguồn đường có sai số hình học: renderer dùng texture đá gốc với hành lang chuẩn và hai trục isometric, thumbnail cửa hàng dùng cùng renderer. Ngã ba và góc L xoay đủ bốn hướng qua các ID nội bộ, không thêm sản phẩm trùng trong cửa hàng. Kênh/suối chưa phải autotile đầy đủ.
- Không tạo hoặc sửa PNG trong lần tích hợp này.

## Mã liên quan

- `src/data/expansionCatalog.js`: metadata, ảnh, geometry, giá, cấp, nâng cấp.
- `src/data/shopCatalog.js`: phân tab duy nhất, dùng chung với cửa hàng.
- `src/engine/expansionRenderer.js`: vẽ module đất và thumbnail.
- `src/engine/placementSurface.js`: mặt nền hợp lệ và khôi phục nền nước.
- `tests/expansion.test.mjs`, `tests/renderLayers.test.mjs`: kiểm tra catalog, mua/đặt, nâng cấp, layer và preview.
