import { describe, expect, it } from "vitest";
import { DASH_PATTERN } from "./testSupport";
import {
  FLAG_RETIRED_NOTE,
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
