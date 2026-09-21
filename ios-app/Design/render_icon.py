"""Render our rect/straight-path SVG artwork. Requires Pillow; not used by app builds."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
SCALE = 4
image = Image.new('RGB', (1024 * SCALE, 1024 * SCALE))
draw = ImageDraw.Draw(image)
for element in ET.parse(ROOT / 'AppIcon.svg').getroot():
    kind = element.tag.split('}')[-1]
    a = element.attrib
    if kind == 'rect':
        x, y = float(a.get('x', 0)), float(a.get('y', 0))
        box = tuple(v * SCALE for v in (x, y, x + float(a['width']), y + float(a['height'])))
        draw.rounded_rectangle(box, radius=float(a.get('rx', 0)) * SCALE, fill=a['fill'])
    elif kind == 'path':
        tokens = iter(re.findall(r'[MLHVZ]|-?\d+(?:\.\d+)?', a['d']))
        points = []
        x = y = 0
        for command in tokens:
            if command in ('M', 'L'):
                x, y = float(next(tokens)), float(next(tokens))
            elif command == 'H':
                x = float(next(tokens))
            elif command == 'V':
                y = float(next(tokens))
            elif command == 'Z':
                continue
            else:
                raise ValueError(f'Unsupported path command: {command}')
            points.append((x * SCALE, y * SCALE))
        draw.polygon(points, fill=a['fill'])
output = ROOT.parent / 'App/Resources/Assets.xcassets/AppIcon.appiconset/AppIcon.png'
output.parent.mkdir(parents=True, exist_ok=True)
image.resize((1024, 1024), Image.Resampling.LANCZOS).save(output)
print(output)
