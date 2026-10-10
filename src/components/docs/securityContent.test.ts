import { describe, expect, it } from "vitest";
import { DASH_PATTERN } from "./testSupport";
import {
  ALLOW_MANAGED_MODS_ONLY_JSON,
  FLAG_RETIRED_NOTE,
  GUARD_CONFIG_ID,
  GUARD_LOAD_FACTS,
  GUARD_OPTIONS,
  GUARD_PREPEND_ID,
  MODS_ADMIN,
  MODS_ADMIN_DEFAULTS,
  MODS_ADMIN_GUARD_OPTIONS,
  MODS_ADMIN_ORG_MODS,
  MODS_ADMIN_POLICIES,
  ORG_MODS_NOTE,
  ORG_ORDER_NOTE,
  ORG_POLICIES,
  ORG_PRECEDENCE,
  MOD_OFF_SWITCHES,
  MOD_REACH,
  MODS_ADMIN_REVIEW,
  MODS_DOCS_SOURCES,
  MODS_OVERVIEW_TRUST,
  MODS_OVERVIEW_TURN_OFF,
  NOT_SANDBOXED_NOTE,
  PERMISSION_PROMPT_NOTE,
  RISKY_CALLS,
  RISKY_HOOKS_NOTE,
  VALIDATE_COMMAND,
  VALIDATE_SAMPLE_OUTPUT,
} from "./securityContent";

