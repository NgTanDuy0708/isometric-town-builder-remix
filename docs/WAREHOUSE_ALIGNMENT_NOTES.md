# Warehouse 2x2 alignment

Claude consultation: the user authorized sending the relevant technical context to the open Claude conversation. Asked Claude to inspect the current source PNG, footprint preview, buildingSprites.js and renderer, without modifying any files. Conversation: https://claude.ai/chat/ac651d8e-b545-409b-b232-b79378a042b3 . Claude began inspecting the sprite but hit the account's free-message limit before providing a completed recommendation. The calculation below is Codex's independent analysis, not Claude's conclusion.

The existing historical Claude advice was to measure real ground contacts instead of the roof/whole-image alpha bounds, distinguish the ground pass from sprite/UI overlays, and validate against the projected footprint.

Measured source floor contacts: (35,1090), (465,1194), (685,1157), (1212,1049). Project them into isometric axes u=x/2+y, v=y-x/2. Ranges: u=[1107.5,1655], v=[443,1072.5]. Their range midpoints invert to source centre (623.5,1069.5). Map this to the centre of the 2x2 floor diamond, world (64,64) relative to the bottom-right cell's sprite origin.

Keep scale 240/1192 unchanged. This balances opposite margins, moving the sprite left 7.75167785 and up 4.50335570 world pixels. The original 1254x1254 PNG, footprint cells, stock capacity, render order and preview dimensions are retained.
