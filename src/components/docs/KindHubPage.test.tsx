import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { DASH_PATTERN, stubIntersectionObserver } from "@/components/docs/testSupport";
import { getAllExtensions } from "@/lib/catalog";
import { HUB_KINDS } from "@/lib/kind-hubs";
import { KIND_HUB_CONTENT } from "./kindHubContent";
import { KindHubPage } from "./KindHubPage";

beforeAll(stubIntersectionObserver);

function entriesOf(kind: (typeof HUB_KINDS)[number]) {
  return getAllExtensions().filter((extension) => extension.kind === kind);
}

describe("KindHubPage", () => {
  it.each(HUB_KINDS)("renders one h1 and one card per %s entry, with no long dashes", (kind) => {
    const extensions = entriesOf(kind);
    const { container } = render(<KindHubPage kind={kind} extensions={extensions} />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(KIND_HUB_CONTENT[kind].heading);
    const listings = container.querySelector("#listings");
    expect(listings).not.toBeNull();
    for (const extension of extensions) {
      expect(within(listings as HTMLElement).getByRole("link", { name: extension.name })).toBeInTheDocument();
    }
    expect(container.textContent).not.toMatch(DASH_PATTERN);
  });

  it("lists every entry in its ItemList structured data", () => {
    const extensions = entriesOf("mod");
    const { container } = render(<KindHubPage kind="mod" extensions={extensions} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const graph = JSON.parse(script?.textContent ?? "{}") as { "@graph": { "@type": string; numberOfItems?: number }[] };
    const list = graph["@graph"].find((node) => node["@type"] === "ItemList");
    expect(list?.numberOfItems).toBe(extensions.length);
  });

  it("links the official docs page in a new tab, and the other kind pages", () => {
    render(<KindHubPage kind="plugin" extensions={entriesOf("plugin")} />);
    expect(screen.getByRole("link", { name: /Install plugins in the Claude Code docs/ }).getAttribute("href")).toBe(
      KIND_HUB_CONTENT.plugin.docsUrl,
    );
    const otherKinds = screen.getByRole("region", { name: "Other kinds" });
    expect(within(otherKinds).getByRole("link", { name: "Claude Code mods" })).toBeInTheDocument();
    expect(within(otherKinds).queryByRole("link", { name: "Claude Code plugins" })).not.toBeInTheDocument();
  });

  it("says so when no entry of the kind is listed", () => {
    render(<KindHubPage kind="agent" extensions={[]} />);
    expect(screen.getByText("Nothing of this kind is listed yet.")).toBeInTheDocument();
  });
});

describe("KIND_HUB_CONTENT", () => {
  it("claims nothing about review or testing, and points only at the official docs", () => {
    for (const kind of HUB_KINDS) {
      const content = KIND_HUB_CONTENT[kind];
      const text = [content.heading, content.lead, ...content.about, ...content.gettingIt].join(" ");
      expect(text, kind).not.toMatch(/\b(reviewed|scanned|audited|vetted|tested|curated|guaranteed)\b/i);
      expect(text, kind).not.toMatch(DASH_PATTERN);
      expect(content.docsUrl, kind).toMatch(/^https:\/\/code\.claude\.com\/docs\/en\//);
    }
  });
});
