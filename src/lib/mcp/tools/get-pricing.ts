import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ONLINE_PRICES, physicalPrice } from "@/lib/pricing";

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