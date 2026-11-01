# Học viện pháp sư

Đạt cấp người chơi 8 → **Cửa hàng → Sản xuất → Học viện pháp sư**. Xây học viện mất 300 vàng, 60 giây, chiếm một ô và cần lối đi trống bên cạnh. Bấm học viện hoặc **Phòng thủ làng** để huấn luyện.

Mỗi pháp sư cần **1 dân rảnh + 80 vàng + 1 dụng cụ sắt + 2 vải**, huấn luyện 30 giây chạy game. Vải có từ Xưởng dệt mở cấp 8. Phí và suất dân được giữ ngay khi thêm người; thiếu bất kỳ đầu vào nào thì không trừ gì. Đây là quân đội chung với vệ binh, không có bộ đếm dân riêng.

| Cấp học viện | Chỗ huấn luyện/đồn trú | Giá nâng cấp |
|---|---|---|
| 1 | 2 | Xây bằng vàng |
| 2 | 4 | 240 vàng + 4 ván + 4 đá xây dựng + 2 vải |
| 3 | 6 | 480 vàng + 8 ván + 8 đá xây dựng + 4 vải + 2 dụng cụ |

## Giao chiến

- Pháp sư có 40 máu, đi 1,1 ô/giây, bắn trong tầm 3 ô. Mỗi phép gây 14 sát thương, hồi chiêu 2 giây.
- Phép gây cùng lượng sát thương cho goblin trong bán kính 1 ô quanh mục tiêu; không làm mất máu quân mình, tháp hoặc công trình. Chỉ kiểm tra khoảng cách, chưa mô phỏng vật cản đường bay.
- Tự tìm vị trí đi được trong tầm bắn, không bắt buộc đi sát địch như vệ binh. Không đi xuyên nhà, ruộng, nước, đất khóa hoặc kỳ quan. Vị trí đi dở giữa hai ô vẫn hoàn tất bước để vào tầm.
- Goblin đứng sát vẫn đánh pháp sư như quân khác. Nên dùng vệ binh chặn phía trước để pháp sư đánh từ xa.
- Máu về 0 thì rút về học viện; ngoài trận và ở nhà hồi 2 máu/giây, tối đa 40. Không mất quân vĩnh viễn hoặc thu phí huấn luyện lại.

## Dân, thức ăn và lưu game

Pháp sư giữ một suất dân cả lúc huấn luyện, đồn trú hoặc dưỡng thương. Chặn mua luống/thuê người khi hết dân, chặn phá nhà làm thiếu người. Cho nghỉ ngoài cảnh báo/trận; phải về học viện mới trả suất dân. Có phân công thì chưa di chuyển/gỡ học viện được.

Dùng chung khẩu phần hiện có: 1 khẩu phần/người/120 giây game chạy, kể cả huấn luyện và dưỡng thương; không trừ một lần riêng cho pháp sư. Thiếu ăn làm huấn luyện và nhịp phép chậm gấp đôi, giữ nguyên sát thương mỗi phép, tầm, đi lại và hồi máu. Lựa chọn thức ăn ở bảng công nhân áp dụng cho cả quân đội.

Pháp sư nằm trong `defense.soldiers` với `unitType: 'mage'`. Save giữ máu, tiến độ huấn luyện và hồi phép tối đa 2 giây; tải lại tính đường mới, không trả thêm tiền hoặc tự hoàn tất offline. Quân cũ không có `unitType` vẫn là vệ binh; nhập sai loại học viện/trại không tạo một quân hợp lệ. Reset xóa cùng tiến trình chung.

Pháp sư dùng sheet PNG nền trong suốt, 4 hướng với các tư thế đứng, đi, thi triển phép và bị đánh. Học viện có ba PNG riêng cho ba cấp, điểm neo chân móng giữ cùng vị trí. Nhân vật vẽ ở lớp chiều sâu chung, thanh máu tính theo 40 máu và phép có tia/vùng tác động tím. **Phòng thủ làng → Xem mô phỏng trận và toàn bộ động tác** mở bản xem riêng không thay đổi save. Rồng, phép chủ động và điều quân thủ công chưa triển khai.
