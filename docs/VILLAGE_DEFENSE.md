# Phòng thủ làng — bản đầu

## Bắt đầu

1. Đạt cấp người chơi 6. Tháp canh đã mở trong Cửa hàng → Sản xuất từ cấp 4, có thể xây trước.
2. Hoàn tất ít nhất một Tháp canh. Chừa đường hoặc đất trống từ rìa vùng đất đã mở đến tháp và Tòa thị chính.
3. Bấm **Phòng thủ làng** ở HUD dân số hoặc bấm trực tiếp tháp. Chọn **Bắt đầu diễn tập goblin**.
4. Sau 15 giây cảnh báo, ba goblin xuất hiện lần lượt ở rìa đất đã mở. Tháp tự bắn địch trong tầm.
5. Thắng thì mở bảng để nhận 80 vàng + 30 XP và bấm **Tiếp tục**. Thưởng chỉ nhận một lần. Thua/rút lui có thể sửa và diễn tập lại; khi đã thắng không diễn tập lại để kiếm thưởng.

## Các đợt ngẫu nhiên

Chỉ sau khi thắng diễn tập mới có thể bật **Tấn công ngẫu nhiên**. Save cũ, game mới và reset đều chưa bật. Lần đầu bật có 300 giây chuẩn bị; sau mỗi kết quả đã xem, thời gian chờ tiếp theo được chọn trong khoảng 480–720 giây. Trước giao chiến có thêm 60 giây cảnh báo.

Tắt lịch sẽ dừng các đợt sau. Nếu đang chuẩn bị, đồng hồ tạm dừng và bật lại tiếp tục đúng phần còn lại. Nếu đã có cảnh báo hoặc giao chiến, đợt đó vẫn diễn ra. Kết quả giữ nguyên cho đến khi người chơi xem và tiếp tục, nên không có đợt kế tiếp chồng lên bảng kết quả.

HUD hiển thị đếm ngược/cảnh báo/kết quả. Cấp độ tụt hoặc không có tháp hoạt động sẽ tạm dừng chuẩn bị; sửa/xây lại để tiếp tục. Nếu không tìm được lối vào, hệ thống nhắc chừa đường và thử lại sau 30 giây, không tự sinh goblin trong công trình.

## Giao chiến

| Cấp tháp | Sát thương mỗi phát | Chu kỳ | Tầm theo ô |
|---|---|---|---|
| 1 | 18 | 1 giây | 4 |
| 2 | 24 | 1 giây | 4,5 |
| 3 | 30 | 1 giây | 5 |

Mỗi tháp có 100 độ bền. Nâng cấp tăng tầm và sát thương; không tạo dân hoặc lính. Tháp không dùng lương thực ở bản đầu.

Goblin diễn tập có 30 máu, gây 7 sát thương mỗi giây. Đợt thật bắt đầu từ 3 goblin, tối đa 6; máu tăng theo đợt, chặn ở 70, sát thương chặn ở 13/giây. Tốc độ đi là 0,65 ô/giây. Mỗi con cách nhau 3 giây khi xuất hiện.

Goblin tìm tháp gần nhất còn độ bền, đứng cạnh để đánh; nếu không còn tháp hoạt động thì tới Tòa thị chính. Đường đi chỉ qua ô cỏ, cát/đường đã mở; nhà, ruộng, tài nguyên, nước và kỳ quan chặn đường. Tháp có thể bắn qua vật cản trong tầm; bản đầu chưa mô phỏng đường bay va chạm của mũi tên.

Tiêu diệt hết địch là thắng. Sức phòng thủ làng về 0 là thua. Trận đạt 120 giây mà vẫn còn địch hoặc không thể tiếp cận thì goblin rút lui, không có thưởng diệt địch. Thưởng đợt thật là 80 + 10 × số đợt vàng (tối đa 180) và 40 XP.

## Thiệt hại và sửa chữa

- Chỉ độ bền tháp và sức phòng thủ làng bị giảm; không xóa ô công trình, lấy tài nguyên, giết dân hoặc làm ngừng ruộng/xưởng khai thác.
- Tháp về 0 ngừng bắn. Sửa tháp mất 20 vàng + 1 gỗ + 1 đá, hồi về 100.
- Làng có 100 sức phòng thủ. Sửa mất 50 vàng + 2 gỗ + 2 đá, hồi về 100. Đây là trạng thái phòng thủ của Tòa thị chính; công trình gốc không bị xóa khi thua.
- Chỉ sửa ngoài thời gian cảnh báo/giao chiến. Thiếu tiền/vật liệu thì không trừ gì. Công nhân vẫn có thể kiếm gỗ/đá để phục hồi.
- Chưa cho di chuyển/gỡ tháp trong cảnh báo/giao chiến hoặc khi tháp còn hư, tránh làm lệch mục tiêu và mất tình trạng độ bền. Sửa xong mới di chuyển/gỡ được.

## Save và offline

State `defense` được ghi cùng snapshot vàng, vật phẩm và bản đồ trong save chính, xuất/nhập JSON. Gồm nhiệm vụ diễn tập, lịch bật/tắt, thời gian còn lại, wave ID, vị trí/máu địch, độ bền và cờ thưởng đã nhận. Tải lại không bắt đầu trận mới và không nhận lại thưởng. Đường đi được tính lại theo bản đồ hiện tại.

Chỉ tính các nhịp game đang chạy, mỗi nhịp giới hạn 0,25 giây. Đóng game hoặc quay lại sau khoảng nghỉ không truy thu nhiều trận. Save cũ thiếu trường này bắt đầu với phòng thủ chưa bật; reset xóa cùng tiến trình game.

Goblin hiện dùng SVG tạm; tháp dùng bộ ảnh có sẵn. Lính, trại huấn luyện, pháp sư và rồng chưa thuộc bản này.
