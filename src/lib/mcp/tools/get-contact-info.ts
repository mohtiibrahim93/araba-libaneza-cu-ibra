import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_contact_info",
  title: "Get contact info",
  description:
    "Return public contact details (email, website) for Arabă Libaneză cu Ibra.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "Arabă Libaneză cu Ibra",
      instructor: "Ibra",
      email: "marhaba@centruldearabalibaneza.com",
      website: "https://centruldearabalibaneza.com",
      languages: ["ro", "en"],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});