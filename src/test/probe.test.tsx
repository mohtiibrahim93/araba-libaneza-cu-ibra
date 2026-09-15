import { describe, it } from "vitest";
import { renderRoute } from "@/test/helpers/appRouter";

describe("probe", () => {
  it("renders /", async () => {
    const { container, router } = renderRoute("/");
    await (router as any).load?.();
    await new Promise((r) => setTimeout(r, 1500));
    console.log("PATH", (router as any).state.location.pathname);
    console.log("HTML", container.innerHTML.slice(0, 600));
  });
});
