# Vendored Three.js runtime

This directory contains the `three` `0.186.0` runtime and the official
`Water.js` addon used by the PresentLab portal.

- Upstream: https://github.com/mrdoob/three.js/tree/r186
- License: see [`LICENSE`](./LICENSE) (MIT)
- Water addon: [`addons/objects/Water.js`](./addons/objects/Water.js)
- Normal map: [`textures/waternormals.jpg`](./textures/waternormals.jpg)

`Water.js` has only its package import rewritten to the adjacent local
`three.module.js`, allowing the static portal to run without a CDN or import
map. The Three.js implementation, including its water shader, is otherwise
kept from upstream.
