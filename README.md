# Isometric Town Builder - Đại Vương Quốc Pixel Art

Ứng dụng mô phỏng và xây dựng đại vương quốc phong cách nghệ thuật điểm ảnh (Pixel Art) phối cảnh isometric 2:1 dimetric, lưới đại lục mở rộng **32×32 (1.024 ô gạch)** với **265 loại ô gạch**, hệ thống nông trại quét chuột liên hoàn, chuỗi sản xuất chăn nuôi, cây ăn quả, thú cưng, sự kiện lễ hội vương quốc, âm thanh 8-bit, chu kỳ ngày/đêm và thời tiết sống động.

---

## 🌟 Tính Năng Nổi Bật

1. **Đại Lục Mở Rộng 32×32 (1.024 Ô Gạch) & Khai Hoang Theo Bậc Vật Tư**:
   - Bản đồ được chia thành 64 mảnh đất (8×8 chunks, mỗi chunk 4×4 ô).
   - 16 mảnh trung tâm mở sẵn cho làng khởi đầu, 48 mảnh viền bao bọc bởi Sương Mù Khám Phá (Fog of War).
   - **Khai hoang đa dạng hóa**: Mở rộng các mảnh đất cấp cao không chỉ tốn Vàng mà còn đòi hỏi thêm 4 bậc nguyên liệu xây dựng (Gỗ tròn 🪵, Đá tảng 🪨, Gạch nung 🧱, Đinh sắt 🔩) giúp trải nghiệm mở đất có chiều sâu và bền vững.
   - Thuật toán **Viewport Culling** chỉ dựng các ô nằm trong khung nhìn, đảm bảo tốc độ khung hình 60 FPS mượt mà.
   - Bầu trời chuyển sắc động (Dynamic Sky Gradient) và thảm cỏ vô tận bao quanh 4 phía đại lục.

2. **Hệ Thống Nông Nghiệp & Quét Chuột Liên Hoàn (Sweep Harvest)**:
   - Gieo hạt và thu hoạch **10 loại nông sản** (Lúa mì, Cà rốt, Cà chua, Dâu tây, Bắp ngô, Bắp cải, Bí ngô, Dưa hấu, Nho tím, Hoa hướng dương).
   - Cơ chế công cụ: **🌾 Liềm Thu Hoạch** và **🌱 Gieo Hạt Nhanh** cho phép giữ và quét chuột liên tục qua hàng chục luống đất chín chỉ trong 1 giây, kèm hiệu ứng vệt chém pixel, âm thanh rộn ràng và nông sản bay về kho.
   - **Xẻng Nông Trại 🪓**: Hoàn tác luống đất về đồng cỏ xanh khi muốn quy hoạch lại.

3. **Cây Ăn Quả Độc Lập Thân Gỗ Ngoài Đồng Cỏ**:
   - Trồng tự do trên đất cỏ mà không chiếm luống cày: **Táo Đỏ 🍎**, **Dừa Xiêm 🥥**, và **Me Ngọt / Dưa Lưới Cổ Thụ 🍈**.
   - Cây đơm hoa kết trái theo chu kỳ, rung cây thu hoạch quả ngọt kèm vàng và điểm kinh nghiệm.

4. **Chuỗi Chăn Nuôi & Sản Xuất Thủ Công**:
   - **Chuồng Trại**: Nuôi gà lấy trứng tươi 🥚 (cho ăn lúa mì), nuôi bò lấy sữa 🥛 (cho ăn bắp ngô), nuôi cừu xén lông 🐑 (cho ăn cà rốt).
   - **Xưởng Thủ Công**: Cối xay gió nghiền bột mì, Tiệm bánh mì nướng bánh thơm phức 🍞, Lò rèn chế tác dụng cụ sắt ⚒️, Xưởng dệt vải vóc lụa là cao cấp 🧵 từ lông cừu, và **Xưởng Chế Biến Bơ Sữa 🧈** lấy sữa tươi làm bơ vàng béo ngậy.
   - Bong bóng thu hoạch nổi trực quan phía trên công trình khi đến kỳ sản xuất.

