"""Verify resources in the built app, not just files in the repository."""
from pathlib import Path
import plistlib
import sys

app = Path(sys.argv[1])
source = Path(__file__).resolve().parents[1] / 'App/Resources'
with (app / 'Info.plist').open('rb') as stream:
    info = plistlib.load(stream)
assert info['CFBundleDisplayName'] == 'Araba libaneza', 'Incorrect display name'
assert info['CFBundleIdentifier'] == 'com.centruldearabalibaneza.app'
assert info['UILaunchStoryboardName'] == 'LaunchScreen'
assert (app / 'LaunchScreen.storyboardc').is_dir(), 'Launch screen was not compiled/bundled'
assert (app / 'Assets.car').is_file(), 'Asset catalog was not compiled/bundled'
for key in ('CFBundleIcons', 'CFBundleIcons~ipad'):
    icon = info[key]['CFBundlePrimaryIcon']
    assert icon['CFBundleIconName'] == 'AppIcon', f'Missing icon metadata: {key}'
    assert icon['CFBundleIconFiles'], f'Missing icon files: {key}'
assert list(app.glob('AppIcon*.png')), 'No rendered app icons'
for resource in source.glob('*.json'):
    assert (app / resource.name).read_bytes() == resource.read_bytes(), f'Missing or changed bundled content: {resource.name}'
assert (app / 'yalla-native-content.json').is_file(), 'Production content missing'
print('Verified built app: display name, phone/tablet icons, launch screen and bundled content.')
