import { describe, expect, it } from "vitest";
import { DASH_PATTERN } from "@/components/docs/testSupport";
import { STARTER_MOD_FILES } from "@/lib/starter-mod";
import { ALLOWED_CATALOG_HOSTS } from "@/lib/url";
import {
  ASK_CLAUDE_KEEP,
  ASK_CLAUDE_SKIPPED,
  ASK_CLAUDE_STEPS,
  CONCEPTS,
  HOOKS_ENVIRONMENT_LIMITS,
  KIND_COMPARISON,
  KIND_COMPARISON_COLUMNS,
  LEARN_FAQ,
  LEARN_SOURCES,
  MOD_FOLDER_TREE,
  MODS_MIN_VERSION,
  OFFICIAL_MOD_DOCS,
  type OfficialDocId,
  officialModDoc,
  RETIRED_FLAG_NAME,
  RUN_WARNING,
  STARTER_LIMITS,
  TESTED_WITH,
  TEST_KIT_NOTES,
} from "./learnContent";

describe("LEARN_SOURCES", () => {
  it("are https links on hosts the catalog already trusts, with no query or fragment", () => {
    for (const [name, href] of Object.entries(LEARN_SOURCES)) {
      const url = new URL(href);
      expect(url.protocol, name).toBe("https:");
      expect(ALLOWED_CATALOG_HOSTS as readonly string[], name).toContain(url.hostname);
      expect(url.search + url.hash, name).toBe("");
    }
  });
});

/** A dotted version as one number, so two versions compare with a plain comparison. */
function versionNumber(version: string): number {
  const [major = 0, minor = 0, patch = 0] = version.split(".").map(Number);
  return major * 1_000_000 + minor * 1_000 + patch;
}