5. **Bảng Đơn Hàng Hoàng Gia & Xe Tải Giao Hàng (Order Board & Delivery Truck)**:
   - **Bản Đồ Khởi Đầu Quy Hoạch**: Tòa Thị Chính uy nghi tọa lạc ngay chính giữa vương quốc (Row 14, Col 15), trước cửa là quảng trường đá và trục đường đá thẳng tắp dẫn ra khỏi thị trấn (Row 16 đến 31, Col 15).
   - **Bảng Đơn Hàng Gỗ & 6 Khách Hàng**: Hiển thị đồng thời 6 ô đơn hàng, xoay vòng từ nhóm 10 khách quen thân thiết (Bếp trưởng Marie, Thợ rèn Angus, Bé Lily, Thương nhân Marco, Hiệp sĩ Lancelot, Thợ may Elena...). Hỗ trợ hủy đơn với thời gian chờ làm mới 15 phút.
   - **Hành Trình Giao Hàng Xe Tải Thực Tế**: Bấm "Giao Hàng" sẽ điều động Xe Tải đỏ nổ máy bốc khói 💨 chạy dọc theo con đường lớn ra ngoài làng trong chuyến đi khứ hồi 16 giây. Trong thời gian xe đi giao, **các đơn hàng tạm khóa không thể giao liên tục**; xe về đỗ lại sân, bấm còi rộn rã và trao thưởng Vàng & XP.

6. **Khách Bộ Hành Ghé Thăm (Town Visitors System)**:
   - Khách NPC phương xa tự động đi bộ dọc con đường lớn vào thềm Tòa Thị Chính, nổi bong bóng mua hàng `💬 [Icon]×[Số lượng]`.
   - Người chơi có thể nhấp vào khách để bán nông sản lấy giá hời (+30% Vàng) kèm tim bay ❤️ hoặc từ chối để đón lượt khách tiếp theo.

7. **Hệ Thống 2 Kho Chuyên Biệt (Dual Storage System: Silo & Barn)**:
   - **Kho Silo Nông Sản**: Chuyên lưu trữ 13 loại nông sản ruộng đồng và hoa quả hái lượm (Lúa mì, Cà rốt, Cà chua, Dâu tây, Bắp ngô, Bắp cải, Bí ngô, Dưa hấu, Nho tím, Hoa hướng dương, Táo đỏ, Dừa xiêm, Trái me).
   - **Kho Barn Vật Tư & Thành Phẩm**: Chuyên lưu trữ sản phẩm chăn nuôi (Trứng, Sữa, Lông cừu) và thành phẩm chế biến (Bánh mì, Bơ sữa, Vải lụa, Dụng cụ sắt, Rượu vang).
   - Sức chứa khởi đầu 100/kho, có thể nâng cấp bằng Vàng và Ruby 💎 lên tối đa 1.000 mỗi kho (hạn mức tài nguyên 999 mỗi loại). Cảnh báo đầy kho trực quan chống thất thoát nông sản.

8. **Kiểm Tra Va Chạm & Ranh Giới Khi Đặt Công Trình (Placement Collision Check)**:
   - Hiển thị lưới định vị bán trong suốt thời gian thực:
     - **Màu Xanh Lá**: Vị trí xây dựng hoàn toàn hợp lệ và thông thoáng.
     - **Màu Đỏ Cảnh Báo**: Vị trí bị trùng lấn bởi công trình khác, đường sá, mép nước hoặc nằm ngoài phạm vi đất đã khai hoang.
   - Giúp người chơi căn chỉnh vị trí dễ dàng, ngăn ngừa đặt nhầm hay lỗi đè ô.

