import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { DASH_PATTERN, stubIntersectionObserver } from "@/components/docs/testSupport";
import {
  BUILT_IN_MODS,
  builtInModSourceHref,
  CONCEPTS,
  KIND_COMPARISON,
  KIND_COMPARISON_COLUMNS,
  LEARN_FAQ,
  LEARN_SOURCES,
  MODS_MIN_VERSION,
  OFFICIAL_MOD_DOCS,
  WHERE_MODS_RUN,
} from "@/components/docs/learnContent";
import { getEvents, getEventsSource } from "@/lib/events";
import { PAGE_SEO } from "@/lib/seo/pages";
import { SITE_URL } from "@/lib/site";
import LearnPage, { metadata } from "./page";

beforeAll(stubIntersectionObserver);

/** next/link applies `trailingSlash` only in a real build, so compare internal paths without it. */
function pathOf(element: HTMLElement): string | null {
  return element.getAttribute("href")?.replace(/\/$/, "") ?? null;
}

describe("learn page", () => {
  it("has exactly one h1, ordered headings and no em or en dashes", () => {
    const { container } = render(<LearnPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(container.textContent).not.toMatch(DASH_PATTERN);
    const levels = screen.getAllByRole("heading").map((heading) => Number(heading.tagName.slice(1)));
    levels.slice(1).forEach((level, index) => {
      expect(level - levels[index]).toBeLessThanOrEqual(1);
    });
  });

  it("says up front which versions have mods on, that the API can change, and that the site is unofficial", () => {
    render(<LearnPage />);
    const note = screen.getByRole("note");
    expect(note).toHaveTextContent(`Claude Code v${MODS_MIN_VERSION.terminal} or later in the terminal`);
    expect(note).toHaveTextContent(`from v${MODS_MIN_VERSION.desktop} in the Code tab of the Desktop app`);
    expect(note).toHaveTextContent(/can change between releases/);
    expect(note).not.toHaveTextContent(/early access|without notice|function hooks are enabled/);
    expect(note).toHaveTextContent(/unofficial/);
    expect(note).toHaveTextContent(/with each table/);
  });

  it("says which kinds work from outside Claude Code without counting the plugin row among them", () => {
    const { container } = render(<LearnPage />);
    const intro = (container.querySelector("#compared") as HTMLElement).textContent ?? "";
    expect(intro).toContain("Classic hooks, skills and MCP servers work from outside Claude Code");
    expect(intro).not.toMatch(/The others work from outside/);
  });

  it("explains what a mod is and the five ideas behind it", () => {
    render(<LearnPage />);
    // level: 2 disambiguates from the FAQ section's own "What is a Claude Mod?" question, an h3.
    expect(screen.getByRole("heading", { name: "What is a Claude Mod?", level: 2 })).toBeInTheDocument();
    for (const term of ["A hook is a function", "The $ object", "next continues the chain", "Administrators sit outermost", "Plugins can draw"]) {
      expect(screen.getByText(term)).toBeInTheDocument();
    }
  });

  it("lists every official mods docs page, each linked to its own URL", () => {
    const { container } = render(<LearnPage />);
    const section = within(container.querySelector("#official-docs") as HTMLElement);
    const links = section.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(OFFICIAL_MOD_DOCS.map((page) => page.href));
    for (const page of OFFICIAL_MOD_DOCS) expect(section.getByText(page.covers, { exact: false })).toBeInTheDocument();
    expect(section.getByText(/trust the docs/)).toBeInTheDocument();
  });

  it("compares a mod with each other kind in one table, each row with its source links", () => {
    const { container } = render(<LearnPage />);
    const table = within(container.querySelector("#compared") as HTMLElement).getByRole("table");
    expect(within(table).getAllByRole("rowheader").map((header) => header.textContent)).toEqual(KIND_COMPARISON.map((row) => row.name));
    const rows = within(table).getAllByRole("row").slice(1);
    KIND_COMPARISON.forEach((kind, index) => {
      const row = rows[index] as HTMLElement;
      expect(row).toHaveTextContent(kind.pickItWhen);
      for (const source of kind.sources) {
        expect(within(row).getByRole("link", { name: new RegExp(source.label) })).toHaveAttribute("href", source.href);
      }
    });
    expect(within(table).getAllByRole("columnheader").map((header) => header.textContent)).toEqual([...KIND_COMPARISON_COLUMNS]);
  });

  it("shows where a mod's hooks run and where its drawing shows, from the overview", () => {
    const { container } = render(<LearnPage />);
    const element = container.querySelector("#where-mods-run") as HTMLElement;
    const table = within(element).getByRole("table");
    expect(within(table).getAllByRole("rowheader").map((header) => header.textContent)).toEqual(WHERE_MODS_RUN.map((place) => place.where));
    expect(element.textContent).toMatch(/only the terminal and the Code tab of the Desktop app show/);
    expect(within(element).getByRole("link", { name: /^Mods overview/ })).toHaveAttribute("href", LEARN_SOURCES.modsOverviewDocs);
  });

  it("lists the six built-in mods, links the four with public source, and marks the other two not public", () => {
    const { container } = render(<LearnPage />);
    const element = container.querySelector("#built-in") as HTMLElement;
    const table = within(element).getByRole("table");
    expect(within(table).getAllByRole("rowheader").map((header) => header.textContent)).toEqual(BUILT_IN_MODS.map((mod) => mod.name));
    const sourceLinks = within(table).getAllByRole("link");
    expect(sourceLinks.map((link) => link.getAttribute("href"))).toEqual(
      BUILT_IN_MODS.map(builtInModSourceHref).filter((href): href is string => href !== null),
    );
    expect(within(table).getAllByText("Not public")).toHaveLength(2);
    expect(element.textContent).toMatch(/do not stop them/);
  });

  it("no longer says Anthropic ships four mods", () => {
    const { container } = render(<LearnPage />);
    expect(container.textContent).not.toMatch(/ships four mods/);
    expect(container.textContent).toContain("Claude Code ships six built-in mods, and Anthropic publishes the source of four of them.");
  });

  it("reports the event counts from the synced file, and names the commit they were read at", () => {
    const { container } = render(<LearnPage />);
    const source = getEventsSource();
    const section = container.querySelector("#events") as HTMLElement;
    expect(section.textContent).toContain(`${getEvents().length} events`);
    expect(section.textContent).toContain(source.sha.slice(0, 7));
    expect(section.textContent).toContain(source.syncedAt);
    expect(pathOf(within(section).getByRole("link", { name: "Hooks page" }))).toBe("/hooks");
  });

  it("links the announcement issue and the Mods README as external links that open safely", () => {
    render(<LearnPage />);
    for (const [name, href] of [["announcement issue", LEARN_SOURCES.announcementIssue], ["Mods README", LEARN_SOURCES.modsReadme]] as const) {
      const link = screen.getAllByRole("link", { name: new RegExp(name) })[0];
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("counts the other ways from the table, not from a number written in the copy", () => {
    const { container } = render(<LearnPage />);
    const intro = (container.querySelector("#compared") as HTMLElement).textContent ?? "";
    expect(intro).toContain(`extended in ${KIND_COMPARISON.length - 1} other ways`);
    expect(KIND_COMPARISON.length - 1).toBe(4);
  });

  it("links a source under every idea, and does not claim that every claim is linked", () => {
    const { container } = render(<LearnPage />);
    const section = container.querySelector("#how-it-works") as HTMLElement;
    for (const concept of CONCEPTS) {
      const row = within(section).getByText(concept.term).closest("div") as HTMLElement;
      for (const source of concept.sources) {
        expect(within(row).getByRole("link", { name: new RegExp(source.label) })).toHaveAttribute("href", source.href);
      }
    }
    expect(screen.getByRole("note")).not.toHaveTextContent(/every claim/);
  });

  it("does not claim the site reviewed or scanned anything", () => {
    const { container } = render(<LearnPage />);
    expect(container.textContent).not.toMatch(/\b(reviewed|scanned|audited|verified by)\b/i);
  });

  it("gives the video tutorials and the getting-started guide their own prominent buttons, above the fold", () => {
    render(<LearnPage />);
    const primary = screen.getByRole("link", { name: "Watch the video tutorials" });
    const secondary = screen.getByRole("link", { name: "Build your first mod" });
    expect(pathOf(primary)).toBe("/learn/tutorials");
    expect(pathOf(secondary)).toBe("/learn/getting-started");
    // Both buttons come before the first h2, so they read as an action a visitor can take immediately.
    const firstHeading = screen.getAllByRole("heading", { level: 2 })[0];
    expect(primary.compareDocumentPosition(firstHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("links on to getting started, the migration guide, the video tutorials and the security page", () => {
    render(<LearnPage />);
    expect(pathOf(screen.getByRole("link", { name: "Getting started guide" }))).toBe("/learn/getting-started");
    expect(pathOf(screen.getByRole("link", { name: "classic hooks to function hooks" }))).toBe("/learn/migration");
    expect(pathOf(screen.getByRole("link", { name: "official video tutorials" }))).toBe("/learn/tutorials");
    expect(pathOf(screen.getByRole("link", { name: /what this site does and does not check/ }))).toBe("/security");
    const runtimeLink = screen.getByRole("link", { name: "how Claude Code keeps a mod in check" });
    expect(runtimeLink.getAttribute("href")).toMatch(/^\/security\/?#mod-runtime$/);
  });

  it("has its own canonical URL", () => {
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}${PAGE_SEO.learn.path}`);
  });

  it("embeds one parseable JSON-LD graph, with a FAQPage matching the visible questions and answers exactly", () => {
    const { container } = render(<LearnPage />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    const parsed = JSON.parse(scripts[0].textContent ?? "") as {
      "@graph": readonly { "@type": string; mainEntity?: readonly { name: string; acceptedAnswer: { text: string } }[] }[];
    };
    const faqNode = parsed["@graph"].find((node) => node["@type"] === "FAQPage");
    expect(faqNode?.mainEntity).toHaveLength(LEARN_FAQ.length);
    for (const entry of LEARN_FAQ) {
      const question = faqNode?.mainEntity?.find((candidate) => candidate.name === entry.question);
      expect(question, entry.id).toBeDefined();
      expect(question?.acceptedAnswer.text).toBe(entry.answer);
    }
  });

  it("shows every FAQ question and its exact answer, the same text the JSON-LD states", () => {
    const { container } = render(<LearnPage />);
    const faqSection = container.querySelector("#faq") as HTMLElement;
    for (const entry of LEARN_FAQ) {
      expect(within(faqSection).getByText(entry.question), entry.id).toBeInTheDocument();
      expect(within(faqSection).getByText(entry.answer), entry.id).toBeInTheDocument();
    }
  });

  it("gives each FAQ question a real h3, reachable by a screen reader's heading navigation, and its own anchor", () => {
    const { container } = render(<LearnPage />);
    const faqSection = container.querySelector("#faq") as HTMLElement;
    expect(within(faqSection).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual(
      LEARN_FAQ.map((entry) => entry.question),
    );
    for (const entry of LEARN_FAQ) expect(container.querySelector(`[id="${entry.id}"]`), entry.id).not.toBeNull();
  });

  it("keeps the FAQ's own claims lined up with the section each one restates: the exact same phrase must appear in both, not just a similar one", () => {
    const { container } = render(<LearnPage />);
    const sectionText = (id: string) => (container.querySelector(`#${id}`) as HTMLElement).textContent ?? "";
    const faqAnswer = (id: string) => LEARN_FAQ.find((entry) => entry.id === id)?.answer ?? "";

    for (const [sectionId, faqId, sharedPhrase] of [
      ["what-is-a-mod", "faq-what-is-a-mod", "hooks the engine's events with JavaScript or TypeScript functions shaped"],
      ["events", "faq-what-can-a-mod-hook", "The Hooks page shows which mods and plugins use which events."],
      ["next", "faq-build-first-mod", "Build a small mod in the Getting started guide"],
    ] as const) {
      expect(sectionText(sectionId), sectionId).toContain(sharedPhrase);
      expect(faqAnswer(faqId), faqId).toContain(sharedPhrase);
    }
  });
});
