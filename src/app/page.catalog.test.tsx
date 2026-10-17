import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { stubIntersectionObserver } from "@/components/home/__fixtures__/intersection-observer";
import { kindHref } from "@/lib/kind-hubs";
import { EXTENSION_KINDS } from "@/lib/types";
import HomePage from "./page";

const EM_OR_EN_DASH = /[–—]/;

// Renders against the bundled catalog.json (a local file, no network) so a bad catalog edit
// that would break the landing page or introduce a banned dash fails here first.
describe("home page with the bundled catalog", () => {
  beforeAll(stubIntersectionObserver);

  it("renders one h1, one link per kind, and no em or en dashes or concept wording", () => {
    const { container } = render(<HomePage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(container.textContent).not.toMatch(EM_OR_EN_DASH);
    expect(container.textContent).not.toMatch(/concept/i);

    const kindRegion = screen.getByRole("region", { name: "Extension kinds" });
    const kindLinkHrefs = within(kindRegion)
      .getAllByRole("link")
      .map((link) => (link.getAttribute("href") ?? "").replace(/\/(?=\?|$)/, ""));
    expect(kindLinkHrefs).toHaveLength(EXTENSION_KINDS.length);
    // Next's Link drops the trailing slash under test, so both sides are compared without it.
    expect(new Set(kindLinkHrefs)).toEqual(new Set(EXTENSION_KINDS.map((kind) => kindHref(kind).replace(/\/(?=\?|$)/, ""))));
  });
});