9. **Giàn Giáo Thi Công, Đếm Ngược & Hoàn Thành Ngay Bằng Ruby (Scaffolding & Speedup 💎)**:
   - Công trình khi xây dựng hoặc nâng cấp sẽ hiển thị mô hình giàn giáo thi công mộc mạc, hiệu ứng bụi pixel và thanh đồng hồ đếm ngược thời gian thực.
   - Tích hợp nút **"Hoàn Thành Ngay (1 💎)"**: Tiêu hao Ruby để hoàn tất ngay tức thì mà không cần chờ đợi.

10. **Tổng Quản Gia Hoàng Gia (Town Caretaker / NPC Thu Hoạch Tự Động 👨‍🌾)**:
    - **Mở khóa ở Cấp 5 (Thị Trưởng Năng Động)**: Món quà đắc lực giúp người chơi rảnh tay khi quy mô làng bắt đầu mở rộng.
    - **Tặng 1 Ngày (24h) Dùng Thử Miễn Phí**: Kích hoạt tức thì ngay trên giao diện Quản Gia.
    - **Gói Thuê Linh Hoạt**: Gia hạn hợp đồng bằng Vàng (800🪙/1 ngày, 2.000🪙/3 ngày, 4.500🪙/7 ngày) hoặc bằng Ruby (3💎/3 ngày, 6💎/7 ngày, 10💎/14 ngày).
    - **Tự Động 4 Trọng Trách Toàn Diện**:
      1. *Nông sản ruộng đồng*: Tự động gặt lúa mì, bắp ngô, rau củ chín đưa vào Kho Silo.
      2. *Cây ăn quả thân gỗ*: Tự động rung cây táo đỏ, dừa xiêm, trái me đưa vào Kho Silo.
      3. *Chuồng trại & Tự động cho ăn*: Thu hoạch trứng, sữa, len vào Kho Barn VÀ tự động lấy lúa mì, ngô, cà rốt trong kho nạp cho gà, bò, cừu khi đàn đói để tiếp tục chu kỳ.
      4. *Xưởng chế tác & Quán trọ*: Thu hoạch bánh mì, bơ sữa, dụng cụ sắt, vải lụa, rượu vang vào Kho Barn.
    - **Bảng Cấu Hình Checkbox & Thống Kê**: Cho phép người chơi bật/tắt từng mục công việc tùy ý, theo dõi thời gian hợp đồng đếm ngược thời gian thực và tổng sản lượng Quản Gia đã thu hoạch giúp làng.

11. **Bến Cảng Đường Thủy & Tàu Buôn Giao Thương Caravel (Harbor Cargo Ship 🚢)**:
    - **Mở khóa ở Cấp 6 (Lãnh Chúa Khai Hoang)**: Hệ thống giao thương đường thủy cao cấp cho các lãnh chúa tích lũy thặng dư nông nghiệp quy mô lớn.
    - **Đại Dương Trải Dài Toàn Map & Thuyền Buồm Caravel Isometric**: Dải biển đại dương xanh biếc bao la trải dài dọc toàn bộ sườn Tây từ Row 0 đến Row 31 (Cols 0..4). Thuyền buồm Caravel thả neo bồng bềnh giữa làn nước biển xanh biếc dập dềnh theo sóng nước (`Math.sin`), buồm trắng căng gió, cờ đuôi nheo hoàng gia phấp phới và đèn bão lung linh tại Cầu Cảng Đá Bến Biển (Row 14, Col 4). Quần thể bờ biển gồm nhiều Đảo Hải Đăng, Đê chắn sóng đá, Rạn san hô ngũ sắc, Phao tiêu dẫn luồng, Đảo dừa nhiệt đới và Bãi biển cát vàng óng. Toàn bộ dải biển và bến cảng được bảo vệ tuyệt đối (bất khả xâm phạm, tương tự trục đường xe tải giao hàng, không thể phá dỡ hay di dời).
    - **Cơ Cấu 9 Thùng Hàng Chia Làm 3 Khoang**:
      - *Khoang 1 (Nông Sản & Hoa Quả)*: Thu mua Lúa mì, Ngô, Cà chua, Dâu tây, Bí ngô, Táo, Dừa, v.v.
      - *Khoang 2 (Chuồng Trại & Bơ Sữa)*: Thu mua Trứng tươi, Sữa bò, Lông cừu, Bơ vàng.
      - *Khoang 3 (Thủ Công & Luyện Kim)*: Thu mua Bánh mì lò nướng, Dụng cụ sắt, Vải lụa cao cấp, Rượu vang.
    - **Đóng Từng Thùng Nhận Thưởng Tức Thì**: Mỗi thùng hàng đóng thành công sẽ trao ngay Vàng 🪙 và Điểm Kinh Nghiệm ⭐ tương ứng.
    - **Phần Thưởng Toàn Thắng (Grand Completion Reward)**: Đóng trọn vẹn 9/9 thùng hàng sẽ nhận Rương Châu Báu chứa **3–5 Ruby 💎**, **2 vật tư chế tác cao cấp** (`ironTools`, `butter`, `fabric`, `bread`), **700–1.000 Vàng** và **400–600 XP**.
    - **Thời Gian Đậu Bến & Cooldown Thông Minh**: Thuyền lưu lại bến 15 phút. Khi rời bến, tàu đi biển 10 phút (có thẻ dự báo loại hàng chuyến sau) hoặc có thể tiêu 2 Ruby 💎 để gọi tàu cập cảng ngay lập tức.
    - **Tương Tác Kép**: Nhấp trực tiếp vào con thuyền/bến cảng trên mặt nước hoặc bấm nút tròn 🚢 trên thanh công cụ góc trái.

