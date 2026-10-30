# Cây ăn quả: gieo hạt và ba lần thu hoạch

Áp dụng cho táo, dừa, me, ca cao, cherry, việt quất, sầu riêng và cam.

- Cửa hàng bán hạt giống trong tab Nông trại. Chọn rồi bấm/chạm một ô đất hợp lệ để gieo ngay, trừ vàng một lần, không có thời gian thi công.
- Vụ đầu: hạt giống → mầm → cây con → cây non → trổ hoa hoặc trái non → chín. Các mốc lần lượt ở 0%, 12%, 25%, 43%, 68%, 100% thời gian sinh trưởng của loài.
- Hai lần hái đầu đưa cây về trạng thái trưởng thành trổ hoa để nuôi vụ tiếp theo. Cây không trở lại hạt hoặc mầm.
- Lần hái thứ ba đưa cây sang ảnh héo không còn quả. Cây ngừng lớn vĩnh viễn, không tự hồi sinh và không có lượt hái thứ tư, kể cả dùng nút làm chín nhanh.
- Bấm cây héo rồi chọn **Đào cây** để giải phóng ô; không hoàn vàng hạt giống đã dùng hết. Sau đó có thể mua và gieo hạt mới.
- Kho đầy không nhận lượt hái, không tăng bộ đếm hoặc phát thưởng. Di chuyển, lưu/tải và xuất/nhập JSON giữ bộ đếm. Bản lưu cũ giữ timer; thiếu bộ đếm được tính 1 nếu có `hasHarvested`, còn lại 0 vì không thể suy ra số lần hái lịch sử.

## Ảnh và nguồn

Giữ 40 PNG cây con, cây non, hoa, chín và héo đã có. Tạo thêm 16 PNG hạt giống/mầm bằng **built-in imagegen**, mỗi yêu cầu một ảnh, dùng ảnh loài tương ứng làm tham chiếu. PNG gốc 1254×1254 RGBA có alpha thật, giữ nguyên byte; renderer căn chân và thu nhỏ hai giai đoạn đầu.

- Prompt thực tế và đường dẫn output: `docs/generated-assets/fruit-lifecycle/prompt-set.json` và các file `.actual.txt` cùng thư mục.
- Nguồn: `assets-source/expansion/plants/`; bản game: `public/assets/expansion/plants/`.
- Manifest 16 ảnh bổ sung: `assets-source/expansion/fruit-early-manifest.json`. Bộ 94 ảnh ban đầu vẫn có manifest riêng.
- Ghi nhận/copy ảnh: `node scripts/recordFruitTreeEarlyAssets.mjs`.
- Đồng bộ geometry 56 ảnh: `node scripts/syncFruitTreeSprites.mjs`.
- Cập nhật gallery: `node scripts/updateFruitTreeGallery.mjs`.
- Gallery PNG: `/assets/expansion/plants.html`. Mô phỏng độc lập, không sửa save: `/assets/expansion/orchard.html`.
