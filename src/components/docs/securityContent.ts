import { ANNOUNCEMENT, MODS_README, MODS_TYPES, SEC_DEFAULT_README, type ConceptItem, type LearnSource } from "./learnContent";
import type { TimelineItem } from "./Timeline";

/** Shown at the top of the tier section and asserted in tests; keep the wording plain and literal. */
export const NO_SCANNER_NOTICE =
  "This is a design specification. No security scanner is running today, so no listing on this site has a tier.";

export type SecurityTierId = "TIER_A" | "TIER_B" | "TIER_C" | "REVOKED";

export interface SecurityTier {
  readonly id: SecurityTierId;
  readonly name: string;
  /** What the spec says qualifies a package for this tier. */
  readonly criteria: string;
  /** What the spec proposes the CLI would do. Always a proposal, never current behavior. */
  readonly proposedBehavior: string;
}

/** Source: marketplace architecture report (04), "Security Tier Definition Matrix". */
export const SECURITY_TIERS: readonly SecurityTier[] = [
  {
    id: "TIER_A",
    name: "Verified",
    criteria: "Passed static and dynamic audits, uses no elevated privileges, and comes from a trusted author.",
    proposedBehavior: "Loads and runs without asking.",
  },
  {
    id: "TIER_B",
    name: "Restricted",
    criteria: "Uses the workspace filesystem or a small set of allowed network endpoints.",
    proposedBehavior:
      "Asks the user before granting each declared permission, for example network access to a named host.",
  },
  {
    id: "TIER_C",
    name: "Experimental",
    criteria: "A community package that passes a syntax check but comes from an untrusted origin.",
    proposedBehavior:
      "Needs an explicit trust step from the user. The report names a /mod trust command for this, which is not a confirmed Claude Code command.",
  },
  {
    id: "REVOKED",
    name: "Revoked",
    criteria: "Failed the security criteria, or was reported for a vulnerability.",
    proposedBehavior: "Removed from the listing and blocked by the CLI everywhere at once.",
  },
];

/** Source: marketplace architecture report (04), "Multi-Phase Security Scanning Pipeline". */
export const SCAN_PIPELINE: readonly TimelineItem[] = [
  {
    title: "Check package integrity",
    description: "Confirm the package is the one the author published and that its manifests are well formed.",
    details: [
      "Verify the author's Ed25519 signature against their public key.",
      "Compare the tarball's SHA-256 checksum.",
      "Validate the plugin.json and hooks.json schemas.",
    ],
  },
  {
    title: "Analyze the code statically",
    description: "Read the code without running it, looking for patterns the spec treats as dangerous.",
    details: [
      "Walk the TypeScript or Babel syntax tree.",
      "Flag forbidden imports such as child_process, plus eval(), Function(), obfuscated strings and WebAssembly.",
      "Compare the permissions the package declares with the API calls it actually makes.",
    ],
  },
  {
    title: "Run it in a sandbox",
    description: "Execute the package in an isolated environment and watch what it does.",
    details: [
      "Fire synthetic lifecycle events at it.",
      "Monitor filesystem access and network calls that go outside its declared limits.",
      "Check memory use and CPU time; the report proposes a budget of under 50ms per hook.",
    ],
  },
  {
    title: "Assign a tier",
    description: "Combine the results into one of the tiers above, or reject the package.",
    details: [
      "Clean results and a verified author lead to TIER_A.",
      "Declared permissions that need user confirmation lead to TIER_B.",
      "An unverified author or unconstrained network access leads to TIER_C.",
      "A malicious pattern or a sandbox violation leads to rejection.",
    ],
  },
];

export interface InstallGuidance {
  readonly title: string;
  readonly body: string;
}

export const BEFORE_YOU_INSTALL: readonly InstallGuidance[] = [
  {
    title: "Read the source",
    body: "Open the repository from the entry page and read what the package ships: commands, scripts, hook definitions and any bundled binaries. A short skill or command file takes minutes to read.",
  },
  {
    title: "Check the publisher",
    body: "Confirm the publisher is who you expect and that the repository sits under their account or organization. Look-alike names and forks are a common way to pass off other code.",
  },
  {
    title: "Review permissions and hooks",
    body: "Hooks run commands on their own when lifecycle events fire, and MCP servers run as local processes or talk to remote services. Find out which events a package hooks into and what it can reach before you enable it.",
  },
  {
    title: "Prefer pinned versions",
    body: "Install a specific tag or commit instead of a moving branch or a latest tag, so a later push cannot change what runs on your machine. Try new extensions in a throwaway project first.",
  },
];

/**
 * How Claude Code itself keeps a mod in check, as its declarations, the Mods README and
 * the announcement describe it. This is not the site's proposed tier model above, which is a design for
 * a registry that does not exist: this is what the engine says it does. The site did not test it.
 */

export const RUNTIME_SECTION_NOTE =
  "Mods are on by default in Claude Code v2.1.287 and later in the terminal, and from v2.1.286 in the Desktop app. This section restates what Anthropic's type declarations, the Mods README and the announcement say the engine does. This site did not test it.";