12. **Thú Cưng Sống Động (Pets System)**:
    - 4 loài thú cưng dạo chơi khắp nẻo đường làng: **Chó 🐶**, **Mèo 🐱**, **Thỏ 🐰**, và **Ngựa 🐴**.
    - Thú cưng di chuyển tự do, kết bạn và lẽo đẽo đi theo sau dân làng hoặc vui đùa trên các bãi cỏ.

13. **Sự Kiện Ngẫu Nhiên Vương Quốc (Town Events)**:
    - **🎪 Hội Chợ Làng**: Tăng +50% Vàng khi xuất bán hàng hóa tại Chợ Nông Sản.
    - **🐫 Thương Đoàn Phương Xa**: Tặng ngay +80🪙 Vàng chào mừng hoàng gia, tăng +20% giá bán tại Chợ và +25% điểm kinh nghiệm khi thu hoạch.
    - **🌾 Ngày Hội Mùa Vàng**: Thần Nông ban phúc, nhân đôi sản lượng thu hoạch (gấp đôi nông sản) và nhân đôi kinh nghiệm (x2 XP).
    - Tích hợp banner chúc mừng trượt từ đỉnh màn hình, thẻ đếm ngược trên thanh HUD và popup chi tiết hiệu ứng.

14. **Hệ Thống Cấp Độ & Tiến Trình Người Chơi**:
    - Cấp độ tối đa nâng lên **Cấp 25** (Tối Thượng Hoàng Gia) với danh hiệu vương triều tương ứng.
    - Mở khóa công trình, giống cây trồng mới và mở rộng sức chứa kho hàng theo từng cấp độ.

15. **Nâng Cấp Công Trình (Building Upgrades)**:
    - Kiểm tra thông tin công trình và nâng cấp từ **Cấp 1 lên Cấp 3** (ví dụ: Nhà Ngói Đỏ, Tòa Thị Chính Hoàng Gia, Quán Trọ Cao Cấp).
    - Thời gian nâng cấp thời gian thực kèm hiệu ứng giàn giáo thi công, bụi xây dựng và âm thanh gõ búa.

