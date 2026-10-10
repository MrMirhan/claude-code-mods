import { SITE_URL } from "@/lib/site";
import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { DASH_PATTERN, stubIntersectionObserver } from "@/components/docs/testSupport";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pickExampleMod, pickSecurityMod, selectAnthropicBuiltInMods } from "@/components/docs/builtInMods";
import {
  ALLOW_MANAGED_MODS_ONLY_JSON,
  FLAG_RETIRED_NOTE,
  GUARD_LOAD_FACTS,
  GUARD_OPTIONS,
  MODS_ADMIN,
  ORG_POLICIES,
  ORG_PRECEDENCE,
  MOD_OFF_SWITCHES,
  MOD_REACH,
  MODS_ADMIN_REVIEW,
  MODS_OVERVIEW_TRUST,
  MODS_OVERVIEW_TURN_OFF,
  RISKY_CALLS,
  RUNTIME_POINTS,
  RUNTIME_SEATS,
  RUNTIME_SEAT_NOTE,
  RUNTIME_SECTION_NOTE,
  SECURITY_MOD_FACTS,
  VALIDATE_COMMAND,
} from "@/components/docs/securityContent";
import { getAllExtensions } from "@/lib/catalog";
import SecurityPage, { metadata } from "./page";

beforeAll(stubIntersectionObserver);