/** Claude Code names these tiers. This page says seats, so they are not mistaken for the proposed tiers A, B, C and revoked. */
export const RUNTIME_SEAT_NOTE =
  "Claude Code calls these tiers in its declarations. This page calls them seats so they are not confused with the proposed tiers A, B and C in the next section, which have nothing to do with them.";

export interface RuntimeSeat {
  readonly id: string;
  /** The seat's name as the declarations spell it. */
  readonly name: string;
  readonly who: string;
}

/** Outermost first: earlier is outer, and outer has more authority. */
export const RUNTIME_SEATS: readonly RuntimeSeat[] = [
  { id: "prepend", name: "prepend", who: "The managed plugins an administrator lists first. The outermost seat." },
  { id: "user", name: "user", who: "Everything a person installs, as the declarations put it: a mod you load yourself sits here." },
  { id: "append", name: "append", who: "The managed plugins an administrator lists after the user seat." },
  { id: "builtin", name: "builtin", who: "The plugins bundled in the Claude Code binary." },
  { id: "core", name: "core", who: "The engine's own innermost link. No plugin loads here." },
];

export const RUNTIME_POINTS: readonly ConceptItem[] = [
  {
    id: "order-is-authority",
    term: "Order is authority",
    description:
      "Hooks on the same event nest in seat order and no other way. Earlier is outer, and outer has more authority. On the events whose result a hook can change, a hook above another can pass the event on, rewrite it, refuse it or answer it; on an event such as session.end a hook only observes, and its own value changes nothing.",
    sources: [MODS_TYPES],
  },
  {
    id: "side-effects-go-through-dollar",
    term: "Side effects go through $",
    description:
      "A mod reaches files, the network and processes through calls on $. Each call is an event the engine makes, so the hooks above the caller see it. An administrator can remove affordances from $, so that every plugin beneath cannot use that side effect.",
    sources: [ANNOUNCEMENT, MODS_README, MODS_TYPES],
  },
  {
    id: "a-failing-hook-is-skipped",
    term: "A failing hook is skipped",
    description:
      "At every engine event, a hook that throws, overruns its time budget or answers a wrong shape is skipped: the hooks beneath and core run in its place, or its last next result stands, and the failure is reported by name. That means a guard that fails is absent for that dispatch, not that the call is refused. Each hook's time budget is its own code alone, and the clock stops while it waits on next(e) or on a call on $.",
    sources: [MODS_TYPES],
  },
  {
    id: "what-it-does-not-tell-you",
    term: "What this does not tell you",
    description:
      "The seats govern what one plugin can do to another and to an organization's settings, and the README describes seating the security mod outermost on a machine with managed settings or for a Team or Enterprise organization. It does not say those are the only cases a plugin can be seated above yours: another user-seat plugin can be too. A mod you run from a folder is code you chose to run: read it first.",
    sources: [MODS_README],
  },
];

export interface SecurityModFacts {
  /** What its README says it is: one sentence, as the catalog's own guide states it. */
  readonly whatItIs: string;
  readonly moves: string;
  /** Where whatItIs and moves come from: the security mod's own README, not the general Mods README. */
  readonly source: LearnSource;
}

/** The three moves the security mod's README says it has, and nothing else. Shown only beside the catalog's security mod. */
export const SECURITY_MOD_FACTS: SecurityModFacts = {
  whatItIs:
    "Its README says that, seated outermost, it keeps an organization's classic hooks, managed CLAUDE.md and rules, settings, MCP allowlist and deny rules out of the reach of the plugins a person installs, and adds no policy of its own.",
  moves:
    "It has three moves and nothing else: continue past the user seat, refuse a user seat caller by name, or pass. Its README seats it first in the prepend seat on a machine with managed settings or for a Team or Enterprise organization, unless managed prependPlugins says otherwise, and says that loading it with --plugin-dir seats a plugin that can only pass.",
  source: SEC_DEFAULT_README,
};

/** Anthropic's mods documentation, the source for the trust and organization sections below. */
export const MODS_DOCS_SOURCES = {
  overview: "https://code.claude.com/docs/en/plugins/mods/overview",
  admin: "https://code.claude.com/docs/en/plugins/mods/admin",
} as const;

export const MODS_OVERVIEW_TRUST: LearnSource = {
  label: "Mods overview: Decide whether to trust a mod",
  href: `${MODS_DOCS_SOURCES.overview}#decide-whether-to-trust-a-mod`,
};
export const MODS_OVERVIEW_TURN_OFF: LearnSource = {
  label: "Mods overview: Turn mods on or off",
  href: `${MODS_DOCS_SOURCES.overview}#turn-mods-on-or-off`,
};
export const MODS_ADMIN_REVIEW: LearnSource = {
  label: "Manage mods: Review what a mod can do",
  href: `${MODS_DOCS_SOURCES.admin}#review-what-a-mod-can-do`,
};