16. **Hệ Thống Nhiệm Vụ 6 Chương & Chuỗi Hướng Dẫn Nhập Môn & Mở Khóa Cấp Độ (Level Tutorials)**:
    - **41 nhiệm vụ** trải dài qua 6 chương cốt truyện (Khai hoang lập làng -> Nông trang trù phú -> Ẩm thực thương nghiệp -> Kim khí thủ công -> Đô thị phồn hoa -> Đại đế quốc vĩnh cửu).
    - **Tutorial Cụ Trưởng Làng Tân Thủ**: Chuỗi 5 bước nhập môn thực tế (gieo lúa mì, thu hoạch, bán tại chợ, mở rộng luống đất, đón dân cư).
    - **Tutorial Tính Năng Mới Theo Cấp Độ (Level-Up Feature Tutorials)**: Tự động kích hoạt khi người chơi thăng cấp kèm hướng dẫn và nút dẫn trực tiếp tới tính năng:
      - **Cấp 2 (Cụ Trưởng Làng Eldrin)**: Khai hoang mở rộng đất (Land Expansion), Cối Xay Gió & Hạt giống Cà chua, Dâu tây.
      - **Cấp 3 (Quan Chưởng Ấn Hoàng Gia)**: Tòa Thị Chính mở khóa 16 Thành Tựu Đại Lục & Lò Bánh Mì, Chuồng Bò Sữa.
      - **Cấp 4 (Thợ Cả Chế Biến)**: Xưởng Bơ Sữa, Lò Rèn Công Cụ Sắt & Vườn Cây Ăn Quả (Táo, Cherry).
      - **Cấp 5 (Tổng Quản Gia Eldrin)**: Thuê Quản Gia tự động thu hoạch nông trại 24/7 (Tặng 1 ngày dùng thử miễn phí).
      - **Cấp 6 (Thuyền Trưởng Caravel)**: Bến Cảng Hoàng Gia & Thuyền Buôn Caravel đóng 9 thùng hàng đổi Kim Cương Ruby & Vật tư hiếm.
      - **Cấp 7 & 10 (Đại Pháp Sư Giả Kim & Sứ Giả Đông Sơn)**: Xưởng Giả Kim, Ngân Hàng, Cầu Cảng Đá Biển và Kiến trúc Á Đông Onsen.

17. **Tòa Thị Chính & 16 Thành Tựu Đại Lục**:
    - Xây dựng Tòa Thị Chính mở khóa Đại Sảnh Thành Tựu với **16 cột mốc danh dự** (Đại phú hào, Đô thị triệu dân, Bậc thầy nông nghiệp, Thương gia tận tụy, v.v.) kèm phần thưởng vàng hậu hĩnh.

18. **Chu Kỳ Ngày / Đêm & Thời Tiết Sống Động**:
    - Chuyển đổi mượt mà qua 4 thì: **☀️ Ban ngày**, **🌅 Hoàng hôn rực rỡ**, **🌙 Đêm lung linh với 60 vì sao**, và **🌸 Rạng đông hồng đào**.
    - Đèn đường và cửa sổ tự động phát ánh hào quang vàng ấm áp khi màn đêm buông xuống.
    - Hiệu ứng thời tiết: Mưa rào pixel với hạt mưa xiên và sóng nước lăn tăn, sương mù ban mai, đom đóm lập lòe.

19. **Âm Thanh & Nhạc Nền 8-Bit (Web Audio API)**:
    - Nhạc nền chiptune lofi đồng quê ấm áp, êm dịu, vòng lặp mượt mà.
    - Hiệu ứng âm thanh phong phú: tiếng thu hoạch lúa, tiếng xén lông cừu, tiếng dệt vải, tiếng rung cây ăn quả, tiếng búa lò rèn, tiếng còi tàu buôn trầm ấm, tiếng nước suối và lời thoại blip-blop của dân làng.

20. **Hệ Thống Lưu Trữ Save v3 & Xuất/Nhập JSON**:
    - Tự động lưu tiến trình game an toàn vào `localStorage` theo chuẩn Version 3 (`isometric_town_builder_save_v3`). Tự động làm sạch và đồng bộ lại đối với người chơi mới hoặc các save cũ, khởi tạo hoàn hảo ở Cấp 1 với bản đồ khởi đầu đầy đủ Tòa Thị Chính, Đại Dương, Luống Đất và Hướng Dẫn Tân Thủ.
    - Hỗ trợ xuất và nhập file bản đồ `.json` để sao lưu hoặc chia sẻ vương quốc giữa các thiết bị.

