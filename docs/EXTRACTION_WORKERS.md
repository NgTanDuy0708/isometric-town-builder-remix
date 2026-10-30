# Công nhân khai thác gỗ, đá và quặng sắt

## Chơi như thế nào

1. Xây nhà để có dân rảnh. Dân đã phụ trách luống chưa thể thuê vào xưởng.
2. Xây Kho Tổng Hợp, chừa lối đất trống hoặc đường quanh kho.
3. Xây Xưởng mộc, Xưởng khai thác đá hoặc Mỏ sắt (đều mở từ cấp người chơi 4), trong Cửa hàng → Sản xuất. Mỏ sắt giá 180 vàng, xây trong 45 giây.
4. Bấm xưởng hoặc nút **Quản lý công nhân** trong HUD, thuê từng người với 30 vàng/người, trả một lần.
5. Công nhân tự tìm điểm tự nhiên phù hợp, khai thác rồi mang về kho. Gỗ, đá và quặng hiện trong Kho Tổng Hợp và nhóm Nguyên liệu khai thác ở Chợ.
6. Bấm **Chế biến nguyên liệu** tại Xưởng mộc/Xưởng đá để làm ván/đá xây dựng. Bấm Lò rèn để luyện thỏi và làm dụng cụ. Xem [Chuỗi nguyên liệu](MATERIAL_CHAINS.md).
7. Trong **Lương thực công nhân**, chọn loại có thể dùng. Mỗi người cần 1 khẩu phần/120 giây chơi; bánh mì cho 4 khẩu phần, ngô/lúa mì cho 1, thịt nướng cho 8 (cần bật thêm). Thiếu ăn làm đốn/đào chậm gấp đôi, không làm mất dân hoặc hàng. Xem [Lương thực công nhân](WORKER_FOOD.md).

Nhà hoàn tất mới cung cấp dân. Xưởng cấp 1 có 2 chỗ làm việc; nâng cấp lên 2/3 tăng thành 3/4 chỗ, vẫn cần thuê thêm người. Thuê không tăng dân số.

## Trạng thái và bảo toàn tài nguyên

- Điểm gỗ/đá/quặng tự nhiên khác với cây trang trí mua trong cửa hàng; không di chuyển hoặc phá dỡ chúng. Mỗi loại có 2 điểm. Điểm mới chỉ được đặt vào ô cỏ trống đã mở khóa, tránh công trình, hàng rào và kỳ quan. Save cũ kín đất sẽ thử lại sau khi có ô trống; save đã có gỗ/đá được bổ sung điểm quặng.
- Mỗi điểm có 30 đơn vị; khi hết sẽ tự hồi sau 60 giây chạy game. Hai công nhân cùng khai thác không lấy trùng lượng còn lại.
- Mỗi lần làm việc mất 6 giây và lấy tối đa 2 đơn vị. Tài nguyên rời điểm khai thác trở thành hàng đang mang, chưa cộng vào kho.
- Công nhân chỉ cộng hàng khi tới ô trống/đường sát Kho Tổng Hợp. Kho đầy hoặc đạt giới hạn mỗi loại thì giữ nguyên túi hàng và chờ chỗ trống.
- Đất chưa mở khóa, nước và công trình chặn đường đi. Khi đường bị chặn, công nhân tìm lại đường; bảng công nhân giải thích nếu không thể tới điểm khai thác/kho.
- Cho nghỉ: công nhân ngừng lấy chuyến mới, giao hàng đang mang và trở về xưởng, sau đó mới trả lại suất dân. Chưa về thì vẫn được tính là đang làm việc.
- Cần cho toàn bộ công nhân của xưởng nghỉ xong trước khi di chuyển/gỡ xưởng. Di chuyển kho cũng yêu cầu cho công nhân nghỉ để giữ tuyến giao hàng. Nhà đang cung cấp dân cho công nhân không thể bị phá nếu làm thiếu dân.
- Khi không đủ dân do nhập save, công nhân vượt số suất được tạm dừng nhận chuyến mới; hàng đang mang vẫn có thể giao hoặc xin nghỉ.

## Lưu game

State `extraction` lưu công nhân, nơi làm việc, vị trí, hàng đang mang và trữ lượng điểm khai thác. Số dân làm công nhân được tính từ các phân công hợp lệ, dùng chung với giới hạn luống đất.

Khai thác chỉ chạy khi vòng lặp game hoạt động. Đóng game không tự cộng thêm hàng. Tải lại sẽ giữ túi hàng và tính lại đường đi; nếu đang đốn/đập đá thì bắt đầu lại lần làm việc đó. Reset xóa phân công và tạo điểm tài nguyên mới; nhập save khôi phục phân công của save được nhập.

## Phạm vi bản đầu

Gỗ, đá, quặng có thể chế biến, cất kho hoặc bán ở Chợ. Nâng cấp Xưởng đá/Mỏ sắt dùng các vật liệu đã chế biến. Lương thực chỉ áp dụng cho công nhân khai thác; binh lính và phòng thủ thuộc chặng sau. Mỏ sắt có ba PNG riêng theo cấp nâng cấp; mạch quặng sắt dùng một PNG tự nhiên riêng. Các ảnh nền trong suốt được căn chân theo alpha và dùng chung trong bản đồ, cửa hàng và xem trước khi di chuyển.
