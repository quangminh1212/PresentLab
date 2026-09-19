import { resolve } from "node:path";

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { describe, expect, it } from "vitest";

describe("MCP stdio contract", () => {
  it("negotiates, lists primitives, validates a deck, and reads resources", async () => {
    const client = new Client({ name: "presentlab-integration-test", version: "0.1.0" });
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [resolve("dist/cli.js"), "mcp"],
      cwd: process.cwd(),
    });

    try {
      await client.connect(transport);
      const tools = await client.listTools();
      const resources = await client.listResources();
      const prompts = await client.listPrompts();
      const validation = await client.callTool({
        name: "presentlab_validate_deck",
        arguments: { input: "examples/aurora/deck.html" },
      });
      const schema = await client.readResource({ uri: "presentlab://schema/deck" });

      expect(tools.tools.map((tool) => tool.name)).toEqual(
        expect.arrayContaining([
          "presentlab_validate_deck",
          "presentlab_render_deck",
          "presentlab_build_catalog",
          "presentlab_list_templates",
        ]),
      );
      expect(resources.resources.map((resource) => resource.uri)).toEqual(
        expect.arrayContaining(["presentlab://schema/deck", "presentlab://templates"]),
      );
      expect(prompts.prompts.map((prompt) => prompt.name)).toContain("presentlab_design_deck");
      expect(validation.isError).not.toBe(true);
      expect(validation.structuredContent).toMatchObject({ valid: true, slideCount: 3 });
      expect(schema.contents[0]).toMatchObject({ mimeType: "application/schema+json" });
    } finally {
      await client.close();
    }
  }, 120_000);
});