---

## 🎮 Hướng Dẫn Điều Khiển

- **Chuột trái (Click hoặc Giữ kéo)**: Đặt gạch / Vẽ đường / Thu hoạch nông sản / Rung cây ăn quả / Cho gia súc ăn / Mở mảnh đất mới / Tương tác khách bộ hành.
- **Chuột phải (Click hoặc Giữ kéo)**: Tháo dỡ công trình về thảm cỏ xanh hoặc hủy công cụ đang cầm.
- **Phím Space + Kéo chuột (hoặc Chuột giữa)**: Di chuyển góc nhìn camera (Pan).
- **Cuộn chuột**: Phóng to / Thu nhỏ góc nhìn thế giới (Zoom từ 15% đến 300%).
- **Phím [E] hoặc [R]**: Xoay hướng công trình (hỗ trợ xoay hướng 4 chiều và lật đối xứng).
- **Nút 🔊 Âm thanh**: Bật / Tắt nhạc nền và âm thanh 8-bit.
- **Nút ☀️ Ngày / 🌧️ Mưa**: Chuyển đổi thủ công buổi thời gian và thời tiết.
- **Nút ⚡ Xây nhanh**: Hoàn thành tức thì các công trình và nâng cấp đang thi công.
- **Hoàn tác (Undo / Redo)**: Phím tắt `Ctrl + Z` / `Ctrl + Y`.

---

## 📂 Cấu Trúc Mã Nguồn

```text
src/
├── data/
│   ├── achievementsConfig.js # 16 thành tựu đại lục tại Tòa Thị Chính
│   ├── cropsConfig.js        # 10 loại nông sản gieo trồng trên luống đất
│   ├── cropSprites.js        # Sprite pixel art cho biểu tượng nông sản và hàng hóa
│   ├── devSaveData.js        # Dữ liệu map thử nghiệm dành cho Nhà phát triển (Dev Test Map)
│   ├── gameEconomy.js        # Kinh tế vương quốc, 25 cấp độ XP, giá cả, dân số
│   ├── harborShipConfig.js   # Cấu hình Bến Cảng, 9 thùng hàng 3 khoang & thưởng Thuyền Buồm Caravel
│   ├── landConfig.js         # 64 mảnh đất 4x4 trên đại lục 32x32, Fog of War & 4 bậc vật tư mở đất
│   ├── orderBoardConfig.js   # 6 ô đơn hàng trên bảng, xoay vòng 10 NPC khách hàng & phần thưởng
│   ├── questsData.js         # 41 nhiệm vụ cốt truyện chia làm 6 chương
│   ├── resourcesConfig.js    # Danh mục kho Silo (13 nông sản), kho Barn (8 thành phẩm) & hạn mức
│   ├── sprites.js            # Dữ liệu ảnh pixel art base64 cho các loại gạch
│   ├── starterMap.js         # Bản đồ khởi đầu 32x32 với Tòa Thị Chính và trục đường chính
│   ├── tilesData.js          # Metadata 265 loại ô gạch và bản đồ mẫu
│   └── upgradesConfig.js     # Dữ liệu nâng cấp công trình cấp 1-3
├── engine/
│   ├── audioEngine.js        # Web Audio API tổng hợp nhạc nền BGM & hiệu ứng âm thanh
│   ├── canvasRenderer.js     # Vẽ canvas isometric 2:1, viewport culling, lưới va chạm xanh/đỏ
│   ├── dayNightWeather.js    # Chu kỳ 4 thì Ngày/Đêm, đèn đường phát sáng, mưa, sương mù
│   ├── farmTools.js          # Quản lý nông cụ (liềm, xẻng), gieo hạt và quét chuột thu hoạch
│   ├── harborShipManager.js  # Quản lý Bến Cảng Thuyền Buồm Caravel, 9 thùng hàng & thưởng Ruby
│   ├── inputHandler.js       # Xử lý chuột, panning, zoom, kéo quét thu hoạch, phím tắt
│   ├── isoMath.js            # Chuyển đổi tọa độ 2:1 dimetric, mở rộng lưới 32x32
│   ├── orderBoardManager.js  # Quản lý Bảng đơn hàng NPC, xe tải giao hàng & cooldown hủy đơn
│   ├── pathfinding.js        # Thuật toán A* tìm đường trên mạng lưới giao thông làng
│   ├── pets.js               # Mô phỏng 4 loài thú cưng (chó, mèo, thỏ, ngựa)
│   ├── storage.js            # Lưu/nạp Save v2 vào localStorage, xuất/nhập JSON
│   ├── townCaretaker.js      # Quản lý Tổng Quản Gia Thomas, hợp đồng thuê và tự động thu hoạch
│   ├── townEvents.js         # Hệ thống sự kiện ngẫu nhiên (Hội Chợ, Thương Đoàn, Mùa Vàng)
│   ├── townVisitors.js       # Khách bộ hành ghé thăm đại lộ, mua nông sản giá hời
│   ├── tutorialManager.js    # Hướng dẫn tân thủ 5 phút từng bước cùng Cụ Trưởng Làng
│   ├── uiModalController.js  # Quản lý modal (Chợ Silo/Barn, Sổ Nhiệm Vụ, Thành Tựu, Cài Đặt)
│   ├── upgradeManager.js     # Quản lý logic nâng cấp công trình, giàn giáo và tiến trình thi công
│   └── villagers.js          # Dân làng đi dạo trên đường, hội thoại và tâm trạng
├── App.tsx                   # Giao diện React (Top bar, Right HUD, Action Decks, Modals)
├── main.tsx                  # Điểm khởi chạy React ứng dụng
├── studioEngine.js           # Bộ điều phối chính kết nối 18 module và vòng lặp game (3.525 dòng)
└── styles.css                # Toàn bộ mã tạo kiểu giao diện Pixel Art cổ điển
```

