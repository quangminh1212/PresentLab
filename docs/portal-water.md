# Portal water background

The portal layers the official vendored Three.js `Water` and `Sky` addons over
the locally stored `web/portal/water-surface.webm`. The 1920x1080 footage
preserves real wave shape, foam, reflections, and irregular motion while the
Three.js normal map supplies continuously moving reflections and surface
distortion. The CSS crop keeps the view over open water and moves the narrow
shoreline toward the edge of the frame.

Clicks and pointer movement raycast against the Three.js water plane and feed a
256x256 GPU height field. Two render targets ping-pong height and velocity
through a damped wave equation with fixed 1/60 simulation steps. The addon
shader uses the field for local surface displacement and changing normals, so
the interaction is anchored to the visible water rather than screen pixels.
The semi-transparent Three.js surface leaves the licensed footage visible
underneath. If WebGL is unavailable, the clip remains available as a video
fallback; if the clip cannot load, the portal falls back to its CSS water
treatment.

The portal requests no external media at runtime. The video element remains
muted, loops locally, and pauses when reduced motion is enabled. Its credit is
shown in the hero and in the markup. The Three.js files and normal map are
served from the repository's vendored runtime.

## Video provenance

- File: `web/portal/water-surface.webm`
- Source: [Ocean waves at Lækjavik beach, Iceland](https://commons.wikimedia.org/wiki/File:Ocean_waves_at_L%C3%A6kjavik_beach%2C_Iceland.webm)
- Author: Alexander Grebenkov
- License: [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/)
- SHA-256: `538FB3999C7426FD32E49AEC4329CF88CD8FB1A36C81484BBC8297BEDCE61E4B`

The source asset is checked into the portal so production does not depend on a
third-party hotlink.
