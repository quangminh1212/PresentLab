# Vendored Three.js runtime

This directory contains the pinned Three.js `0.186.0` runtime and selected official
addons. The PresentLab portal uses the local renderer and water-normal texture for its
custom close-up surface shader. The `Water.js` and `Sky.js` addons remain available in
the repository but are not part of the portal's static deployment.

- Upstream: https://github.com/mrdoob/three.js/tree/r186
- License: see [`LICENSE`](./LICENSE) (MIT)
- Runtime entry: [`three.module.js`](./three.module.js)
- Runtime core: [`three.core.js`](./three.core.js)
- Water normal map: [`textures/waternormals.jpg`](./textures/waternormals.jpg)

The renderer and texture are served locally, so the portal does not need a CDN or import
map at runtime. `scripts/build-vercel.mjs` copies only the files needed by the deployed
portal.
