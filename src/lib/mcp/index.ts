import { defineMcp } from "@lovable.dev/mcp-js";
import getPricing from "./tools/get-pricing";
import listCurriculumLevels from "./tools/list-curriculum-levels";
import getContactInfo from "./tools/get-contact-info";

export default defineMcp({
  name: "araba-libaneza-mcp",
  title: "Arabă Libaneză cu Ibra",
  version: "0.1.0",
  instructions:
    "Public tools for the Arabă Libaneză cu Ibra Lebanese-Arabic language school. Use `get_pricing` for course fees (LEI), `list_curriculum_levels` for the CEFR A1–C2 structure, and `get_contact_info` for how to reach the school.",
  tools: [getPricing, listCurriculumLevels, getContactInfo],
});