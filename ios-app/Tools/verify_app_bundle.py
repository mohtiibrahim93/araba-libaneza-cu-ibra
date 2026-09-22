"""Verify resources in the built app, not just files in the repository."""
from pathlib import Path
import json
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
assert (app / 'PrivacyInfo.xcprivacy').is_file(), 'Privacy manifest missing from built app'
for key in ('CFBundleIcons', 'CFBundleIcons~ipad'):
    icon = info[key]['CFBundlePrimaryIcon']
    assert icon['CFBundleIconName'] == 'AppIcon', f'Missing icon metadata: {key}'
    assert icon['CFBundleIconFiles'], f'Missing icon files: {key}'
assert list(app.glob('AppIcon*.png')), 'No rendered app icons'
for resource in source.glob('*.json'):
    assert (app / resource.name).read_bytes() == resource.read_bytes(), f'Missing or changed bundled content: {resource.name}'
content_path = app / 'yalla-native-content.json'
assert content_path.is_file(), 'Production content missing'
content = json.loads(content_path.read_text(encoding='utf-8'))
audio_assets = content.get('audioAssets', [])
for asset in audio_assets:
    locator = asset['locator']
    assert '/' not in locator and '\\' not in locator, f'Audio locator must be a filename: {locator}'
    matches = list(app.rglob(locator))
    assert len(matches) == 1, f'Expected exactly one bundled audio file for {locator}, found {len(matches)}'

audio_ids = {asset['id'] for asset in audio_assets}
expression_ids = {expression['id'] for expression in content.get('expressions', [])}
for prompt in content.get('listeningPrompts', []):
    assert prompt['audioAssetID'] in audio_ids, f"Missing listening audio: {prompt['audioAssetID']}"
    assert prompt['expressionID'] in expression_ids, f"Missing listening expression: {prompt['expressionID']}"
    for choice_id in prompt.get('choiceExpressionIDs', []):
        assert choice_id in expression_ids, f'Missing listening distractor expression: {choice_id}'

print(
    'Verified built app: display name, phone/tablet icons, launch screen, bundled content '
    f'and {len(audio_assets)} approved audio assets.'
)