describe("security page", () => {
  it("has exactly one h1, ordered headings and no em or en dashes", () => {
    const { container } = render(<SecurityPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(container.textContent).not.toMatch(DASH_PATTERN);
    const levels = screen.getAllByRole("heading").map((heading) => Number(heading.tagName.slice(1)));
    levels.slice(1).forEach((level, index) => {
      expect(level - levels[index]).toBeLessThanOrEqual(1);
    });
  });

  it("says plainly that no scanner is running and no listing has a tier", () => {
    render(<SecurityPage />);
    expect(
      screen.getByText(/This is a design specification\. No security scanner is running today, so no listing on this site has a tier\./),
    ).toBeInTheDocument();
  });

  it("states what is checked today: Source verified and the structure check", () => {
    const { container } = render(<SecurityPage />);
    const section = within(container.querySelector("#what-is-checked") as HTMLElement);
    expect(section.getByText("Source verified")).toBeInTheDocument();
    expect(section.getByText(/responded with HTTP 200/)).toBeInTheDocument();
    expect(section.getByText("Structure check on community submissions")).toBeInTheDocument();
    expect(section.getByText(/automated check in CI confirms that the manifest\s+files exist and parse/)).toBeInTheDocument();
    expect(section.getByText(/It is not a review of what they contain\./, { exact: false })).toBeInTheDocument();
    expect(section.getByText("npm run catalog:structure")).toBeInTheDocument();
  });

  it("explains that Source verified is not a security review", () => {
    render(<SecurityPage />);
    expect(screen.getByText(/Source verified is not a security review/)).toBeInTheDocument();
  });

  it("derives the built-in mods sentence from the catalog and quotes one entry's own summary", () => {
    const { container } = render(<SecurityPage />);
    const builtIn = selectAnthropicBuiltInMods(getAllExtensions());
    const example = pickExampleMod(builtIn);
    expect(example).toBeDefined();
    const section = within(container.querySelector("#built-in-mods") as HTMLElement);
    expect(section.getByText(new RegExp(`lists ${builtIn.length} mods published by Anthropic\\s+that ship inside Claude Code`))).toBeInTheDocument();
    expect(section.getByText(example?.summary as string)).toBeInTheDocument();
    expect(section.getByText(/says no more about what it does than that text/)).toBeInTheDocument();
    expect(section.getByRole("link", { name: example?.name as string }).getAttribute("href")).toMatch(
      new RegExp(`^/extensions/${example?.slug}/?$`),
    );
  });

  it("hardcodes no entry slug or name in its source", () => {
    const source = readFileSync(path.join(process.cwd(), "src/app/security/page.tsx"), "utf8");
    expect(source).not.toMatch(/sec-default|SECURITY_MOD_SLUG|getExtensionBySlug/);
  });

  it("explains how Claude Code keeps a mod in check, before the proposed tiers, and says it was not tested here", () => {
    const { container } = render(<SecurityPage />);
    const section = container.querySelector("#mod-runtime") as HTMLElement;
    expect(section).not.toBeNull();
    expect(within(section).getByRole("heading", { level: 2, name: "How Claude Code keeps a mod in check" })).toBeInTheDocument();
    expect(within(section).getByRole("note")).toHaveTextContent(RUNTIME_SECTION_NOTE);
    expect(RUNTIME_SECTION_NOTE).toMatch(/This site did not test it/);
    expect(RUNTIME_SECTION_NOTE).toMatch(/on by default in Claude Code v2\.1\.287 and later/);
    const order = Array.from(container.querySelectorAll("section")).map((element) => element.id);
    expect(order.indexOf("mod-runtime")).toBeLessThan(order.indexOf("tier-model"));
  });

  it("lists the five seats outermost first and keeps them apart from the proposed tiers", () => {
    const { container } = render(<SecurityPage />);
    const section = within(container.querySelector("#mod-runtime") as HTMLElement);
    const seats = section.getAllByRole("listitem").map((item) => item.querySelector("code")?.textContent);
    expect(seats).toEqual(["prepend", "user", "append", "builtin", "core"]);
    expect(RUNTIME_SEATS.map((seat) => seat.name)).toEqual(seats);
    expect(section.getByText(new RegExp(RUNTIME_SEAT_NOTE.slice(0, 40)))).toBeInTheDocument();
    expect(RUNTIME_SEAT_NOTE).toMatch(/proposed tiers A, B and C/);
  });

  it("gives a source under every runtime point", () => {
    const { container } = render(<SecurityPage />);
    const section = container.querySelector("#mod-runtime") as HTMLElement;
    for (const point of RUNTIME_POINTS) {
      const row = within(section).getByText(point.term).closest("div") as HTMLElement;
      for (const source of point.sources) {
        expect(within(row).getByRole("link", { name: new RegExp(source.label) })).toHaveAttribute("href", source.href);
      }
    }
  });

  it("says a mod run from a folder is code you chose to run, and does not claim a machine without managed settings has no seat above yours", () => {
    const { container } = render(<SecurityPage />);
    const text = (container.querySelector("#mod-runtime") as HTMLElement).textContent ?? "";
    expect(text).toMatch(/code you chose to run: read it first/);
    expect(text).toMatch(/does not say those are the only cases/);
    expect(text).not.toMatch(/\bno seat above yours\b/);
  });

  it("names the security mod from the catalog, by its repository, and states only what its own README says, with a source link", () => {
    const { container } = render(<SecurityPage />);
    const securityMod = pickSecurityMod(selectAnthropicBuiltInMods(getAllExtensions()));
    expect(securityMod).toBeDefined();
    expect(securityMod?.repositoryUrl.endsWith("/mods/sec-default")).toBe(true);
    const section = within(container.querySelector("#mod-runtime") as HTMLElement);
    expect(section.getByRole("link", { name: securityMod?.name ?? "" }).getAttribute("href")).toMatch(new RegExp(`^/extensions/${securityMod?.slug}/?$`));
    expect(section.getByText(new RegExp(SECURITY_MOD_FACTS.whatItIs.slice(0, 50)))).toBeInTheDocument();
    expect(SECURITY_MOD_FACTS.moves).toMatch(/three moves and nothing else/);
    expect(section.getByRole("link", { name: new RegExp(SECURITY_MOD_FACTS.source.label) })).toHaveAttribute(
      "href",
      SECURITY_MOD_FACTS.source.href,
    );
  });

  it("lists all four tiers and marks each behavior as proposed", () => {
    render(<SecurityPage />);
    for (const tier of ["TIER_A", "TIER_B", "TIER_C", "REVOKED"]) {
      expect(screen.getByText(tier)).toBeInTheDocument();
    }
    expect(screen.getAllByText("Proposed CLI behavior")).toHaveLength(4);
  });

  it("renders the four-step scan pipeline as an ordered timeline", () => {
    render(<SecurityPage />);
    const pipeline = screen.getByRole("list", { name: "Proposed scan pipeline" });
    expect(pipeline.tagName).toBe("OL");
    expect(within(pipeline).getAllByRole("heading", { level: 4 })).toHaveLength(4);
  });

  it("gives practical pre-install guidance under a linkable section", () => {
    const { container } = render(<SecurityPage />);
    const section = container.querySelector("#before-you-install");
    expect(section).not.toBeNull();
    for (const title of ["Read the source", "Check the publisher", "Review permissions and hooks", "Prefer pinned versions"]) {
      expect(within(section as HTMLElement).getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });

  it("carries no early access or function hooks flag copy now that mods are on by default", () => {
    const { container } = render(<SecurityPage />);
    expect(container.textContent).not.toMatch(/CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1|function hooks are|are early access/i);
  });

  it("keeps the generic checks first, then a mod trust subsection with what a mod can reach", () => {
    const { container } = render(<SecurityPage />);
    const section = container.querySelector("#before-you-install") as HTMLElement;
    const headings = within(section).getAllByRole("heading").map((heading) => heading.textContent);
    expect(headings.indexOf("Checks for any extension")).toBeLessThan(headings.indexOf("Before you install a mod"));
    const mod = within(section.querySelector("#before-you-install-a-mod") as HTMLElement);
    expect(mod.getByRole("heading", { level: 3, name: "Before you install a mod" })).toBeInTheDocument();
    for (const item of MOD_REACH) {
      expect(mod.getByText(item.term)).toBeInTheDocument();
    }
    expect(mod.getByText(/Mods are not sandboxed/)).toBeInTheDocument();
    expect(mod.getByText(/not the permission prompt, so it cannot change what a prompt shows you/)).toBeInTheDocument();
    expect(mod.getByRole("link", { name: new RegExp(MODS_OVERVIEW_TRUST.label) })).toHaveAttribute("href", MODS_OVERVIEW_TRUST.href);
  });

  it("shows claude plugin validate with sample hooks and calls lines and the calls to look for", () => {
    const { container } = render(<SecurityPage />);
    const mod = within(container.querySelector("#before-you-install-a-mod") as HTMLElement);
    expect(mod.getByText(VALIDATE_COMMAND)).toBeInTheDocument();
    const sample = mod.getByRole("group", { name: "Sample hooks and calls output" });
    expect(sample.textContent).toMatch(/hooks: session\.start, tool\.call/);
    expect(sample.textContent).toMatch(/calls: \$\.fs\.read, \$\.http\.fetch/);
    const table = mod.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(RISKY_CALLS.length + 1);
    for (const call of ["$.process.run", "$.http.fetch", "$.env.get", "$.model.complete", "$.prompt.submit"]) {
      expect(within(table).getByText(call)).toBeInTheDocument();
    }
    expect(mod.getByRole("link", { name: new RegExp(MODS_ADMIN_REVIEW.label) })).toHaveAttribute("href", MODS_ADMIN_REVIEW.href);
  });

  it("lists the three ways to turn mods off and says the old flag no longer keeps them off", () => {
    const { container } = render(<SecurityPage />);
    const mod = within(container.querySelector("#before-you-install-a-mod") as HTMLElement);
    expect(mod.getByRole("heading", { level: 4, name: "Turn mods off" })).toBeInTheDocument();
    for (const item of MOD_OFF_SWITCHES) {
      expect(mod.getByText(item.scope)).toBeInTheDocument();
    }
    expect(MOD_OFF_SWITCHES.map((item) => item.how).join(" ")).toMatch(/\/plugin[\s\S]*--safe-mode[\s\S]*disableAllHooks/);
    expect(mod.getByText(FLAG_RETIRED_NOTE)).toBeInTheDocument();
    expect(FLAG_RETIRED_NOTE).toMatch(/setting it to 0 does not keep mods off/);
    expect(mod.getByRole("link", { name: new RegExp(MODS_OVERVIEW_TURN_OFF.label) })).toHaveAttribute("href", MODS_OVERVIEW_TURN_OFF.href);
  });

  it("summarizes the organization controls after the runtime and before the proposed tiers, linking out for detail", () => {
    const { container } = render(<SecurityPage />);
    const order = Array.from(container.querySelectorAll("section")).map((element) => element.id);
    expect(order.indexOf("mod-runtime")).toBeLessThan(order.indexOf("for-organizations"));
    expect(order.indexOf("for-organizations")).toBeLessThan(order.indexOf("tier-model"));
    const section = within(container.querySelector("#for-organizations") as HTMLElement);
    expect(section.getByRole("heading", { level: 2, name: "For organizations" })).toBeInTheDocument();
    for (const name of ["Choose a policy", "The built-in guard", "What still takes precedence", "Your organization's own mods"]) {
      expect(section.getByRole("heading", { level: 3, name })).toBeInTheDocument();
    }
    const adminLinks = section.getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith(MODS_ADMIN.href));
    expect(adminLinks.length).toBeGreaterThanOrEqual(4);
  });

  it("renders the policy table, the allowManagedModsOnly example and both guard options", () => {
    const { container } = render(<SecurityPage />);
    const section = within(container.querySelector("#for-organizations") as HTMLElement);
    const policies = section.getByRole("table", { name: "Mod policies and the managed settings for each" });
    expect(within(policies).getAllByRole("row")).toHaveLength(ORG_POLICIES.length + 1);
    for (const policy of ORG_POLICIES) {
      expect(within(policies).getByRole("rowheader", { name: policy.want })).toBeInTheDocument();
    }
    const example = section.getByRole("group", { name: "Contents of managed-settings.json" });
    expect(example.textContent).toBe(ALLOW_MANAGED_MODS_ONLY_JSON);
    const options = section.getByRole("table", { name: "Built-in guard options, unset and set to true" });
    for (const option of GUARD_OPTIONS) {
      expect(within(options).getByText(option.name)).toBeInTheDocument();
    }
  });

  it("says when the guard loads and what still takes precedence, including what deny rules do not cover", () => {
    const { container } = render(<SecurityPage />);
    const section = within(container.querySelector("#for-organizations") as HTMLElement);
    for (const fact of [...GUARD_LOAD_FACTS, ...ORG_PRECEDENCE]) {
      expect(section.getByText(fact.term)).toBeInTheDocument();
    }
    expect(section.getByText(/Team or Enterprise plan/)).toBeInTheDocument();
    expect(section.getByText(/a mod can still read that file with \$\.fs\.read/)).toBeInTheDocument();
    expect(section.getByText(/None of these controls sandboxes a mod/)).toBeInTheDocument();
  });

  it("never uses concept wording or calls the mods runtime unconfirmed", () => {
    const { container } = render(<SecurityPage />);
    expect(container.textContent).not.toMatch(/unconfirmed|could not confirm|concept/i);
  });

  it("exports page metadata with a canonical path", () => {
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/security/`);
    expect(metadata.title).toBe("Security: what is and is not checked");
  });
});