describe("mod trust content", () => {
  it("links the human docs pages, not the markdown copies", () => {
    for (const source of [MODS_OVERVIEW_TRUST, MODS_OVERVIEW_TURN_OFF, MODS_ADMIN_REVIEW]) {
      expect(source.href.startsWith("https://code.claude.com/docs/en/plugins/mods/")).toBe(true);
      expect(source.href).not.toMatch(/\.md(#|$)/);
    }
    expect(Object.values(MODS_DOCS_SOURCES).every((href) => !href.endsWith(".md"))).toBe(true);
  });

  it("lists the six things a mod can reach once it loads, each with a unique id", () => {
    expect(MOD_REACH.map((item) => item.term)).toEqual([
      "Act on your machine as you",
      "Read your secrets",
      "See your session",
      "Change your session",
      "Act without asking you",
      "Spend your usage",
    ]);
    expect(new Set(MOD_REACH.map((item) => item.id)).size).toBe(MOD_REACH.length);
  });

  it("says mods are not sandboxed and cannot change the permission prompt", () => {
    expect(NOT_SANDBOXED_NOTE).toMatch(/^Mods are not sandboxed\./);
    expect(NOT_SANDBOXED_NOTE).toMatch(/a process a mod starts runs outside it/);
    expect(PERMISSION_PROMPT_NOTE).toMatch(/but not the permission prompt/);
    // The prompt is safe from restyling, not from being skipped: keep that caveat.
    expect(PERMISSION_PROMPT_NOTE).toMatch(/can still approve a tool call before the prompt appears/);
  });

  it("prints the validate command and sample output exactly as the docs show them", () => {
    expect(VALIDATE_COMMAND).toBe("claude plugin validate ./some-mod");
    const lines = VALIDATE_SAMPLE_OUTPUT.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/hooks: session\.start, tool\.call, ui\.render\{component=Pane\}$/);
    expect(lines[1]).toMatch(/calls: \$\.fs\.read, \$\.http\.fetch, \$\.store\.set, \$\.ui\.open$/);
  });

  it("covers every risky call from the docs table once, spelled as validate prints it", () => {
    const calls = RISKY_CALLS.flatMap((row) => row.calls);
    expect(new Set(calls).size).toBe(calls.length);
    expect([...calls].sort()).toEqual(
      [
        "$.env.get",
        "$.env.set",
        "$.fs.read",
        "$.fs.write",
        "$.http.fetch",
        "$.mcp.call",
        "$.model.complete",
        "$.process.run",
        "$.process.spawn",
        "$.prompt.submit",
        "$.session.send",
        "$.settings.read",
      ].sort(),
    );
    for (const call of calls) {
      expect(call).toMatch(/^\$\.[a-z]+\.[a-zA-Z]+$/);
    }
  });

  it("names the three off switches in widening order and retires the early access variable", () => {
    expect(MOD_OFF_SWITCHES.map((item) => item.id)).toEqual(["one-mod", "one-session", "every-session"]);
    expect(MOD_OFF_SWITCHES[1]?.how).toMatch(/--safe-mode/);
    expect(MOD_OFF_SWITCHES[2]?.how).toMatch(/"disableAllHooks": true/);
    expect(FLAG_RETIRED_NOTE).toMatch(/CLAUDE_CODE_ENABLE_FUNCTION_HOOKS/);
    expect(FLAG_RETIRED_NOTE).toMatch(/v2\.1\.287 and later ignores it/);
  });

  it("contains no em or en dashes in any trust string", () => {
    const strings = [
      NOT_SANDBOXED_NOTE,
      PERMISSION_PROMPT_NOTE,
      RISKY_HOOKS_NOTE,
      FLAG_RETIRED_NOTE,
      ...MOD_REACH.flatMap((item) => [item.term, item.description]),
      ...RISKY_CALLS.map((row) => row.meaning),
      ...MOD_OFF_SWITCHES.flatMap((item) => [item.scope, item.how]),
    ];
    for (const text of strings) {
      expect(text).not.toMatch(DASH_PATTERN);
    }
  });
});

describe("organization content", () => {
  it("keys the guard's options by the only id spelling Claude Code reads", () => {
    expect(GUARD_CONFIG_ID).toBe("cc-plugin-sec-default@builtin");
    expect(GUARD_PREPEND_ID).toBe("sec-default@builtin");
    expect(JSON.parse(ALLOW_MANAGED_MODS_ONLY_JSON)).toEqual({
      pluginConfigs: { "cc-plugin-sec-default@builtin": { options: { allowManagedModsOnly: true } } },
    });
  });

  it("maps each of the five policies to its settings, narrowest first", () => {
    expect(ORG_POLICIES.map((policy) => policy.id)).toEqual([
      "no-installed-mods",
      "no-hooks-at-all",
      "only-org-mods",
      "approved-marketplaces",
      "any-mod-checked",
    ]);
    expect(ORG_POLICIES[1]?.settings).toMatch(/disableAllHooks/);
    expect(ORG_POLICIES[3]?.settings).toMatch(/disableSideloadFlags/);
    expect(ORG_POLICIES[4]?.settings).toMatch(/sec-default@builtin in prependPlugins/);
  });

  it("names both guard options", () => {
    expect(GUARD_OPTIONS.map((option) => option.name)).toEqual(["allowManagedModsOnly", "allowModsToOverrideDenyRules"]);
  });

  it("states when the guard loads, that prependPlugins must name it, and that it fails closed", () => {
    const text = GUARD_LOAD_FACTS.map((fact) => fact.description).join(" ");
    expect(text).toMatch(/managed settings, or for a user signed in with a Team or Enterprise plan/);
    expect(text).toMatch(/name sec-default@builtin in it, or the guard does not load/);
    expect(text).toMatch(/refuses every user's mod at load/);
  });

  it("does not overstate what deny rules and managed hooks cover", () => {
    const text = ORG_PRECEDENCE.map((fact) => fact.description).join(" ");
    expect(text).toMatch(/Where the guard loads/);
    expect(text).toMatch(/Neither covers a mod's own \$\.fs and \$\.process calls/);
    expect(text).toMatch(/runs without a classifier check/);
    expect(ORG_MODS_NOTE).toMatch(/counts as a user's, even when managed settings enable it/);
    expect(ORG_MODS_NOTE).toMatch(/writable only by an administrator/);
    expect(ORG_ORDER_NOTE).toMatch(/fails open unless you add a \.catch handler/);
    expect(ORG_ORDER_NOTE).toMatch(/--safe-mode/);
    expect(GUARD_LOAD_FACTS.find((fact) => fact.id === "protects")?.description).toMatch(/holding deny rules/);
  });

  it("links every organization source to the admin page", () => {
    for (const source of [MODS_ADMIN, MODS_ADMIN_POLICIES, MODS_ADMIN_DEFAULTS, MODS_ADMIN_GUARD_OPTIONS, MODS_ADMIN_ORG_MODS]) {
      expect(source.href.startsWith(MODS_DOCS_SOURCES.admin)).toBe(true);
    }
  });

  it("contains no em or en dashes in any organization string", () => {
    const strings = [
      ORG_MODS_NOTE,
      ORG_ORDER_NOTE,
      ...ORG_POLICIES.flatMap((policy) => [policy.want, policy.settings]),
      ...GUARD_OPTIONS.flatMap((option) => [option.unset, option.enabled]),
      ...[...GUARD_LOAD_FACTS, ...ORG_PRECEDENCE].flatMap((fact) => [fact.term, fact.description]),
    ];
    for (const text of strings) {
      expect(text).not.toMatch(DASH_PATTERN);
    }
  });
});