describe("the versions, the retired flag and the tested version", () => {
  it("gives the terminal and Desktop versions the overview docs name, apart", () => {
    expect(MODS_MIN_VERSION).toEqual({ terminal: "2.1.287", desktop: "2.1.286" });
  });

  it("names the retired variable only by name, never as a setting to use", () => {
    expect(RETIRED_FLAG_NAME).toBe("CLAUDE_CODE_ENABLE_FUNCTION_HOOKS");
    expect(RETIRED_FLAG_NAME).not.toContain("=");
  });

  it("was tested on a version where mods are on by default", () => {
    expect(versionNumber(TESTED_WITH.claudeCodeVersion)).toBeGreaterThanOrEqual(versionNumber(MODS_MIN_VERSION.terminal));
  });

  it("names a Claude Code version and a date", () => {
    expect(TESTED_WITH.claudeCodeVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(TESTED_WITH.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("KIND_COMPARISON", () => {
  it("has a row for a mod first, then the kinds it is compared with, with unique ids", () => {
    expect(KIND_COMPARISON.map((row) => row.id)).toEqual(["mod", "plugin", "classic-hook", "mcp-server", "skill"]);
  });

  it("fills every column of every row, and links each row to its source", () => {
    expect(KIND_COMPARISON_COLUMNS).toHaveLength(5);
    for (const row of KIND_COMPARISON) {
      for (const text of [row.name, row.whatItIs, row.howYouWriteIt, row.whatItCanDo, row.source.label]) {
        expect(text.trim(), row.id).not.toBe("");
      }
      expect(Object.values(LEARN_SOURCES), row.id).toContain(row.source.href);
    }
  });

  it("says a mod's events and methods can change, says it of no other row, and never says early access", () => {
    const [mod, ...others] = KIND_COMPARISON;
    expect(mod.whatItCanDo).toContain("can change between releases");
    for (const row of others) expect(row.whatItCanDo, row.id).not.toContain("can change between releases");
    for (const row of KIND_COMPARISON) expect(row.whatItCanDo, row.id).not.toMatch(/early access/i);
  });

  it("says custom commands were merged into skills instead of listing them apart", () => {
    const skill = KIND_COMPARISON.find((row) => row.id === "skill");
    expect(skill?.whatItCanDo).toContain("merged into skills");
    expect(KIND_COMPARISON.some((row) => row.id === "slash-command")).toBe(false);
  });
});

describe("the prose lists", () => {
  it("have unique ids and no empty text", () => {
    expect(new Set(CONCEPTS.map((concept) => concept.id)).size).toBe(CONCEPTS.length);
    for (const concept of CONCEPTS) {
      expect(concept.term.trim(), concept.id).not.toBe("");
      expect(concept.description.trim(), concept.id).not.toBe("");
    }
    for (const text of [...HOOKS_ENVIRONMENT_LIMITS, ...TEST_KIT_NOTES]) expect(text.trim()).not.toBe("");
  });

  it("never use an em or en dash, which the copy rules forbid", () => {
    const everything = [
      ...KIND_COMPARISON.flatMap((row) => [row.name, row.whatItIs, row.howYouWriteIt, row.whatItCanDo]),
      ...CONCEPTS.flatMap((concept) => [concept.term, concept.description]),
      ...HOOKS_ENVIRONMENT_LIMITS,
      ...TEST_KIT_NOTES,
      ...RUN_WARNING,
      ...ASK_CLAUDE_STEPS.flatMap((step) => [step.title, step.description, ...(step.details ?? [])]),
      ...ASK_CLAUDE_SKIPPED,
      ASK_CLAUDE_KEEP,
      STARTER_LIMITS,
      MOD_FOLDER_TREE,
    ];
    for (const text of everything) expect(text).not.toMatch(DASH_PATTERN);
  });

  it("describe the fixed environment: no DOM, no Node, and that $ still gives a mod real reach", () => {
    expect(HOOKS_ENVIRONMENT_LIMITS[0]).toMatch(/no DOM and no Node/);
    expect(HOOKS_ENVIRONMENT_LIMITS.join(" ")).toMatch(/act through \$.*files, the network and processes/);
  });

  it("tell the reader that testing or loading a mod runs its code, and that validate does not load it", () => {
    expect(RUN_WARNING.join(" ")).toMatch(/runs its code with your permissions/);
    expect(RUN_WARNING.join(" ")).toMatch(/validate reads its source/);
    expect(RUN_WARNING.join(" ")).toMatch(/only folders you trust/);
  });

  it("say the starter is not a security boundary, and name what it misses", () => {
    expect(STARTER_LIMITS).toContain("not a security boundary");
    for (const missed of ["sudo", "bash -c", "--force-with-lease", "--delete", "--mirror"]) expect(STARTER_LIMITS).toContain(missed);
  });
});

describe("OFFICIAL_MOD_DOCS", () => {
  it("lists the ten mods pages, overview first and reference last, with unique ids", () => {
    expect(OFFICIAL_MOD_DOCS.map((page) => page.id)).toEqual([
      "overview",
      "create",
      "interface",
      "gallery",
      "events",
      "api",
      "test",
      "troubleshoot",
      "admin",
      "reference",
    ]);
  });

  it("links each one under the official mods docs path, over https, with no query, fragment or .md copy", () => {
    for (const page of OFFICIAL_MOD_DOCS) {
      const url = new URL(page.href);
      expect(url.protocol, page.id).toBe("https:");
      expect(url.hostname, page.id).toBe("code.claude.com");
      expect(url.pathname, page.id).toBe(`/docs/en/plugins/mods/${page.id}`);
      expect(url.search + url.hash, page.id).toBe("");
      expect(ALLOWED_CATALOG_HOSTS as readonly string[], page.id).toContain(url.hostname);
    }
  });

  it("gives every page a title and a summary without dashes", () => {
    for (const page of OFFICIAL_MOD_DOCS) {
      expect(page.title.trim(), page.id).not.toBe("");
      expect(page.covers.trim(), page.id).not.toBe("");
      expect(page.covers, page.id).not.toMatch(DASH_PATTERN);
      expect(page.title, page.id).not.toMatch(DASH_PATTERN);
    }
  });

  it("finds a page by id, and throws for an id it does not know", () => {
    expect(officialModDoc("troubleshoot").title).toBe("Troubleshoot a mod");
    expect(() => officialModDoc("missing" as OfficialDocId)).toThrow(/missing/);
  });
});

describe("asking Claude for a mod", () => {
  it("has the four steps of the Create a mod docs, in order, with unique titles", () => {
    expect(ASK_CLAUDE_STEPS.map((step) => step.title)).toEqual([
      "Describe the mod",
      "Approve the mod",
      "Check that it loaded",
      "Try it, and ask for changes",
    ]);
  });

  it("names where Claude writes the mod, both answers to the reload prompt, and the Installed tab", () => {
    const text = ASK_CLAUDE_STEPS.flatMap((step) => [step.description, ...(step.details ?? [])]).join(" ");
    expect(text).toContain("~/.claude/dev-mods/");
    expect(text).toContain("Enable for this session");
    expect(text).toContain("Not now");
    expect(text).toContain("Installed tab");
  });

  it("says when such a mod does not load, and that it is deleted with its session", () => {
    expect(ASK_CLAUDE_SKIPPED.join(" ")).toMatch(/claude -p.*dontAsk/);
    expect(ASK_CLAUDE_SKIPPED.join(" ")).toMatch(/--safe-mode or --bare.*disableAllHooks/);
    expect(ASK_CLAUDE_KEEP).toContain("cleanupPeriodDays");
  });
});

describe("MOD_FOLDER_TREE", () => {
  it("lists every file of the starter mod, and only those", () => {
    for (const file of STARTER_MOD_FILES) expect(MOD_FOLDER_TREE).toContain(file);
    const fileLines = MOD_FOLDER_TREE.split("\n").filter((line) => line.startsWith("  "));
    expect(fileLines).toHaveLength(STARTER_MOD_FILES.length);
  });
});

describe("LEARN_FAQ", () => {
  it("has unique ids and no empty question or answer", () => {
    expect(new Set(LEARN_FAQ.map((entry) => entry.id)).size).toBe(LEARN_FAQ.length);
    for (const entry of LEARN_FAQ) {
      expect(entry.question.trim(), entry.id).not.toBe("");
      expect(entry.answer.trim(), entry.id).not.toBe("");
      expect(entry.question, entry.id).toMatch(/\?$/);
    }
  });

  it("never uses an em or en dash, which the copy rules forbid", () => {
    for (const entry of LEARN_FAQ) {
      expect(entry.question, entry.id).not.toMatch(DASH_PATTERN);
      expect(entry.answer, entry.id).not.toMatch(DASH_PATTERN);
    }
  });

  it("restates the Callout's own version facts, and no longer says early access or names an enable flag", () => {
    const allAnswers = LEARN_FAQ.map((entry) => entry.answer).join(" ");
    expect(allAnswers).toContain(`v${MODS_MIN_VERSION.terminal} or later in the terminal`);
    expect(allAnswers).toContain(`from v${MODS_MIN_VERSION.desktop} in the Code tab of the Desktop app`);
    expect(allAnswers).toMatch(/can change between releases/);
    expect(allAnswers).not.toMatch(/early access|without notice|function hooks are enabled/i);
  });

  it("keeps the mod vs plugin answer's phrasing in sync with the comparison table's own plugin row, not just approximately similar", () => {
    const plugin = KIND_COMPARISON.find((row) => row.id === "plugin");
    const entry = LEARN_FAQ.find((candidate) => candidate.id === "faq-mod-vs-plugin");
    expect(entry?.answer).toContain("skills, agents, hooks or MCP servers");
    expect(plugin?.howYouWriteIt).toContain("skills, agents, hooks or MCP servers");
  });

  it("keeps the mod vs classic hook answer's phrasing in sync with the comparison table's own classic hook row", () => {
    const classicHook = KIND_COMPARISON.find((row) => row.id === "classic-hook");
    const entry = LEARN_FAQ.find((candidate) => candidate.id === "faq-mod-vs-classic-hook");
    expect(entry?.answer).toContain("shell command, HTTP endpoint, MCP tool call, prompt or subagent");
    expect(classicHook?.howYouWriteIt).toContain("shell command, HTTP endpoint, MCP tool call, prompt or subagent");
  });
});

describe("CONCEPTS sources", () => {
  it("names at least one source for every idea, each one a link this page set already trusts", () => {
    const known = Object.values(LEARN_SOURCES) as string[];
    for (const concept of CONCEPTS) {
      expect(concept.sources.length, concept.id).toBeGreaterThan(0);
      for (const source of concept.sources) {
        expect(source.label.trim(), concept.id).not.toBe("");
        expect(known, concept.id).toContain(source.href);
      }
      expect(new Set(concept.sources.map((source) => source.href)).size, concept.id).toBe(concept.sources.length);
    }
  });

  it("keeps the sec-default seating qualifiers the Mods README gives", () => {
    const administrators = CONCEPTS.find((concept) => concept.id === "administrators");
    expect(administrators?.description).toContain("or for a Team or Enterprise organization, unless managed prependPlugins says otherwise");
  });
});
