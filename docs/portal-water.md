# Portal water background

The portal uses a local, muted WebM loop as the primary water surface. The
video is a real ocean-wave capture, so the background keeps natural highlights,
foam, and motion instead of relying on a stylized procedural texture. Pointer
movement still applies a small 3D parallax shift and click ripple overlay.

The page falls back to the dependency-free WebGL Fresnel water pass in
`web/portal/world.js` when the video cannot play. Both paths remain local and
work with the portal's `script-src 'self'` / `connect-src 'self'` policy.

## Asset provenance

- File: `web/portal/water-surface.webm`
- Source: [Ocean waves at Lækjavik beach, Iceland](https://commons.wikimedia.org/wiki/File:Ocean_waves_at_L%C3%A6kjavik_beach%2C_Iceland.webm)
- Author: Alexander Grebenkov
- License: [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/)
- Attribution: Alexander Grebenkov; the portal uses a cropped/scaled looping presentation and does not imply endorsement.
- Media: VP9/Opus WebM, 1,920 × 1,080, 8.661 seconds, 2,206,099 bytes at source intake.
- SHA-256: `538FB3999C7426FD32E49AEC4329CF88CD8FB1A36C81484BBC8297BEDCE61E4B`
- Intake date: 2026-09-22

The source page records the original file, author, dimensions, duration, and
license. The downloaded binary is checked into the portal so production does
not depend on a third-party hotlink.

## Fallback references

The fallback WebGL pass was informed by these open-source references:

- [Nugget8/Three.js-Ocean-Scene](https://github.com/Nugget8/Three.js-Ocean-Scene) — MIT-licensed procedural ocean approach.
- [martinRenou/threejs-water](https://github.com/martinRenou/threejs-water) — BSD-3-Clause implementation of Evan Wallace's interactive WebGL water demo.
- [three.js ocean example](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_shaders_ocean.html) — official Water/Sky scene reference.

No source file or texture is copied from those projects.
