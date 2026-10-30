# Chuỗi khai thác và chế biến

Tất cả công trình của chuỗi mở từ cấp người chơi 4. Xây nhà, Kho Tổng Hợp và thuê công nhân để lấy nguyên liệu; sau đó thêm mẻ chế biến trong từng xưởng.

| Nơi chế biến | Nguyên liệu cho 1 mẻ | Thành phẩm | Thời gian cấp 1 |
|---|---|---|---|
| Xưởng mộc → Chế biến nguyên liệu | 2 gỗ | 1 ván gỗ | 20 giây |
| Xưởng khai thác đá → Chế biến nguyên liệu | 2 đá | 1 đá xây dựng | 20 giây |
| Lò rèn | 2 quặng sắt + 1 gỗ | 1 thỏi sắt | 30 giây |
| Lò rèn | 1 thỏi sắt + 1 ván | 1 dụng cụ sắt | 45 giây |

Nâng cấp xưởng lên cấp 2/3 tăng tốc chế biến 30%/60%; mỗi mẻ vẫn dùng cùng nguyên liệu và cho 1 thành phẩm. Công nhân phụ trách khai thác; hàng đợi chế biến dùng cơ chế xưởng hiện có, không thuê thêm một dân cho mỗi mẻ.

Nguyên liệu được trừ một lần khi thêm mẻ. Hàng đợi chứa tối đa 5 mẻ, tính cả đang làm và đã xong. Hủy được mẻ đang chờ; nếu kho không đủ chỗ nhận nguyên liệu hoàn thì giữ mẻ. Mẻ đang làm tiếp tục hoàn tất. Thành phẩm chờ thu ở xưởng khi kho đầy; không mất hàng và không nhận hai lần.

Khai thác chỉ chạy khi game mở. Các mẻ chế biến đã trả nguyên liệu tiếp tục tính thời gian qua save/load theo cơ chế hàng đợi hiện có; không tự thêm mẻ khi offline. Chế biến nguyên liệu không thưởng vàng, có thưởng XP. Có thể bán thành phẩm trong Chợ.

## Dùng nguyên liệu

Nâng cấp Xưởng khai thác đá lên cấp 2 cần 120 vàng, 2 ván, 2 đá xây dựng và 1 dụng cụ. Mỏ sắt cấp 2 dùng cùng vật liệu và 160 vàng. Cấp 3 cần 4 ván, 4 đá xây dựng và 2 dụng cụ (Xưởng đá còn cần 2 bánh mì). Xưởng mộc và Lò rèn cấp 1 vẫn xây bằng vàng, nên có thể tự tạo toàn bộ đầu vào của chuỗi mà không cần vật liệu có sẵn.

Save lò rèn cũ giữ sản phẩm đã xong hoặc một mẻ tự động đang chạy với phần thưởng cũ. Sau khi nhận mẻ đó, lò chỉ sản xuất khi đặt công thức và trả nguyên liệu. Reset dùng ngay quy tắc mới.

Lương thực công nhân đã được bổ sung: [quy tắc và cách chọn thức ăn](WORKER_FOOD.md). Công trình phòng thủ và quái vật chưa triển khai.

Mỏ sắt có PNG riêng cho cả ba cấp nâng cấp; mạch quặng có PNG riêng. Bốn tài nguyên mới hiện vẫn dùng ký hiệu trong cấu hình; các icon PNG đã có được giữ nguyên. Prompt và thông tin nguồn ảnh mỏ sắt: `docs/generated-assets/iron-mine/`.
