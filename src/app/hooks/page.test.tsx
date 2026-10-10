import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";
import { DASH_PATTERN, stubIntersectionObserver } from "@/components/docs/testSupport";
import { getAllExtensions } from "@/lib/catalog";
import { buildEventReference, docsOnlyCountPhrase } from "@/lib/event-reference";
import { getEvents, getEventsSource, getSupplementEvents, getSupplementSource } from "@/lib/events";
import { PAGE_SEO } from "@/lib/seo/pages";
import { SITE_URL } from "@/lib/site";
import HooksPage, { metadata } from "./page";

beforeAll(stubIntersectionObserver);

const reference = buildEventReference(getEventsSource(), getEvents(), getAllExtensions(), getSupplementEvents());

function eventTerms(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("#events dt")).map((term) => term.textContent ?? "");
}

function rowElement(container: HTMLElement, name: string): HTMLElement {
  const item = container.querySelector(`[id="event-${name}"]`);
  if (!(item instanceof HTMLElement)) throw new Error(`no row for ${name}`);
  return item;
}

describe("hooks page", () => {
  it("has exactly one h1, ordered headings and no em or en dashes", () => {
    const { container } = render(<HooksPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(container.textContent).not.toMatch(DASH_PATTERN);
    const levels = screen.getAllByRole("heading").map((heading) => Number(heading.tagName.slice(1)));
    levels.slice(1).forEach((level, index) => {
      expect(level - levels[index]).toBeLessThanOrEqual(1);
    });
  });

  it("lists every declared event and every supplement name exactly once, in family groups", () => {
    const { container } = render(<HooksPage />);
    const terms = eventTerms(container);
    expect(terms).toHaveLength(getEvents().length + getSupplementEvents().length);
    expect(new Set(terms).size).toBe(terms.length);
    for (const event of getEvents()) expect(terms).toContain(event.name);
    for (const event of getSupplementEvents()) expect(terms).toContain(event.name);
    expect(screen.getByRole("heading", { level: 3, name: /^Engine/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /^Calls on \$/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /^Classic/ })).toBeInTheDocument();
  });

  it("browses with each family collapsed behind a native summary, closed by default", () => {
    const { container } = render(<HooksPage />);
    const familyDetails = container.querySelectorAll("#events details");
    expect(familyDetails).toHaveLength(3);
    for (const details of familyDetails) expect((details as HTMLDetailsElement).open, details.textContent ?? "").toBe(false);
    expect(screen.getByText(`${reference.rows.length} events in 3 families. Open one, or filter to see matches right away.`)).toBeInTheDocument();
  });

  it("gives every event a row that links where it is declared or listed, and exactly the entries the reference says use it", () => {
    const { container } = render(<HooksPage />);
    for (const row of reference.rows) {
      const item = rowElement(container, row.name);
      const sourceLinkName = row.origin === "declarations" ? /^line \d+/ : /^Anthropic's docs/;
      expect(within(item).getByRole("link", { name: sourceLinkName, hidden: true }), row.name).toHaveAttribute("href", row.sourceUrl);
      const entryLinks = Array.from(item.querySelectorAll("a")).filter((link) => link.getAttribute("href")?.startsWith("/extensions/"));
      expect(entryLinks, row.name).toHaveLength(row.users.length);
    }
  });

  it("names the commit, the Claude Code version and the date the event names were read", () => {
    const { container } = render(<HooksPage />);
    const source = getEventsSource();
    expect(container.textContent).toContain(source.sha.slice(0, 7));
    expect(container.textContent).toContain(source.syncedAt);
    if (source.claudeCodeVersion !== null) expect(container.textContent).toContain(`Claude Code ${source.claudeCodeVersion}`);
  });

  it("says which names come from Anthropic's reference and changelog, checked when, and that use is not checked against code", () => {
    const { container } = render(<HooksPage />);
    const supplement = getSupplementSource();
    const text = container.textContent ?? "";
    expect(text).toContain(`${docsOnlyCountPhrase(getSupplementEvents().length)} from`);
    expect(text).toContain(`Claude Code ${supplement.referenceVersion}`);
    expect(text).toContain(`through ${supplement.changelogThrough}`);
    expect(text).toContain(`checked on ${supplement.checkedAt}`);
    expect(text).toMatch(/descriptions are this site's summary/);
    expect(screen.getByText(/not checked against its code/)).toBeInTheDocument();
    expect(text).not.toMatch(/does not say\s+what an event does/);
  });

  it("covers the names Claude Code added after the reference: prompt.autocomplete, ui.notify, and isDeferred on tool.register", () => {
    const { container } = render(<HooksPage />);
    expect(rowElement(container, "prompt.autocomplete").textContent).toContain("from Claude Code 2.1.292.");
    expect(rowElement(container, "ui.notify").textContent).toContain("from Claude Code 2.1.295.");
    expect(rowElement(container, "tool.register").textContent).toMatch(/2\.1\.293, isDeferred: false/);
  });

  it("explains that a classic hook plugin's plain name is the same event as classic.<Name>", () => {
    render(<HooksPage />);
    expect(screen.getByText(/lists a classic event by its plain name/)).toBeInTheDocument();
  });

  it("does not count or promise run-from-source for the mods, which the catalog does not back", () => {
    const { container } = render(<HooksPage />);
    expect(container.textContent).not.toMatch(/\b(four|4) mods\b/i);
    expect(container.textContent).not.toMatch(/run each one from source/i);
  });

  it("says mods are on by default and that the early access variable is ignored", () => {
    const { container } = render(<HooksPage />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/on by default from Claude Code v2\.1\.287 in the terminal and v2\.1\.286 in the Desktop app/);
    expect(text).toMatch(/v2\.1\.287 and later ignores\s*CLAUDE_CODE_ENABLE_FUNCTION_HOOKS/);
    expect(text).not.toMatch(/Mods are early access/);
    expect(text).not.toMatch(/only where function hooks are enabled/);
  });

  it("lists hook names that select no event apart, and says why, or leaves the section out when there are none", () => {
    const { container } = render(<HooksPage />);
    const section = container.querySelector("#other-names");
    if (reference.otherNames.length === 0) {
      expect(section).toBeNull();
      return;
    }
    if (!(section instanceof HTMLElement)) throw new Error("no #other-names section");
    const terms = Array.from(section.querySelectorAll("dt")).map((term) => term.textContent);
    expect(terms).toEqual(reference.otherNames.map((other) => other.name));
    expect(within(section).getByText(/select none of the events above/)).toBeInTheDocument();
  });

  it("filters the events from the page", async () => {
    const user = userEvent.setup();
    const { container } = render(<HooksPage />);
    await user.type(screen.getByRole("searchbox", { name: "Filter events" }), "fs.write");
    expect(eventTerms(container)).toEqual(["fs.write"]);
    expect(screen.getByRole("status")).toHaveTextContent(`Showing 1 of ${reference.rows.length} events`);
  });

  it("has its own canonical URL and a unique title", () => {
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}${PAGE_SEO.hooks.path}`);
  });

  it("embeds one parseable JSON-LD graph", () => {
    const { container } = render(<HooksPage />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    expect(() => JSON.parse(scripts[0].textContent ?? "")).not.toThrow();
  });
});
