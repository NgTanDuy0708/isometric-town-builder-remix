# Trại huấn luyện và lính cận chiến

## Chơi như thế nào

Đạt cấp 6, vào **Cửa hàng → Sản xuất → Trại huấn luyện vệ binh**. Trại giá 220 vàng, xây 45 giây, chiếm 1 ô. Chừa lối đất trống/đường cạnh trại và tới khu phòng thủ.

Bấm trại hoặc **Phòng thủ làng**, xem mục **Trại và lính cận chiến**. Mỗi lính cần **1 dân rảnh + 50 vàng + 1 dụng cụ sắt**, huấn luyện trong 20 giây game chạy. Kho bị trừ vật liệu và dân giữ suất ngay khi bắt đầu. Không có khoản thu lại nếu sau đó cho nghỉ.

| Cấp trại | Tổng chỗ (huấn luyện + đồn trú) | Giá nâng cấp |
|---|---|---|
| 1 | 2 | Xây bằng vàng |
| 2 | 4 | 180 vàng + 3 ván + 3 đá xây dựng + 2 dụng cụ |
| 3 | 6 | 360 vàng + 6 ván + 6 đá xây dựng + 4 dụng cụ |

Nâng cấp tăng chỗ; vẫn cần dân rảnh và trả từng lần huấn luyện. Không tạo thêm dân. Cùng một người không thể đồng thời làm nông, khai thác và làm lính; nhà đang cấp đủ dân cho lính cũng được bảo vệ khỏi gỡ gây thiếu người.

## Tự bảo vệ và phục hồi

- Lính hoàn tất có 60 máu, đánh cận chiến trong khoảng 1 ô, 12 sát thương mỗi nhịp 1 giây, đi 1,1 ô/giây.
- Ngoài trận đứng ở trại; khi giao chiến tự tìm goblin gần nhất, đi trên đất trống/đường đã mở, chặn và đánh khi đứng sát. Không xuyên nhà, ruộng, nước, kỳ quan hoặc đất khóa. Bị chặn đường thì chờ/tìm lại đường.
- Goblin gặp lính còn máu đứng sát sẽ dừng đánh lính trước khi đánh tháp/làng. Tháp vẫn tự bắn trong tầm.
- Máu về 0: lính rút về trại, không đánh tiếp trong trận. Sau khi hết trận và đã về trại, hồi 2 máu/giây đến 60. Không mất người hoặc phải trả tiền huấn luyện lại; vẫn giữ suất dân.
- **Cho lính nghỉ** chỉ dùng ngoài cảnh báo/giao chiến. Nếu đang huấn luyện thì dừng huấn luyện; nếu đang ngoài trại thì về trại trước. Suất dân chỉ trả khi người đó đã về và được gỡ khỏi phân công. Trại có phân công chưa cho di chuyển/gỡ bỏ.

## Lương thực và save

Mỗi lính trong suất dân và chưa xin nghỉ cần 1 khẩu phần/120 giây game chạy, kể cả huấn luyện hoặc dưỡng thương. Dùng chung thức ăn và phần đã chuẩn bị của [lương thực công nhân](WORKER_FOOD.md). Bấm **Chọn lương thực cho công nhân và lính** để đổi loại được dùng.

Thiếu ăn làm huấn luyện và nhịp đánh chậm gấp đôi; đi/về trại và hồi máu giữ nguyên. Không tích nợ thức ăn vô hạn. Lính xin nghỉ hoặc tạm dừng do save dư việc không tiêu thụ.

`defense.soldiers` lưu trại gốc, vị trí, máu, tiến độ huấn luyện, trạng thái xin nghỉ và hồi chiêu. Xuất/nhập dùng cùng save với kho và khẩu phần. Tải lại tính lại đường đi, giữ tiến độ/máu; không thu phí lại hoặc tự hoàn tất huấn luyện offline. Reset xóa lính cùng tiến trình game. Save cũ không có lính sẽ không tự tuyển.

Trại có ba PNG riêng cho ba cấp. Vệ binh dùng sheet PNG nền trong suốt gồm 4 hướng × 8 tư thế: đứng, 4 bước đi, 2 khung chém và bị đánh. Khung đi tiến theo quãng đường thật; điểm chân của mỗi tư thế bám cùng vị trí world. Thanh máu xanh vẫn ở lớp trên công trình. [Pháp sư](MAGES.md) dùng cùng hệ thống phân công, save và khẩu phần; điều quân thủ công chưa triển khai. Có thể kiểm tra cả trận và từng động tác tại **Phòng thủ làng → Xem mô phỏng trận và toàn bộ động tác**, không làm thay đổi save.
