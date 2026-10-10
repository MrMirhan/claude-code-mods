// @vitest-environment node
import { describe, expect, it } from "vitest";
import { DASH_PATTERN } from "@/components/docs/testSupport";
import { FAMILY_DOCS, classicHookDocsUrl, eventSummary, nounDocs } from "@/lib/event-docs";
import { nounOf } from "@/lib/event-names";
import { getEvents, getSupplementEvents } from "@/lib/events";
import { EVENT_FAMILIES } from "@/lib/types";

const DOCS_PREFIX = "https://code.claude.com/docs/en/";
const allNames = [...getEvents(), ...getSupplementEvents()];

describe("event docs", () => {
  it("gives every engine event a description, since the reference describes each one", () => {
    const missing = allNames.filter((event) => event.family === "engine" && eventSummary(event.name) === null).map((event) => event.name);
    expect(missing).toEqual([]);
  });

  it("describes only events the Hooks page lists, so a renamed event cannot keep a stale line", () => {
    const listed = new Set(allNames.map((event) => event.name));
    const probe = ["tool.call", "ui.notify", "prompt.autocomplete", "tool.register"];
    for (const name of probe) expect(listed.has(name), name).toBe(true);
    expect(eventSummary("made.up")).toBeNull();
    expect(eventSummary("constructor")).toBeNull();
    expect(eventSummary("__proto__")).toBeNull();
  });

  it("has docs for every noun of the engine and op families", () => {
    const missing = allNames
      .filter((event) => event.family !== "classic")
      .filter((event) => nounDocs(event.family, nounOf(event)) === null)
      .map((event) => `${event.family}:${event.name}`);
    expect(missing).toEqual([]);
    expect(nounDocs("op", "constructor")).toBeNull();
    expect(nounDocs("classic", "classic")).toBeNull();
  });

  it("links only to Anthropic's docs, and writes no em or en dash", () => {
    for (const family of EVENT_FAMILIES) {
      expect(FAMILY_DOCS[family].link.href.startsWith(DOCS_PREFIX), family).toBe(true);
      expect(FAMILY_DOCS[family].summary).not.toMatch(DASH_PATTERN);
    }
    for (const event of allNames) {
      const summary = eventSummary(event.name);
      if (summary !== null) expect(summary, event.name).not.toMatch(DASH_PATTERN);
      if (event.family === "classic") continue;
      const docs = nounDocs(event.family, nounOf(event));
      expect(docs?.link.href.startsWith(DOCS_PREFIX), event.name).toBe(true);
      if (docs?.summary) expect(docs.summary, event.name).not.toMatch(DASH_PATTERN);
    }
  });

  it("links a classic event to its section of the hooks docs, and nothing else", () => {
    expect(classicHookDocsUrl("classic.PreToolUse")).toBe("https://code.claude.com/docs/en/hooks#pretooluse");
    expect(classicHookDocsUrl("classic.ElicitationResult")).toBe("https://code.claude.com/docs/en/hooks#elicitationresult");
    expect(classicHookDocsUrl("tool.call")).toBeNull();
  });
});