export interface ModReach {
  readonly id: string;
  readonly term: string;
  readonly description: string;
}

/** Source: Mods overview, "What a mod can reach". Once it loads, a mod can do each of these. */
export const MOD_REACH: readonly ModReach[] = [
  {
    id: "act-as-you",
    term: "Act on your machine as you",
    description: "Read and write files anywhere your user account can, start programs and make network requests.",
  },
  {
    id: "read-secrets",
    term: "Read your secrets",
    description: "Environment variables and settings files, including an API key you keep in either.",
  },
  { id: "see-session", term: "See your session", description: "Every prompt you send and every tool call Claude makes." },
  {
    id: "change-session",
    term: "Change your session",
    description:
      "Rewrite a prompt or a tool call, submit a prompt as if you had typed it, or send a message to another of your sessions.",
  },
  { id: "act-without-asking", term: "Act without asking you", description: "Approve a tool call before you are asked." },
  { id: "spend-usage", term: "Spend your usage", description: "Call a model on your plan or API key." },
];

/** Source: Mods overview, "What a mod can reach". */
export const NOT_SANDBOXED_NOTE =
  "Mods are not sandboxed. If you turn on sandboxing, it isolates the Bash commands Claude runs, and a process a mod starts runs outside it.";

/** Source: Mods overview, "What a mod can reach". */
export const PERMISSION_PROMPT_NOTE =
  "A mod can restyle much of Claude Code's interface, but not the permission prompt, so it cannot change what a prompt shows you. It can still approve a tool call before the prompt appears, including one an ask rule would prompt for or one of your own PreToolUse hooks blocked.";

export const VALIDATE_COMMAND = "claude plugin validate ./some-mod";

/** The sample `hooks:` and `calls:` lines from "Review what a mod can do", as Anthropic's docs print them. */
export const VALIDATE_SAMPLE_OUTPUT = [
  "  ❯ ./register.js hooks: session.start, tool.call, ui.render{component=Pane}",
  "  ❯ ./register.js calls: $.fs.read, $.http.fetch, $.store.set, $.ui.open",
].join("\n");

export interface RiskyCall {
  /** The calls as `claude plugin validate` prints them. */
  readonly calls: readonly string[];
  readonly meaning: string;
}

/** Source: Manage mods, "Review what a mod can do". The calls to look for on the `calls:` line, shortened. */
export const RISKY_CALLS: readonly RiskyCall[] = [
  { calls: ["$.fs.read", "$.fs.write"], meaning: "Reads or writes files anywhere you can." },
  { calls: ["$.process.run", "$.process.spawn"], meaning: "Starts programs as you." },
  { calls: ["$.http.fetch"], meaning: "Makes network requests." },
  {
    calls: ["$.env.get", "$.settings.read"],
    meaning: "Reads environment variables and settings, which can hold API keys. An env reads: line names each variable.",
  },
  {
    calls: ["$.env.set"],
    meaning: "Sets a variable for Claude Code and every command and MCP server it starts afterward. An env writes: line names each one.",
  },
  { calls: ["$.mcp.call"], meaning: "Calls a tool on a connected MCP server, under the session's permission rules." },
  { calls: ["$.model.complete"], meaning: "Uses your plan or API key for model calls." },
  { calls: ["$.prompt.submit"], meaning: "Submits a prompt, and can send it as your own words." },
  { calls: ["$.session.send"], meaning: "Sends a message that another session, subagent or teammate reads." },
];

/** Source: Manage mods, "Review what a mod can do". What the riskier entries on the `hooks:` line mean. */
export const RISKY_HOOKS_NOTE =
  "On the hooks: line, tool.call and prompt.submit mean the mod sees every tool call and every prompt and can change them, and tool.check means it can approve or deny a tool call before a permission prompt appears.";

export interface OffSwitch {
  readonly id: string;
  readonly scope: string;
  readonly how: string;
}

/** Source: Mods overview, "Turn mods on or off". Undo the same change to turn mods back on. */
export const MOD_OFF_SWITCHES: readonly OffSwitch[] = [
  { id: "one-mod", scope: "One mod", how: "Disable or uninstall its plugin from the Installed tab in /plugin." },
  {
    id: "one-session",
    scope: "Every installed mod, for one session",
    how: "Start Claude Code with --safe-mode, which also disables your other customizations.",
  },
  {
    id: "every-session",
    scope: "Every mod you installed, in every session",
    how: 'Set "disableAllHooks": true in ~/.claude/settings.json. Your settings hooks and custom status line stop too, and what your organization manages keeps running.',
  },
];

/** Source: Mods overview, "Turn mods on or off". The early access variable no longer does anything. */
export const FLAG_RETIRED_NOTE =
  "If you set CLAUDE_CODE_ENABLE_FUNCTION_HOOKS while mods were in early access, remove it. Claude Code v2.1.287 and later ignores it, so setting it to 0 does not keep mods off.";
