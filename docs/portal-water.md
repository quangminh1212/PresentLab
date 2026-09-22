# Portal water background

The portal's opening scene uses a native WebGL 1 procedural water pass in
`web/portal/world.js`. It does not fetch a GIF, video, normal-map image, or
third-party runtime bundle: the grid displacement, Fresnel response, shimmer,
and pointer ripple are generated in GLSL.

The implementation was checked against these open-source references:

- [Nugget8/Three.js-Ocean-Scene](https://github.com/Nugget8/Three.js-Ocean-Scene) — MIT-licensed procedural ocean approach, including a large cheap surface and touch input.
- [martinRenou/threejs-water](https://github.com/martinRenou/threejs-water) — BSD-3-Clause implementation of Evan Wallace's interactive WebGL water demo.
- [three.js ocean example](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_shaders_ocean.html) — official Water/Sky scene reference.

No source file or texture is copied from those projects; the portal keeps a
small dependency-free implementation so the existing HTML-first Vercel build
and WebGL fallback remain intact.
