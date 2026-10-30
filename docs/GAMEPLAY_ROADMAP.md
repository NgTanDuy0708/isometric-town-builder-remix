# Roadmap phát triển gameplay

Ngày lập: 30/10/2026. Trạng thái: kế hoạch thiết kế; các mục dưới đây chưa được triển khai theo roadmap này.

## Vòng chơi hướng tới

Xây nhà → có dân rảnh → phân công làm nông hoặc khai thác → tích lũy nguyên liệu → xây và nâng cấp → chuẩn bị phòng thủ → mở vùng đất mới.

Mục tiêu là tạo thêm quyết định cho người chơi: dùng dân, đất và tài nguyên vào việc gì; mỗi map mới mang lại tài nguyên và tình huống mới để tiếp tục phát triển.

## Những hướng đã thống nhất

- Nhà khởi đầu có 4 dân; nếu cả 4 đều rảnh thì có thể mua 4 luống đất.
- Mỗi luống giữ 1 suất dân phụ trách. Mua luống giảm dân rảnh; gỡ luống trả lại suất dân.
- Thu hoạch xong hoặc để luống trống vẫn giữ người phụ trách.
- Tổng dân rảnh được tính sau khi trừ nông dân, công nhân và binh lính.
- Mở map mới theo nhiệm vụ và mốc phát triển, có thể quay lại map cũ.
- Mỗi map có tài nguyên, chức năng hoặc sự kiện riêng.

Các chi tiết về giá, thời gian, cấp mở khóa, mức thiệt hại và cách hoạt động khi offline ở bên dưới là đề xuất cần cân bằng thêm.

## Thứ tự triển khai

| Chặng | Kết quả người chơi nhận được | Phụ thuộc |
|---|---|---|
| 1. Dân số và luống đất | Nhà ở quyết định số luống có thể mở | Hệ thống nhà, ruộng và save hiện tại |
| 2. Công nhân khai thác | Người lao động đi lấy gỗ, đá và quặng về kho | Chặng 1 |
| 3. Chế biến và lương thực | Nguyên liệu có đầu ra và dân có nhu cầu phục vụ | Chặng 2 |
| 4. Phòng thủ và quái vật | Chuẩn bị tháp, lính, pháp sư để bảo vệ làng | Chặng 1–3 |
| 5. Map tiếp theo | Vùng đất mới có nội dung riêng, làng cũ tiếp tục hoạt động | Kinh tế và save ổn định; phòng thủ cho map có chiến đấu |
| 6. Cửa hàng kim cương | Vật phẩm hiếm và đổi kim cương lấy vàng | Giá trị tài nguyên và chi phí phát triển đã cân bằng |

Không gắn lịch cố định trước khi chốt phạm vi từng chặng. Hoàn thành và kiểm tra một chặng rồi mới mở rộng sang chặng kế tiếp.

## Chặng 1 — Dân số và giới hạn luống đất

### Phạm vi

- Tính tổng dân từ nhà đã xây xong và cấp nâng cấp đã hoàn tất; không đếm theo số nhân vật đang được vẽ trên đường.
- Quản lý số dân rảnh, nông dân, công nhân và binh lính trong cùng một hệ thống phân công.
- Bản đầu chỉ triển khai nông dân; các nghề còn lại được bổ sung ở các chặng sau.
- Một luống đã mua giữ một suất dân xuyên suốt chu kỳ gieo, lớn và thu hoạch.
- Số luống mua thêm tối đa bằng dân rảnh, đồng thời vẫn phải đủ vàng và có đất hợp lệ.
- Di chuyển hoặc xoay luống không đổi số dân đã phân công.
- Gỡ luống giải phóng đúng một suất dân. Hủy thao tác đặt hoặc đặt thất bại không mất dân/vàng.
- Hiện rõ trong cửa hàng và HUD: tổng dân, dân rảnh, dân làm nông; ví dụ “Mỗi luống cần 1 người — còn 2 dân rảnh”.
- Khi hết dân, hướng dẫn xây hoặc nâng cấp nhà ở.

### Quy tắc tránh lách giới hạn

- Dừng gieo trồng hoặc bỏ trống luống không giải phóng suất dân.
- Chuyển nghề không được tạo ra việc cùng một người vừa giữ luống vừa khai thác hay chiến đấu. Luống cần người thay thế hoặc phải được gỡ để trả suất dân.
- Chặn phá nhà nếu việc đó làm thiếu dân cho các công việc đang được giữ; giải thích người chơi cần giải phóng công việc trước.
- Save cũ có nhiều luống hơn dân: giữ nguyên ruộng và cây đã có, hiển thị số dân còn thiếu và chặn mua thêm đến khi đủ dân. Không tự xóa ruộng hoặc tài nguyên.

