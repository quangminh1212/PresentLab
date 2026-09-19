export { buildCatalog } from "./core/catalog.js";
export { inspectDeckFile, inspectDeckHtml, toValidationResult } from "./core/inspect.js";
export { renderDeck, artifactSummary } from "./core/render.js";
export { getWorkspaceRoot, resolveWorkspacePath } from "./core/files.js";
export {
  CatalogFormatSchema,
  DeckManifestSchema,
  OutputFormatSchema,
  PageFormatSchema,
  pageDimensions,
} from "./core/schema.js";
export type {
  CatalogFormat,
  DeckInspection,
  DeckManifest,
  OutputFormat,
  PageFormat,
  SlideInspection,
  ValidationResult,
} from "./core/schema.js";
export type { RenderArtifact, RenderDeckOptions, RenderResult } from "./core/render.js";
export { createPresentLabServer, runMcpServer } from "./mcp/server.js";
