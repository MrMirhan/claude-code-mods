import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { DASH_PATTERN, stubIntersectionObserver } from "@/components/docs/testSupport";
import {
  ASK_CLAUDE_EXAMPLE_PROMPT,
  ASK_CLAUDE_KEEP,
  ASK_CLAUDE_SKIPPED,
  ASK_CLAUDE_STEPS,
  LEARN_SOURCES,
  MODS_MIN_VERSION,
  officialModDoc,
  RETIRED_FLAG_NAME,
  RUN_WARNING,
  STARTER_LIMITS,
  TESTED_WITH,
} from "@/components/docs/learnContent";
import { PAGE_SEO } from "@/lib/seo/pages";
import { COMMUNITY_REPOSITORY_URL, SITE_URL } from "@/lib/site";
import { STARTER_MOD_DIRECTORY, STARTER_MOD_FILES, loadStarterModFiles } from "@/lib/starter-mod";
import GettingStartedPage, { metadata } from "./page";

beforeAll(stubIntersectionObserver);

describe("getting started page", () => {
  it("has exactly one h1, ordered headings and no em or en dashes", () => {
    const { container } = render(<GettingStartedPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(container.textContent).not.toMatch(DASH_PATTERN);
    const levels = screen.getAllByRole("heading").map((heading) => Number(heading.tagName.slice(1)));
    levels.slice(1).forEach((level, index) => {
      expect(level - levels[index]).toBeLessThanOrEqual(1);
    });
  });

  it("warns first that the API is new and can change, and says which Claude Code version the commands were run on", () => {
    render(<GettingStartedPage />);
    const warning = screen.getAllByRole("note").find((note) => note.getAttribute("data-tone") === "warning");
    expect(warning).toHaveTextContent(/can change between releases/);
    expect(warning).not.toHaveTextContent(/early access|without notice/);
    expect(warning).toHaveTextContent(`Claude Code ${TESTED_WITH.claudeCodeVersion}`);
    expect(warning).toHaveTextContent(TESTED_WITH.date);
    expect(within(warning as HTMLElement).getByRole("link", { name: /^Create a mod/ })).toHaveAttribute(
      "href",
      LEARN_SOURCES.modsCreateDocs,
    );
  });

  it("offers asking Claude for a mod as the first section, before any manual setup", () => {
    const { container } = render(<GettingStartedPage />);
    const sectionIds = Array.from(container.querySelectorAll("section[id]")).map((section) => section.id);
    expect(sectionIds[0]).toBe("ask-claude");
    expect(sectionIds.indexOf("ask-claude")).toBeLessThan(sectionIds.indexOf("starter"));
  });

  it("walks through asking Claude for a mod, from the plugin-authoring skill to keeping the mod", () => {
    const { container } = render(<GettingStartedPage />);
    const element = container.querySelector("#ask-claude") as HTMLElement;
    const section = within(element);
    expect(section.getByText("plugin-authoring")).toBeInTheDocument();
    expect(section.getByText("/plugin-authoring")).toBeInTheDocument();
    const steps = section.getByRole("list", { name: "Steps to have Claude write a mod" });
    for (const step of ASK_CLAUDE_STEPS) expect(within(steps).getByText(step.title)).toBeInTheDocument();
    expect(element.textContent).toContain(ASK_CLAUDE_EXAMPLE_PROMPT);
    expect(element.textContent).toContain(ASK_CLAUDE_KEEP);
    expect(section.getByText("claude --plugin-dir ~/mods/git-branch")).toBeInTheDocument();
    for (const reason of ASK_CLAUDE_SKIPPED) expect(section.getByText(reason)).toBeInTheDocument();
    expect(section.getByRole("link", { name: /^Create a mod/ })).toHaveAttribute("href", LEARN_SOURCES.modsCreateDocs);
    expect(section.getByRole("link", { name: "mods are on" })).toHaveAttribute("href", "#enable");
  });

  it("warns that a mod Claude writes runs with your permissions, before the command that loads one", () => {
    const { container } = render(<GettingStartedPage />);
    const section = within(container.querySelector("#ask-claude") as HTMLElement);
    const warning = section.getByRole("note");
    expect(warning).toHaveAttribute("data-tone", "warning");
    expect(warning).toHaveTextContent(/runs with your permissions/);
    const command = section.getByText("claude --plugin-dir ~/mods/git-branch");
    expect(warning.compareDocumentPosition(command) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("gives the terminal and Desktop versions separately, with a way to check each", () => {
    const { container } = render(<GettingStartedPage />);
    const element = container.querySelector("#enable") as HTMLElement;
    const section = within(element);
    expect(element.textContent).toContain(`Claude Code v${MODS_MIN_VERSION.terminal} or later`);
    expect(element.textContent).toContain(`Code tab from v${MODS_MIN_VERSION.desktop}`);
    expect(section.getByText("claude --version")).toBeInTheDocument();
    expect(section.getByText("/status")).toBeInTheDocument();
  });

  it("shows how to see which mods a session loaded, and how to turn mods off", () => {
    const { container } = render(<GettingStartedPage />);
    const element = container.querySelector("#enable") as HTMLElement;
    expect(within(element).getByText("1 mod active · first-mod")).toBeInTheDocument();
    expect(element.textContent).toMatch(/Built-in mods are left out of that line/);
    for (const off of ["--safe-mode", "\"disableAllHooks\": true"]) expect(element.textContent).toContain(off);
    expect(within(element).getByRole("link", { name: /^mods overview/ })).toHaveAttribute("href", LEARN_SOURCES.modsOverviewDocs);
  });

  it("tells a reader to remove the retired early access variable, and never gives it as a command", () => {
    const { container } = render(<GettingStartedPage />);
    const element = container.querySelector("#enable") as HTMLElement;
    const note = within(element).getByRole("note");
    expect(note).toHaveTextContent(`If you set ${RETIRED_FLAG_NAME} during early access, remove it.`);
    expect(note).toHaveTextContent(/setting it to 0 does not keep mods off/);
    expect(container.textContent).not.toMatch(new RegExp(`${RETIRED_FLAG_NAME}=`));
  });

  it("shows every starter file, exactly as it is on disk, under its own name", () => {
    const { container } = render(<GettingStartedPage />);
    const section = container.querySelector("#starter") as HTMLElement;
    for (const file of loadStarterModFiles()) {
      const block = within(section).getByRole("group", { name: `Contents of ${file.path}` });
      expect(block.textContent, file.path).toBe(file.content);
    }
    expect(within(section).getAllByRole("figure")).toHaveLength(STARTER_MOD_FILES.length);
  });

  it("links the starter folder in the community repository", () => {
    const { container } = render(<GettingStartedPage />);
    const link = within(container.querySelector("#starter") as HTMLElement).getByRole("link", { name: new RegExp(STARTER_MOD_DIRECTORY) });
    expect(link).toHaveAttribute("href", `${COMMUNITY_REPOSITORY_URL}/tree/main/${STARTER_MOD_DIRECTORY}`);
  });

  it("states what the starter does and does not catch, in its own callout", () => {
    const { container } = render(<GettingStartedPage />);
    const callout = within(container.querySelector("#starter") as HTMLElement).getByRole("note");
    expect(callout).toHaveTextContent(STARTER_LIMITS);
    expect(callout).toHaveTextContent(/teaching example, not a security boundary/);
    expect(callout).toHaveTextContent(/sudo/);
    expect(callout).toHaveTextContent(/Do not rely on it/);
  });

  it("starts from a clone of the repository, so the relative paths in the commands resolve", () => {
    const { container } = render(<GettingStartedPage />);
    const section = within(container.querySelector("#starter") as HTMLElement);
    expect(section.getByText(`git clone ${COMMUNITY_REPOSITORY_URL}.git`)).toBeInTheDocument();
    expect(section.getByText("cd claude-code-mods")).toBeInTheDocument();
  });

  it("warns, before the first command that runs the mod, that running a mod executes its code", () => {
    const { container } = render(<GettingStartedPage />);
    const section = container.querySelector("#test") as HTMLElement;
    const warning = within(section).getByRole("note");
    expect(warning).toHaveAttribute("data-tone", "warning");
    for (const paragraph of RUN_WARNING) expect(warning).toHaveTextContent(paragraph);
    expect(warning).toHaveTextContent(/runs its code with your permissions/);
    // The warning comes before the command, in document order.
    const command = within(section).getByText(new RegExp(`claude plugin test ${STARTER_MOD_DIRECTORY}`));
    expect(warning.compareDocumentPosition(command) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("gives copyable test, validate and run commands for the starter folder, with no enable variable", () => {
    render(<GettingStartedPage />);
    for (const command of [
      `claude plugin test ${STARTER_MOD_DIRECTORY}`,
      `claude plugin validate ${STARTER_MOD_DIRECTORY}`,
      `claude --plugin-dir ${STARTER_MOD_DIRECTORY}`,
    ]) {
      expect(screen.getByText(command)).toBeInTheDocument();
    }
  });

  it("does not say the tested files are guaranteed to be the ones shown", () => {
    const { container } = render(<GettingStartedPage />);
    expect(container.textContent).not.toMatch(/so they are the files that were tested/);
    expect(container.textContent).toMatch(/in this site.s repository when the site is built/);
  });

  it("does not claim the starter was run in a live session", () => {
    const { container } = render(<GettingStartedPage />);
    expect(container.textContent).toMatch(/was not run in a live session/);
  });

  it("says where Claude Code writes a mod's types, and no longer sends readers to /plugin-types", () => {
    const { container } = render(<GettingStartedPage />);
    const element = container.querySelector("#types") as HTMLElement;
    expect(within(element).getByText(".claude-plugin/types/")).toBeInTheDocument();
    expect(element.textContent).toMatch(/trust the files/);
    expect(element.textContent).not.toMatch(/\/plugin-types/);
  });

  it("names the environment limits and the test kit notes", () => {
    render(<GettingStartedPage />);
    expect(screen.getByText(/no DOM and no Node/)).toBeInTheDocument();
    expect(screen.getByText(/no test\.each/)).toBeInTheDocument();
  });

  it("links the official Test a mod and Troubleshoot a mod pages where they help", () => {
    const { container } = render(<GettingStartedPage />);
    const testSection = within(container.querySelector("#test") as HTMLElement);
    expect(testSection.getByRole("link", { name: /^Test a mod/ })).toHaveAttribute("href", officialModDoc("test").href);
    const nextSection = within(container.querySelector("#next") as HTMLElement);
    expect(nextSection.getByRole("link", { name: /^Troubleshoot a mod/ })).toHaveAttribute("href", officialModDoc("troubleshoot").href);
    expect(nextSection.getByRole("link", { name: "Learn" }).getAttribute("href")).toMatch(/^\/learn\/?#official-docs$/);
  });

  it("links on to the migration guide", () => {
    render(<GettingStartedPage />);
    const link = screen.getByRole("link", { name: "classic hooks to function hooks" });
    expect(link.getAttribute("href")).toMatch(/^\/learn\/migration\/?$/);
  });

  it("has its own canonical URL", () => {
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}${PAGE_SEO.learnGettingStarted.path}`);
  });

  it("embeds one parseable JSON-LD graph with Learn as the parent step", () => {
    const { container } = render(<GettingStartedPage />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    const graph = JSON.parse(scripts[0].textContent ?? "") as { "@graph": { "@type": string; itemListElement?: { name: string }[] }[] };
    const crumbs = graph["@graph"].find((node) => node["@type"] === "BreadcrumbList")?.itemListElement ?? [];
    expect(crumbs.map((crumb) => crumb.name)).toEqual(["Home", "Learn", "Getting started"]);
  });
});
