# Ảnh thay các hình dựng bằng Canvas

Tạo bằng **built-in imagegen**, từng PNG riêng với ảnh game hiện có làm tham chiếu. Bản gốc có alpha thật, giữ nguyên byte trong `assets-source/runtime-art`; game dùng bản copy tại `public/assets/runtime-art`. Toàn bộ prompt và output được ghi ở `docs/generated-assets/runtime-art/prompt-set.json` và `outputs.json`.

- Mười khách mua hàng có sprite riêng theo ID NPC. Renderer giữ tọa độ, nhún bước đi, hướng quay và bong bóng giao dịch; không đổi logic mua bán hoặc save.
- Xe kéo lúa mì gồm nông dân và xe; xe ngựa gồm ngựa, xe và người đánh xe. Dùng điểm tiếp đất chung theo tọa độ động, giữ đường đi và thứ tự layer.
- Thư viện Biển và Poseidon mỗi kỳ quan có bốn ảnh từ quy hoạch đến gần hoàn thiện (stage 0–3). Stage 4 tiếp tục dùng ảnh hoàn thiện gốc. Chỉ cung điện có bộ ảnh thi công trước thay đổi này.
- Dưa hấu có ảnh gieo hạt, mầm, cây non có trái non và cây chín có quả xanh sọc. Không mượn ảnh bí ngô, lúa hay ảnh luống chung. Thời gian, cấp mở khóa, giá và sản lượng giữ nguyên.
- Bộ icon tài nguyên dùng chung cho chợ, chọn cây trồng, đơn hàng, khách mua hàng và giao diện kho/cảng hiện có. Các ký hiệu điều khiển, tiền, XP và thông báo văn bản vẫn là giao diện.

`runtimeArtData.js` chứa URI có hash và bounds alpha. `runtimeArt.js` cắt vùng padding khi vẽ; không sửa PNG gốc. Các nhánh thiếu ảnh chỉ có tác dụng trong lúc tải, không phải bộ ảnh thay thế lâu dài.

Ghi nhận ảnh: `node scripts/recordRuntimeArt.mjs`.
Gallery: `node scripts/runtimeArtGallery.mjs`, sau đó mở `/assets/runtime-art/index.html`.

## Bổ sung bắp cải

Bốn PNG bắp cải riêng: hạt nhỏ tròn, mầm, cây non bắt đầu cuộn và bắp trưởng thành có đầu tròn cuộn chặt. Không mượn hình xà lách hoặc ảnh sinh trưởng mặc định. Giữ nguyên giá hạt, thời gian trồng, cấp mở khóa và sản lượng; cây đang trồng trong save tự nhận hình theo timer hiện có. Prompt bổ sung: `docs/generated-assets/runtime-art/cabbage-prompt-set.json`. Ảnh: `public/assets/runtime-art/cabbage/`.