### Tiêu chí hoàn thành

- Nhà đầu 4 dân mua được 4 luống; lần mua thứ 5 bị chặn với lý do rõ ràng.
- Gỡ một luống rồi mua lại được một luống; di chuyển, hủy đặt và tải lại game không nhân đôi dân.
- Công thức phân công, số dân trên HUD và dữ liệu save luôn khớp nhau.
- Bản đồ dev, reset game và save cũ đều đi qua cùng quy tắc dân số.

## Chặng 2 — Xưởng công nhân và khai thác

### Phạm vi

- Xưởng khai thác có số vị trí làm việc giới hạn; người chơi thuê/phân công dân rảnh vào các vị trí đó.
- Bắt đầu với gỗ và đá. Bổ sung quặng sắt sau khi hai chuỗi đầu hoạt động ổn định.
- Công nhân đi từ xưởng tới điểm tài nguyên, làm việc, mang hàng về và nhập kho. Hàng chưa về kho chưa được tiêu để xây dựng.
- Mỗi công nhân chỉ có một công việc tại một thời điểm; đổi nghề và chuyển xưởng phải cập nhật số dân tương ứng.
- Có trạng thái dễ hiểu: đang đi, đang làm, đang mang về, kho đầy, hết tài nguyên hoặc không có đường.
- Khi kho đầy, chờ giao hàng tiếp; không âm thầm làm mất hàng hay tạo thêm vô hạn.
- Điểm khai thác có sức chứa và quy tắc hồi phục/tìm điểm mới. Phân biệt tài nguyên khai thác với cây trang trí.

### Tiêu chí hoàn thành

- Có thể quan sát trọn một chuyến lấy hàng và thấy tài nguyên tăng đúng lúc nhập kho.
- Một dân không thể đồng thời làm nông và làm công nhân.
- Mất đường, hết điểm khai thác, chuyển xưởng và tải lại game đều xử lý được mà không kẹt hoặc nhân đôi hàng.
- Người chơi luôn có cách tiếp tục kiếm nguyên liệu cơ bản khi một điểm khai thác cạn.

## Chặng 3 — Chế biến, xây dựng và lương thực

### Phạm vi đề xuất

- Gỗ → ván; đá → đá xây dựng; quặng sắt → thỏi sắt → dụng cụ hoặc vũ khí.
- Công trình mới và nâng cấp bắt đầu dùng nguyên liệu phù hợp thay vì chỉ dùng vàng.
- Chốt quan hệ giữa nông sản hiện tại và lương thực: chọn những nông sản/món ăn được dùng nuôi dân, có giá trị quy đổi rõ ràng; tránh hai loại tồn kho có cùng chức năng khó hiểu.
- Thêm nhu cầu lương thực theo quy mô lao động và quân đội, có thể nhìn được mức sản xuất/tiêu thụ.
- Thiếu lương thực trước hết gây cảnh báo và giảm hiệu suất. Mức phạt cụ thể cần thử nghiệm; không dùng mất dân đột ngột làm mặc định.
- Nâng cấp xưởng giúp tăng số chỗ làm hoặc hiệu suất; bản đầu giữ 1 nông dân/luống.

### Tiêu chí hoàn thành

- Người chơi đi được một chuỗi hoàn chỉnh: khai thác → chế biến → dùng sản phẩm nâng cấp một công trình.
- Nguyên liệu đầu vào/đầu ra, kho và nhu cầu dân số không tạo vòng lặp khiến người chơi không thể phục hồi.
- Khi mở tính năng mới, luôn có đủ phương án kiếm nguyên liệu để xây công trình đầu tiên của chuỗi.

## Chặng 4 — Phòng thủ làng và các đợt tấn công

### Phạm vi đề xuất

- Mở bằng nhiệm vụ ở ngưỡng cấp phù hợp. Có thời gian xây tháp và huấn luyện đội quân đầu tiên trước trận thật.
- Đợt đầu dùng goblin đơn giản. Sau khi ổn định mới bổ sung quái rừng, pháp sư địch và rồng ở tiến trình cao.
- Đợt tấn công có khoảng thời gian ngẫu nhiên trong giới hạn, kèm dấu hiệu hoặc cảnh báo để chuẩn bị; không sinh địch liên tục chỉ vì vừa đăng nhập.
- Tháp giữ khu vực, lính chặn địch, pháp sư hỗ trợ hoặc đánh diện rộng. Lính và pháp sư chiếm suất dân và có chi phí huấn luyện.
- Bản đầu ưu tiên quân và tháp tự chiến đấu. Điều quân trực tiếp hoặc phép chủ động là lựa chọn mở rộng chưa chốt.
- Thua trận có thể làm công trình hư, giảm hiệu suất hoặc tạm ngừng hoạt động; cho sửa bằng tài nguyên.
- Đề xuất không phá mất vĩnh viễn công trình đã mua và không cho tổn thất offline cộng dồn không giới hạn. Quy tắc offline phải chốt trước khi bật tấn công ngẫu nhiên.

