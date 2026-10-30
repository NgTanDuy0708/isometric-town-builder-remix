# Inspection contact sheet only; never modifies the generated game PNGs.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$seedManifest = Get-Content -LiteralPath 'docs/generated-assets/single-seeds/manifest.json' -Raw | ConvertFrom-Json
$sheet = New-Object System.Drawing.Bitmap(1000, 680)
$graphics = [System.Drawing.Graphics]::FromImage($sheet)
$graphics.Clear([System.Drawing.Color]::FromArgb(237,240,229))
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$font = New-Object System.Drawing.Font('Consolas',12)
$index = 0
foreach ($seedItem in $seedManifest.items) {
  $left = ($index % 5) * 200
  $top = [Math]::Floor($index / 5) * 170
  $graphics.DrawString($seedItem.id, $font, [System.Drawing.Brushes]::Black, $left+8, $top+8)
  $graphics.FillRectangle([System.Drawing.Brushes]::White, $left+8, $top+35, 184, 120)
  $nativeImage = [System.Drawing.Image]::FromFile((Join-Path (Get-Location) $seedItem.gameAssetPath))
  $bounds = $seedItem.metadata.opaqueBounds
  $visibleWidth = $bounds[2]-$bounds[0]
  $visibleHeight = $bounds[3]-$bounds[1]
  $displayScale = [Math]::Min(165/$visibleWidth,100/$visibleHeight)
  $displayWidth = [single]($visibleWidth*$displayScale)
  $displayHeight = [single]($visibleHeight*$displayScale)
  $destination = New-Object System.Drawing.RectangleF([single]($left+100-$displayWidth/2),[single]($top+95-$displayHeight/2),$displayWidth,$displayHeight)
  $sourceRectangle = New-Object System.Drawing.RectangleF([single]$bounds[0],[single]$bounds[1],[single]$visibleWidth,[single]$visibleHeight)
  $graphics.DrawImage($nativeImage,$destination,$sourceRectangle,[System.Drawing.GraphicsUnit]::Pixel)
  $nativeImage.Dispose()
  $index++
}
$sheet.Save((Join-Path (Get-Location) 'docs/generated-assets/single-seeds/review.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$font.Dispose()
$graphics.Dispose()
$sheet.Dispose()
