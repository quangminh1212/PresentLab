# Portal water background

The portal now uses the existing official Three.js `Water` addon as its
primary 3D background. The addon supplies the reflective/distorted water
material and animated normal-map flow; `web/portal/world.js` only connects the
scene, camera movement, resize lifecycle, and pointer interaction. No
project-owned water shader is maintained.

Pointer movement steers the Three.js camera over the water and changes the
distortion strength. Clicking the stage adds a temporary impact state while
the official water animation continues. A local muted WebM capture remains a
fallback only for browsers that cannot create the WebGL scene.

## Vendored Three.js source

- Package: `three` `0.186.0`, MIT licensed.
- Core: `web/vendor/three/three.module.js` and `web/vendor/three/three.core.js`.
- Water addon: `web/vendor/three/addons/objects/Water.js`.
- Normal map: `web/vendor/three/textures/waternormals.jpg`.
- License copy: `web/vendor/three/LICENSE`.
- Source: [Three.js Water.js](https://github.com/mrdoob/three.js/blob/r186/examples/jsm/objects/Water.js), [Three.js r186 license](https://github.com/mrdoob/three.js/blob/r186/LICENSE), and [the official water normal map](https://github.com/mrdoob/three.js/blob/r186/examples/textures/waternormals.jpg).

The vendored addon has one mechanical import-path adjustment so the static
portal can load it without a CDN. Its water implementation and shader remain
the upstream Three.js source. The runtime stays within the portal's
`script-src 'self'` / `connect-src 'self'` policy.

## Video fallback provenance

- File: `web/portal/water-surface.webm` (fallback only)
- Source: [Ocean waves at Lækjavik beach, Iceland](https://commons.wikimedia.org/wiki/File:Ocean_waves_at_L%C3%A6kjavik_beach%2C_Iceland.webm)
- Author: Alexander Grebenkov
- License: [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/)
- SHA-256: `538FB3999C7426FD32E49AEC4329CF88CD8FB1A36C81484BBC8297BEDCE61E4B`

The fallback binary is checked into the portal so production does not depend
on a third-party hotlink.
