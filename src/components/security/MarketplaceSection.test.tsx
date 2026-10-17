import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { DASH_PATTERN, stubIntersectionObserver } from "@/components/docs/testSupport";
import { getAllExtensions } from "@/lib/catalog";
import { marketplaceAddCommand, pinTreeUrl } from "@/lib/marketplace";
import { getMarketplacePins } from "@/lib/marketplace-data";
import { MarketplaceSection } from "./MarketplaceSection";

beforeAll(stubIntersectionObserver);

describe("MarketplaceSection", () => {
  it("gives the add command and one row per pin, linking the entry page and the pinned commit", () => {
    const pins = getMarketplacePins();
    const extensions = getAllExtensions();
    const { container } = render(<MarketplaceSection pins={pins} extensions={extensions} />);
    expect(screen.getByText(marketplaceAddCommand())).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Plugins in the community marketplace" });
    for (const pin of pins) {
      const name = extensions.find((extension) => extension.slug === pin.slug)?.name ?? pin.name;
      const pageLink = within(table).getByRole("link", { name });
      expect(pageLink.getAttribute("href")).toMatch(new RegExp(`^/extensions/${pin.slug}/?$`));
      expect(within(table).getByRole("link", { name: new RegExp(pin.source.sha.slice(0, 7)) }).getAttribute("href")).toBe(pinTreeUrl(pin));
    }
    expect(container.textContent).not.toMatch(DASH_PATTERN);
  });

  it("says a pin is not an audit", () => {
    render(<MarketplaceSection pins={[]} extensions={[]} />);
    expect(screen.getByText(/That reading is not an audit and promises nothing about safety/)).toBeInTheDocument();
  });
});
