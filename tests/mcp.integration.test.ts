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
      const resourceTemplates = await client.listResourceTemplates();
      const prompts = await client.listPrompts();
      const validation = await client.callTool({
        name: "presentlab_validate_deck",
        arguments: { input: "examples/aurora/deck.html" },
      });
      const schema = await client.readResource({ uri: "presentlab://schema/deck" });
      const template = await client.readResource({ uri: "presentlab://templates/aurora" });
      const theme = await client.readResource({ uri: "presentlab://themes/aurora" });
      const templateTool = await client.callTool({
        name: "presentlab_get_template",
        arguments: { name: "aurora" },
      });
      const templatesTool = await client.callTool({
        name: "presentlab_list_templates",
        arguments: {},
      });
      const themesTool = await client.callTool({
        name: "presentlab_list_themes",
        arguments: {},
      });

      expect(tools.tools.map((tool) => tool.name)).toEqual(
        expect.arrayContaining([
          "presentlab_validate_deck",
          "presentlab_render_deck",
          "presentlab_build_catalog",
          "presentlab_list_templates",
          "presentlab_get_template",
          "presentlab_list_themes",
        ]),
      );
      expect(resources.resources.map((resource) => resource.uri)).toEqual(
        expect.arrayContaining(["presentlab://schema/deck", "presentlab://templates"]),
      );
      expect(resourceTemplates.resourceTemplates.map((resource) => resource.uriTemplate)).toEqual(
        expect.arrayContaining(["presentlab://templates/{name}", "presentlab://themes/{name}"]),
      );
      expect(prompts.prompts.map((prompt) => prompt.name)).toContain("presentlab_design_deck");
      expect(validation.isError).not.toBe(true);
      expect(validation.structuredContent).toMatchObject({ valid: true, slideCount: 3 });
      expect(schema.contents[0]).toMatchObject({ mimeType: "application/schema+json" });
      expect(template.contents[0]).toMatchObject({ mimeType: "text/html" });
      expect(theme.contents[0]).toMatchObject({ mimeType: "application/json" });
      expect(templateTool.structuredContent).toMatchObject({ name: "aurora" });
      expect(templatesTool.structuredContent).toMatchObject({ templates: expect.any(Array) });
      expect((templatesTool.structuredContent as { templates: unknown[] }).templates).toHaveLength(
        8,
      );
      expect(themesTool.structuredContent).toMatchObject({ themes: expect.any(Array) });
      expect((themesTool.structuredContent as { themes: unknown[] }).themes).toHaveLength(8);
    } finally {
      await client.close();
    }
  }, 120_000);
});
