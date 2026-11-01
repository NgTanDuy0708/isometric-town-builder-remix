# Vùng đất và cửa hàng kim cương

Triển khai 31/10/2026: bản đầu đủ sáu chặng roadmap. Giá và thời gian là cân bằng ban đầu, cần tiếp tục chơi thử.

## Qua Rừng Cổ Thụ

Bấm **Vùng đất** trên HUD. Đạt cấp 10, thắng diễn tập ở làng và mua 8 khu đất trả phí (không tính khu khởi đầu hay biển miễn phí). Mở đường mất **500 vàng + 10 ván + 8 đá xây dựng**. Bốn khu đất quanh cổng được mở cùng tuyến đường. Chọn **Đi qua cổng** để đổi vùng, quay lại bằng cùng bảng.

Map rừng có cây, điểm khai thác, nhà dân, kho, xưởng mộc trung tâm, tháp canh và tuyến đường. **Trạm kiểm lâm** chỉ bán/xây tại rừng, mở cấp 10, dùng họ ảnh ba cấp xưởng gỗ. Cấp 1/2/3 có 2/3/4 chỗ. Công nhân đi tới **Cây cổ thụ**, khai thác rồi đưa gỗ cổ thụ về kho chung; mỗi cây có 15 đơn vị và hồi sau 120 giây chạy game khi cạn. Xưởng mộc [16,13] là tiền đồn cố định thay Tòa thị chính trong phòng thủ rừng.

Ba nhiệm vụ nhận theo thứ tự, mỗi nhiệm vụ một lần:

| Nhiệm vụ | Điều kiện giao | Thưởng |
|---|---|---|
| Khôi phục tiền đồn | 20 gỗ, 10 đá, 5 thỏi sắt | 250 vàng + 3 kim cương |
| Bí mật cây cổ thụ | 10 gỗ cổ thụ | 400 vàng + 5 kim cương |
| Bảo vệ khu rừng | Thắng và nhận thưởng một đợt thật tại rừng | 500 vàng + 8 kim cương |

## Dữ liệu giữa vùng

Hai vùng dùng **chung vàng, kim cương, kho, sức chứa, cấp độ và dân số**. Nhà đã hoàn tất ở cả hai vùng góp dân; công việc ở vùng kia giữ suất trước khi mua luống/thuê/huấn luyện tại đây. Gỡ nhà bị chặn nếu tổng công việc sẽ thiếu người. HUD đếm nông dân/công nhân/lính tại vùng đang xem; tổng dân và dân rảnh tính toàn vương quốc.

Grid, địa hình, rào, cây trồng, vật nuôi, công trình, nâng cấp, hàng đợi, công nhân, phần ăn chuẩn bị, quân, phòng thủ và vị trí kỳ quan lưu riêng. Snapshot đang xem ở cấp chính của save; `world.regions` chỉ giữ vùng còn lại, không có hai nhóm lao động sống của cùng một vùng.

Khi game chạy, vùng kia dùng cùng manager khai thác, sản xuất và phòng thủ. Công nhân tiếp tục nhập kho/ăn và dừng khi đầy kho. Mỗi vùng giữ tiến độ bữa cho lao động tại đó. Xây, nâng cấp và vật nuôi hoàn tất theo giờ lưu; thành phẩm chờ thu. Quân tiếp tục huấn luyện/hồi máu, các đợt đã bật có thể xảy ra ở vùng kia; thông báo có tên vùng và bảng Vùng đất báo tình trạng. Hoàn thành trận hiện tại và hủy thao tác đặt/di chuyển trước khi rời vùng. Khai thác, ăn và chiến đấu không truy thu offline.

Save cũ ở làng, chưa mở rừng. Save/load, JSON xuất/nhập và reset có `world` + `premium`. Kỳ quan lấy vị trí từ snapshot vùng, không lấy nhầm cache vùng vừa xem. Chuyển vùng gặp lỗi lưu sẽ quay lại vùng cũ.

## Quái cấp cao

- Cấp 6–9: goblin. Từ cấp 10, đợt chẵn ở làng có quái rừng; mọi đợt thật tại rừng dùng quái rừng nếu chưa tới đợt rồng.
- Từ cấp 12, mỗi đợt thứ 3 có một rồng: máu 180 + 8 × min(10, số đợt), tốc độ 0,55 ô/giây, tầm lửa 2,5 ô, 12 sát thương/giây và 6 sát thương phụ lên quân quanh mục tiêu trong 1,2 ô. Rồng bay qua vật cản; chỉ tháp/pháp sư đánh được. Vệ binh chặn quái đi bộ.
- Quái rừng có máu 70 + 5 × min(10, số đợt), tốc độ 0,45 ô/giây, 11 sát thương/giây. Đợt thật có 2–4 con.
- Thắng rồng thật thêm 100 vàng, XP là 80, có 1 kim cương. Thắng quái rừng thêm 40 vàng, XP là 55. Nhận một lần cùng snapshot phòng thủ; diễn tập lại không thưởng.
- Sau diễn tập goblin đầu có nút diễn tập quái rừng cấp 10 và rồng cấp 12. `/combat-preview` chọn được ba loại đợt, xem năm nhóm sprite. Atlas mới có 4 hướng × 4 tư thế, rồng đập cánh/quái đi và vung gậy. Công nhân dùng sheet đi bộ bốn hướng hiện có.

## Cửa hàng kim cương

Bấm **Cửa hàng 💎**:

| Gói | Giá | Nhận |
|---|---|---|
| Túi vàng | 5 kim cương | 500 vàng |
| Rương vàng | 20 kim cương | 2.200 vàng |
| Tượng hiệp sĩ | 12 kim cương | 1 vật phẩm vào túi |
| Cờ hoàng gia | 8 kim cương | 1 vật phẩm vào túi |
| Kỷ vật rừng | 5 gỗ cổ thụ | 1 vật phẩm vào túi |

Trang trí dùng PNG hiện có, không tăng sát thương/dân số. Chọn vị trí đặt từ túi; ô phải trống, mở khóa, ngoài footprint và kỳ quan. Đặt sai/hủy không trừ món. **Gỡ** trả món sưu tầm về túi, di chuyển giữ món. Receipt + số thứ tự chặn nhấp lặp/nút cũ; số dư và hàng ghi cùng nhau. Lưu lỗi hoàn lại số dư, tồn kho và vị trí. Không có thanh toán tiền thật.

Map núi/đảo, thêm loài quái, đoàn vận tải và vật phẩm mùa là các mở rộng sau phạm vi bản đầu.
