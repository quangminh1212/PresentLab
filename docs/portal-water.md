# Portal water surface

The hero renders a seamless close-up water surface directly in Three.js. A full-screen
`ShaderMaterial` combines the local water-normal texture, layered flowing highlights,
and four short-lived ripple events. Pointer movement and taps feed screen-space ripple
positions to the fragment shader; no camera horizon, shoreline, or stock footage sits
behind the surface.

The local normal map adds irregular surface detail while the procedural wave field keeps
the animation working if the map fails to load. When WebGL is unavailable or its context
is lost, the hero switches to a CSS water surface with a reduced-motion-aware animation.
With `prefers-reduced-motion`, Three.js draws one still frame and ignores ripple input.
The portal does not load external images, fonts, or video.

## Runtime files

- `web/portal/world.js` creates the shader, schedules visible-page rendering, and handles
  pointer ripples.
- `web/portal/world.css` defines the full-screen hero and visual CSS fallback.
- `web/vendor/three/three.module.js` and `three.core.js` are the pinned local renderer.
- `web/vendor/three/textures/waternormals.jpg` is the tiled normal map used by the shader.
- `scripts/build-vercel.mjs` copies only the runtime assets used by the portal.
- `scripts/verify-portal-assets.mjs` verifies the deployed water runtime and asserts that
  the retired coastline video is absent.
