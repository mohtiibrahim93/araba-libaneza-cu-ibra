import { defineTool } from "@lovable.dev/mcp-js";

// Inlined from src/lib/pricing.ts to keep this tool import-safe in the
// Deno-bundled MCP function (which does not resolve the Vite "@/..." alias).
const ONLINE_PRICES = {
  groupMonthly: { A1: 500, A2: 600, B1: 700, B2: 800, C1: 900, C2: 1000 } as Record<string, number>,
  privateLesson: 150,
  kidsPrivateLesson: 150,
  kidsGroupMonthly: 500,
};
const round10 = (n: number) => Math.round(n / 10) * 10;
const physicalPrice = (online: number) => round10(online * 1.4);

export default defineTool({
  name: "get_pricing",
  title: "Get course pricing",
  description:
    "Return current pricing (LEI) for all course formats offered by Arabă Libaneză cu Ibra: group monthly per CEFR level, private 1:1, and kids programs. Includes both online and physical (in-center) prices.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const groupMonthly = Object.fromEntries(
      Object.entries(ONLINE_PRICES.groupMonthly).map(([lvl, online]) => [
        lvl,
        { online, fizic: physicalPrice(online), unit: "LEI/month" },
      ]),
    );
    const pricing = {
      currency: "LEI",
      groupMonthly,
      privateLesson: {
        online: ONLINE_PRICES.privateLesson,
        fizic: physicalPrice(ONLINE_PRICES.privateLesson),
        unit: "LEI/lesson",
      },
      kidsPrivateLesson: {
        online: ONLINE_PRICES.kidsPrivateLesson,
        fizic: physicalPrice(ONLINE_PRICES.kidsPrivateLesson),
        unit: "LEI/lesson",
      },
      kidsGroupMonthly: {
        online: ONLINE_PRICES.kidsGroupMonthly,
        fizic: physicalPrice(ONLINE_PRICES.kidsGroupMonthly),
        unit: "LEI/month/child (min. 4)",
      },
    };
    return {
      content: [{ type: "text", text: JSON.stringify(pricing, null, 2) }],
      structuredContent: pricing,
    };
  },
});