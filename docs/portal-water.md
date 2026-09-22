# Portal water background

The portal now uses the official Three.js `Water` addon together with the
official analytic `Sky` addon as its primary 3D background. The water keeps the
upstream reflective/distorted material and animated normal-map flow, while
`web/portal/world.js` adds a small runtime normal-strength adjustment so the
surface reads as a calmer lake rather than open ocean. A fogged distant
shoreline, sky reflection, and lower-intensity sun complete the lake horizon.

Pointer movement steers the Three.js camera over the water and changes the
distortion strength. Clicking the stage raycasts onto the Water plane and
injects a localized impulse into a 256x256 GPU height field. Two render
targets ping-pong through a damped, world-space finite-difference wave equation;
the first step adds a restrained capillary train instead of a hard UI ring.
The live field is sampled both for vertex displacement and for the local
surface gradient that bends the reflection. Four bookkeeping slots allow rapid
clicks to overlap before they decay; the `data-world-ripple-*` state exposes
the mapped hit, active slot, count, peak height, and expanding radius for
browser checks.
A local muted WebM capture remains a fallback only for browsers that cannot
create the WebGL scene.

## Vendored Three.js source

- Package: `three` `0.186.0`, MIT licensed.
- Core: `web/vendor/three/three.module.js` and `web/vendor/three/three.core.js`.
- Water addon: `web/vendor/three/addons/objects/Water.js`.
- Sky addon: `web/vendor/three/addons/objects/Sky.js`.
- Normal map: `web/vendor/three/textures/waternormals.jpg`.
- License copy: `web/vendor/three/LICENSE`.
- Source: [Three.js Water.js](https://github.com/mrdoob/three.js/blob/r186/examples/jsm/objects/Water.js), [Three.js Sky.js](https://github.com/mrdoob/three.js/blob/r186/examples/jsm/objects/Sky.js), [the official ocean/sky example](https://github.com/mrdoob/three.js/blob/r186/examples/webgl_shaders_ocean.html), [Three.js r186 license](https://github.com/mrdoob/three.js/blob/r186/LICENSE), and [the official water normal map](https://github.com/mrdoob/three.js/blob/r186/examples/textures/waternormals.jpg).

The vendored addons have mechanical import-path adjustments so the static
portal can load them without a CDN. The Water implementation remains the
upstream Three.js source; the lake profile is a runtime material override, not
a replacement renderer. The runtime stays within the portal's `script-src
'self'` / `connect-src 'self'` policy.

## Video fallback provenance

- File: `web/portal/water-surface.webm` (fallback only)
- Source: [Ocean waves at Lækjavik beach, Iceland](https://commons.wikimedia.org/wiki/File:Ocean_waves_at_L%C3%A6kjavik_beach%2C_Iceland.webm)
- Author: Alexander Grebenkov
- License: [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/)
- SHA-256: `538FB3999C7426FD32E49AEC4329CF88CD8FB1A36C81484BBC8297BEDCE61E4B`

The fallback binary is checked into the portal so production does not depend
on a third-party hotlink.