---

## 🛠️ Việc Cần Làm (Roadmap Refactor)

Dự án đã hoàn thành tách **18 module chuyên biệt** trong thư mục `src/engine/`. Hiện tại file điều phối trung tâm `src/studioEngine.js` còn **3.525 dòng** và sẽ tiếp tục được bóc tách theo kế hoạch:
- [x] **Khối 1: Nông nghiệp & Công cụ** (`farmTools.js`, 310 dòng): Bóc tách logic liềm, xẻng, gieo hạt và thu hoạch quét chuột.
- [ ] **Khối 2: Chuỗi sản xuất & Cây ăn quả** (~275 dòng): Bóc tách logic cho ăn chuồng trại, lò bánh mì, lò rèn, xưởng dệt và rung cây ăn quả thành `productionManager.js`.
- [ ] **Khối 3: Cửa hàng kiến trúc** (~180 dòng): Bóc tách render shop modal, bộ lọc danh mục và kiểm tra điều kiện xây dựng thành `shopController.js`.
- [ ] **Khối 4: Kinh tế & Cấp độ** (~460 dòng): Bóc tách logic cấp độ, tính điểm kinh nghiệm, thăng cấp và thống kê làng thành `economyLevelManager.js`.
- [ ] **Khối 5: Quản lý Game State tập trung**: Giảm kích thước `studioEngine.js` xuống còn khoảng 150 - 200 dòng đúng mục tiêu kiến trúc ban đầu.

---

## 🚀 Cách Chạy Ứng Dụng

1. **Cài đặt thư viện phụ thuộc**:
   ```bash
   npm install
   ```

2. **Khởi chạy máy chủ phát triển**:
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại địa chỉ `http://localhost:3000`.

3. **Kiểm tra mã nguồn (Type check)**:
   ```bash
   npm run lint
   ```

4. **Đóng gói phiên bản phát hành (Production build)**:
   ```bash
   npm run build
   ```
