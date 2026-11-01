# Lương thực công nhân và lính

Lính đã dùng chung state khẩu phần với công nhân. Mỗi lính được cấp suất dân, chưa xin nghỉ cũng cần 1 khẩu phần/120 giây chạy game, kể cả huấn luyện và dưỡng thương. Thiếu ăn giảm nhịp đánh và tiến độ huấn luyện còn 50%; di chuyển và hồi máu ngoài trận giữ nguyên. Không có một lần trừ thức ăn riêng ở hệ thống quân đội. Tổng nhu cầu công nhân + lính và loại thức ăn được phép dùng hiện trong bảng công nhân và bảng phòng thủ.

Mở **Quản lý công nhân → Lương thực công nhân**. HUD dân số cho biết khẩu phần có thể dùng, nhu cầu/phút hoặc cảnh báo thiếu ăn.

## Giá trị thức ăn

| Loại | Khẩu phần / 1 vật phẩm | Tự dùng mặc định |
|---|---|---|
| Bánh mì | 4 | Bật |
| Thịt heo nướng | 8 | Tắt |
| Bắp ngô | 1 | Bật |
| Lúa mì | 1 | Bật |

Thứ tự dùng như bảng, chỉ lấy loại đã bật. Đổi lựa chọn trong bảng công nhân nếu cần giữ ngô cho vật nuôi, lúa cho lò bánh hoặc món ăn cho đơn hàng. Mọi nguyên liệu lấy từ kho hiện có. Không có loại tài nguyên “lương thực” riêng trùng với tồn kho.

Khi đến bữa và hết phần đã chuẩn bị, hệ thống lấy đúng 1 vật phẩm từ kho và quy đổi. Ví dụ 1 bánh mì trả bữa hiện tại, giữ 3 phần còn lại. Đây là phần của món đã lấy khỏi kho, không chiếm kho thêm lần nữa. Đổi lựa chọn, cho nghỉ hoặc tải lại vẫn giữ các phần đã chuẩn bị.

## Mức tiêu thụ và hiệu suất

- Mỗi công nhân trong suất dân, chưa xin nghỉ: 1 khẩu phần/120 giây game chạy, tương đương 0,5 khẩu phần/phút. Bốn người dùng 2 khẩu phần/phút. Giá trị này là mức cân bằng thử nghiệm.
- Nhu cầu tính chung theo thời gian và số người hiện tại. Thuê thêm, giảm dân hoặc cho nghỉ thay đổi tốc độ tích lũy ngay; không đặt lại tiến độ để né bữa. Công nhân chờ tài nguyên/đường đi/kho vẫn cần ăn.
- Người xin nghỉ và người tạm ngừng vì thiếu suất dân không tiêu thụ. Hiện tại nông dân và dân rảnh không tiêu thụ. Save nhập bị dư việc: ưu tiên nông dân rồi công nhân, số suất còn lại mới dành cho lính; lính vượt số đó tạm dừng, không bị xóa.
- Khi đến bữa mà không đủ phần ăn, tốc độ đốn/đào còn 50% (6 giây công việc thành 12 giây). Không mất dân, không mất hàng, không giảm tốc độ đi lại/giao hàng/về xưởng.
- Thu hoạch lúa/ngô hoặc nhận bánh mì, bật loại đó nếu đang tắt: bữa được trả và công nhân phục hồi ở nhịp chạy kế tiếp. Lúa và ngô dùng trực tiếp nên không bắt buộc có lò bánh để thoát thiếu ăn.
- Bữa thiếu dừng ở 1 khẩu phần chung đang chờ; không tích nợ nhiều giờ khiến người chơi không thể phục hồi. Khi đã có thức ăn, trả bữa đó rồi tiếp tục tính thời gian bình thường.

Kho đầy không chặn việc ăn: lấy một món ra sẽ giải phóng đúng chỗ của món đó. Nguyên liệu đã giữ cho mẻ chế biến không còn trong kho nên công nhân không thể ăn trùng. Thức ăn cũng có thể dùng hết trước khi thêm mẻ mới; giao diện xưởng kiểm tra tồn kho thực tế.

## Lưu game và thời gian

Tiến độ bữa, phần đã chuẩn bị và lựa chọn thức ăn nằm trong `extraction.food`. Save/load, xuất/nhập dùng cùng state. Save cũ chưa có mục này bắt đầu với tiến độ 0 và lựa chọn mặc định; không truy thu thời gian đã chơi trước đó. Reset đặt lại cùng tiến trình game.

Chỉ tính thời gian của vòng khai thác đang chạy; đóng game không trừ món hoặc tích nợ. Không dùng đồng hồ thực để tính ăn offline. Khoảng thời gian lớn khi trở lại tab được giới hạn cùng nhịp khai thác hiện có.
