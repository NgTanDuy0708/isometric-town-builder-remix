#!/usr/bin/env python3
"""Pixelize ảnh AI về đúng style Forest Pack (pixel 4x, palette giới hạn).

Cách dùng:
  python tools/pixelize_asset.py input.png output.png --height 128 --pixel 4

- height: chiều cao cuối trong game (px world). 1x1 nhà: 96-128, 2x2: 160-220.
- pixel: kích thước 1 art-pixel trên ảnh cuối (4 = chuẩn pack 32->128).
"""
import argparse
from PIL import Image

# Palette Forest Pack (Kipperfalcon) + neutrals
PALETTE_HEX = [
    "#1e4615", "#1a3b11", "#32571d", "#4b6c2e", "#6d8740", "#8aa355", "#aabd68",
    "#e6dfa1", "#e8cd97", "#ccb45c", "#ba9745", "#9e7a36", "#855c22",
    "#67231b", "#8a3c24", "#9e5333", "#e0ac6c", "#581c23",
    "#709fcf", "#5782ba", "#add6e0",
    "#2f3436", "#4b4f53", "#7b7f7a", "#c9c8bd", "#000000", "#ffffff",
]


def hex_rgb(h):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def make_palette_image():
    pal = Image.new("P", (1, 1))
    flat = []
    for h in PALETTE_HEX:
        flat.extend(hex_rgb(h))
    flat += [0, 0, 0] * (256 - len(PALETTE_HEX))
    pal.putpalette(flat)
    return pal


def trim_alpha(im):
    a = im.getchannel("A")
    bbox = a.getbbox()
    return im.crop(bbox) if bbox else im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--height", type=int, default=128, help="final height in game px")
    ap.add_argument("--pixel", type=int, default=4, help="screen px per art pixel")
    args = ap.parse_args()

    im = Image.open(args.input).convert("RGBA")
    im = trim_alpha(im)

    inner_h = max(1, round(args.height / args.pixel))
    scale = inner_h / im.height
    inner_w = max(1, round(im.width * scale))
    small = im.resize((inner_w, inner_h), Image.LANCZOS)

    alpha = small.getchannel("A")
    rgb = small.convert("RGB").quantize(palette=make_palette_image(), dither=Image.Dither.NONE).convert("RGB")
    quant = rgb.convert("RGBA")
    quant.putalpha(alpha)

    final = quant.resize((inner_w * args.pixel, inner_h * args.pixel), Image.NEAREST)
    final.save(args.output)
    print(f"saved {args.output} {final.size} (inner {inner_w}x{inner_h}, pixel {args.pixel})")


if __name__ == "__main__":
    main()
