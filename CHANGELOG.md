# Changelog

All notable changes to PresentLab are documented here.

## [Unreleased]

- Added a 100-template gallery with 700 rendered sample slides and portable HTML/PDF/PPTX folders, indexed by family, palette, and layout modifier.
- Added deterministic gallery build and verification scripts and included the gallery in the release gate and package contents.
- Blocked external HTTP/WebSocket and out-of-workspace local-file assets during trusted workspace rendering.
- Added dynamic MCP resources and fallback tools for reading HTML templates and theme tokens.
- Added package exports, repository metadata, and the `verify:all` release gate.

## [0.1.0] - 2026-09-19

- Initial HTML-first rendering, catalog, PDF, PPTX, MCP, resource, and plugin foundation.