### Tiêu chí hoàn thành

- Một trận có đủ cảnh báo → xuất hiện địch → phòng thủ → kết quả → sửa chữa/phần thưởng.
- Người chơi dùng tài nguyên kiếm trong game vẫn xây được phòng thủ đủ tốt cho tiến trình của mình.
- Có cơ hội phục hồi sau khi thua, không rơi vào vòng thua liên tiếp vì thiếu nguyên liệu sửa làng.
- Thoát/tải lại giữa trận không nhân đôi phần thưởng hoặc tạo trận tấn công mới.

## Chặng 5 — Mở map mới

### Phạm vi

- Mở bằng nhiệm vụ, cấp độ, mức khai phá lãnh thổ và công trình kết nối như cầu/cổng. Không bắt buộc mua hết mọi ô đất.
- Bản đầu thêm một map mới có nét riêng, ví dụ vùng rừng khai thác; map núi và đảo là các lần mở rộng sau.
- Có thể qua lại giữa các map; công trình, ruộng, địa hình và trạng thái sự kiện của mỗi map được lưu riêng.
- Đề xuất dùng chung tài nguyên, vàng và kim cương ở bản đầu. Mỗi dân chỉ có một nơi làm việc; chuyển người sang map mới không tạo bản sao lao động.
- Chốt thời gian sản xuất khi người chơi đang xem map khác, tương thích với giới hạn kho và quy tắc offline.
- Map mới có tài nguyên/nhiệm vụ/sự kiện riêng thay vì chỉ thêm diện tích trống.
- Vận chuyển hàng giữa map và đoàn thương nhân có thể bổ sung sau khi bản nhiều map ổn định.

### Tiêu chí hoàn thành

- Mở khóa, đi sang map mới, quay lại và tải lại game mà không mất tiến trình ở bất kỳ map nào.
- Dân, tài nguyên và thời gian sản xuất được tính đúng một lần.
- Có chuỗi mục tiêu mới để người chơi tiếp tục phát triển sau map đầu.

## Chặng 6 — Cửa hàng kim cương và đổi vàng

### Phạm vi đề xuất

- Bán vật phẩm hiếm, ngoại hình công trình, trang trí, thú cưng hoặc tiện ích có giá trị rõ ràng.
- Vật phẩm không thể đặt được phải có giải thích; hàng mua thành công được lưu bền vững.
- Chỉ mở đổi kim cương → vàng trong bản đầu. Gói đổi hiển thị rõ số tiền mất và nhận.
- Đặt tỷ lệ đổi sau khi cân bằng tiền thuê người, xây dựng, huấn luyện và sửa chữa.
- Tránh vật phẩm bắt buộc mua bằng kim cương để thắng các trận tấn công thông thường.
- Giao dịch trừ tiền và trao hàng cùng nhau; nhấp nhiều lần hoặc tải lại không được mất tiền hay nhận trùng.

### Tiêu chí hoàn thành

- Mua và đổi tiền chỉ xảy ra khi đủ số dư, kết quả đúng và tồn tại sau khi tải lại.
- Người chơi kiếm được tài nguyên trong game vẫn có tiến trình phát triển và phòng thủ đầy đủ.

## Quy tắc chung cho mọi chặng

- Tương thích save cũ, bản đồ dev, reset và xuất/nhập save.
- Thông báo rõ vì sao thao tác bị chặn và người chơi cần làm gì tiếp theo.
- Kiểm tra đường đi, va chạm, kho đầy, hủy thao tác, tải lại và hoạt động giữa các map khi có liên quan.
- Dùng một nguồn tính dân số/phân công chung để HUD, cửa hàng và hệ thống sản xuất không tự tính khác nhau.
- Chỉ phát triển thêm ảnh/hoạt hình sau khi vòng chơi tối thiểu của chặng đã hoạt động; ảnh mới cần có điểm neo và footprint đúng.
- Chốt giá và thời gian qua chơi thử. Các số cụ thể ngoài 4 dân khởi đầu và 1 dân/luống chưa phải quyết định cuối cùng.

## Mốc bắt đầu

Chặng triển khai đầu tiên là **Dân số và giới hạn luống đất**. Hoàn thành riêng vòng nhà ở → dân rảnh → mua/gỡ luống → lưu/tải, trước khi bổ sung công nhân đi rừng hoặc chiến đấu.
