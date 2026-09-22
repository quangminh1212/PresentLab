# Vendored Three.js runtime

This directory contains the `three` `0.186.0` runtime plus the official
`Water.js` and `Sky.js` addons used by the PresentLab portal.

- Upstream: https://github.com/mrdoob/three.js/tree/r186
- License: see [`LICENSE`](./LICENSE) (MIT)
- Water addon: [`addons/objects/Water.js`](./addons/objects/Water.js)
- Sky addon: [`addons/objects/Sky.js`](./addons/objects/Sky.js)
- Normal map: [`textures/waternormals.jpg`](./textures/waternormals.jpg)

The addons have only their package imports rewritten to the adjacent local
`three.module.js`, allowing the static portal to run without a CDN or import
map. The Three.js implementations are otherwise kept from upstream; the
portal applies its calmer lake profile at runtime in `web/portal/world.js`.
