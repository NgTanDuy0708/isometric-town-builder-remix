# Warehouse editor

Open http://localhost:3000/warehouse-editor . Also linked as **Chỉnh kho** from the map editor.

The 2x2 occupancy stays fixed. All image transforms can be adjusted with a slider or a numeric input:

- World x/y offsets (pixels), uniform size, visible base width (world pixels).
- Independent width/height multipliers, rotation (degrees), horizontal/vertical shear, horizontal flip, opacity.
- Source-space anchor x/y (original 1254x1254 PNG coordinates) and target world anchor x/y.
- Direct draw rectangle dx/dy/dw/dh (world pixels); edits update the corresponding offsets or stretch multipliers.

Drag the preview to move the image. Arrow keys move 1 world pixel, Shift+arrow 10, Alt+arrow 0.1. Ctrl+Z / Ctrl+Shift+Z undo/redo. Zoom only changes the editor view.

Optional grass/checker/dark backgrounds, footprint lines behind or over the sprite, anchor crosshair, and a preview of the in-game mirrored orientation aid alignment. **Giữ tỷ lệ ảnh gốc** restores independent width/height to 1. **Đưa tâm chân kho về tâm 2x2** restores the measured source/world ground centres without changing scale.

Changes auto-save as a draft. **Áp dụng vào game** writes `isometric_town_builder_warehouse_tuning_v1` in this browser/origin, retaining the previous applied settings in a backup key. An open game in the same browser/origin redraws immediately; a newly opened game loads the saved transform. Open **Mở game** from the editor for the same origin. Settings apply at all storage capacity levels and to placed, construction, buy and move previews using the same rendering function. Export/import JSON is available for moving settings between browsers or sharing them for a project default.

The PNG is never resized, re-encoded or recoloured by this editor. The current default remains centred on the 2x2 ground plane.
