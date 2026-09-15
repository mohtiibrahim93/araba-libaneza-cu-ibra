import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "./helpers/router";
import Navbar from "@/components/Navbar";
import { I18nProvider } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";

describe("probe", () => {
  it("renders navbar", () => {
    const { container } = render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <I18nProvider>
            <TooltipProvider delayDuration={0}>
              <Navbar />
            </TooltipProvider>
          </I18nProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
    console.log("HTML:", container.innerHTML.slice(0, 400));
  });
});
