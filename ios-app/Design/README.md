# Provisional app identity

Public name: Araba libaneza. Internal bundle identifier and target names remain stable.

AppIcon.svg is editable source artwork: cream conversation bubble, dark green cedar silhouette and a small red accent. No text is embedded, so changing the public name does not require redrawing the icon. The square background is opaque; the system applies its own icon mask.

The bundled AppIcon.png is 1024 × 1024 RGB. To regenerate with Python and Pillow:
```sh
python ios-app/Design/render_icon.py
```
The renderer deliberately supports only the straight paths and rounded rectangles in this source. Normal Xcode builds use the checked-in PNG and need no Python dependency.

LaunchScreen.storyboard uses systemBackgroundColor for light/dark appearance, matching the standard app surface. It has no text, animation, or artificial delay.

Configuration: project.yml selects AppIcon and LaunchScreen. App/Resources is explicitly assigned to the target's resources build phase; CI inspects the built app for the icon, launch screen and content JSON.

Before release, inspect the icon under the system mask on iPhone/iPad and verify a cold launch in light/dark mode. Artwork preview and compilation do not replace those device checks.
