/**
 * Long-form copy for the Learn pages, as typed data (see securityContent.ts). Every claim here comes
 * from one of the sources in `LEARN_SOURCES`, or from a command run on `TESTED_WITH`. Nothing is
 * copied from Anthropic's type declarations: they are published under "All rights reserved" terms.
 */

import type { TimelineItem } from "@/components/docs/Timeline";

/** Where the copy comes from, so a reader can check it. */
export const LEARN_SOURCES = {
  announcementIssue: "https://github.com/anthropics/claude-code/issues/91870",
  modsReadme: "https://github.com/anthropics/claude-code/blob/main/mods/README.md",
  modsFolder: "https://github.com/anthropics/claude-code/tree/main/mods",
  modsTypes: "https://github.com/anthropics/claude-code/tree/main/mods/types",
  secDefaultReadme: "https://github.com/anthropics/claude-code/blob/main/mods/sec-default/README.md",
  hooksDocs: "https://code.claude.com/docs/en/hooks",
  pluginsDocs: "https://code.claude.com/docs/en/plugins",
  skillsDocs: "https://code.claude.com/docs/en/skills",
  mcpDocs: "https://code.claude.com/docs/en/mcp",
  modsOverviewDocs: "https://code.claude.com/docs/en/plugins/mods/overview",
  modsCreateDocs: "https://code.claude.com/docs/en/plugins/mods/create",
} as const;

/**
 * The first Claude Code versions where mods are on by default, from "Turn mods on or off" in the mods
 * overview docs. The Desktop app ships its own copy of Claude Code, so its version is given apart.
 */
export const MODS_MIN_VERSION = { terminal: "2.1.287", desktop: "2.1.286" } as const;

/** The variable early access used. The overview docs say v2.1.287 and later ignore it, so the site only tells readers to remove it. */
export const RETIRED_FLAG_NAME = "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS";

/** What the commands on the Getting started page were run against, so a reader knows how old they are. */
export const TESTED_WITH = { claudeCodeVersion: "2.1.296", date: "2026-10-10" } as const;

export interface LearnSource {
  readonly label: string;
  readonly href: string;
}

export interface KindComparison {
  readonly id: string;
  readonly name: string;
  readonly whatItIs: string;
  readonly whatItCanChange: string;
  readonly drawsInTheInterface: string;
  readonly whatYouWrite: string;
  readonly pickItWhen: string;
  /** Every source the row rests on: the overview's comparison first, then the kind's own docs. */
  readonly sources: readonly LearnSource[];
}

export const KIND_COMPARISON_COLUMNS = [
  "Kind",
  "What it is",
  "What it can change",
  "Draws in the interface",
  "What you write",
  "Pick it when",
  "Sources",
] as const;

const MODS_OVERVIEW: LearnSource = { label: "Mods overview", href: LEARN_SOURCES.modsOverviewDocs };

/**
 * Ordered from the point of this site outward. The mod, classic hook, skill and MCP server rows are
 * written from the comparison table in the mods overview docs, which calls a classic hook a settings
 * hook; the plugin row is written from the plugins docs.
 */
export const KIND_COMPARISON: readonly KindComparison[] = [
  {
    id: "mod",
    name: "Mod",
    whatItIs: "A plugin whose functions Claude Code calls inside its own process.",
    whatItCanChange:
      "Tool calls, prompts, commands, turns, and what the interface draws. Its events and methods can change between releases.",
    drawsInTheInterface: "Yes",
    whatYouWrite: "JavaScript or TypeScript.",
    pickItWhen: "You want a pane, a band above the prompt, a custom command, or to rewrite an event.",
    sources: [MODS_OVERVIEW],
  },
  {
    id: "plugin",
    name: "Plugin",
    whatItIs: "A self-contained directory that packages other extensions so they can be shared.",
    whatItCanChange: "What the pieces it holds can change. A mod is a plugin, and can ship beside a skill and an MCP server.",
    drawsInTheInterface: "Only through a mod it holds",
    whatYouWrite: "A .claude-plugin/plugin.json manifest beside skills, agents, hooks or MCP servers.",
    pickItWhen: "You want a team to install and version several pieces together.",
    sources: [MODS_OVERVIEW, { label: "Plugins docs", href: LEARN_SOURCES.pluginsDocs }],
  },
  {
    id: "classic-hook",
    name: "Classic hook",
    whatItIs: "A handler that Claude Code runs at a lifecycle event such as PreToolUse. The docs call it a settings hook.",
    whatItCanChange:
      "Whether a tool call or prompt goes ahead, a tool call's arguments and result, and context added for Claude.",
    drawsInTheInterface: "No",
    whatYouWrite: "A shell command, HTTP endpoint, MCP tool call, prompt or subagent, set up in a settings file.",
    pickItWhen: "You want to block, allow or log an event with a script you already have.",
    sources: [MODS_OVERVIEW, { label: "Hooks docs", href: LEARN_SOURCES.hooksDocs }],
  },
  {
    id: "mcp-server",
    name: "MCP server",
    whatItIs: "An external process or service that gives Claude tools over the Model Context Protocol.",
    whatItCanChange: "Which tools Claude has.",
    drawsInTheInterface: "No",
    whatYouWrite: "A server in any language that speaks MCP, added with claude mcp add.",
    pickItWhen: "Claude needs to reach an external system, such as an issue tracker, a database or an API.",
    sources: [MODS_OVERVIEW, { label: "MCP docs", href: LEARN_SOURCES.mcpDocs }],
  },
  {
    id: "skill",
    name: "Skill or slash command",
    whatItIs:
      "Instructions that Claude reads when they are relevant, or that you run as /skill-name. Custom commands in .claude/commands have been merged into skills.",
    whatItCanChange: "What Claude knows and does.",
    drawsInTheInterface: "No",
    whatYouWrite: "Markdown: a SKILL.md file, in a folder that can hold supporting files.",
    pickItWhen: "You keep pasting the same instructions into chat.",
    sources: [MODS_OVERVIEW, { label: "Skills docs", href: LEARN_SOURCES.skillsDocs }],
  },
];

export interface RunPlace {
  readonly id: string;
  readonly where: string;
  readonly hooksRun: string;
  readonly drawingShows: string;
}

export const WHERE_MODS_RUN_COLUMNS = ["Where you run Claude Code", "Its hooks run", "What it draws shows"] as const;

/** Each place Claude Code runs, from "Where mods run" in the mods overview docs. */
export const WHERE_MODS_RUN: readonly RunPlace[] = [
  {
    id: "terminal",
    where: "claude in a terminal, an editor's integrated terminal, or the JetBrains plugin",
    hooksRun: "Yes",
    drawingShows: "Yes",
  },
  {
    id: "desktop",
    where: "The Code tab of the Desktop app, outside a WSL session",
    hooksRun: "Yes",
    drawingShows: "Yes, apart from the elements the mods reference marks as terminal only",
  },
  {
    id: "desktop-wsl",
    where: "A WSL session in the Desktop app",
    hooksRun: "No, because plugins are not available in WSL sessions",
    drawingShows: "No",
  },
  { id: "vscode", where: "The chat panel of the VS Code extension", hooksRun: "Yes", drawingShows: "No" },
  { id: "headless", where: "claude -p and the Agent SDK", hooksRun: "Yes", drawingShows: "No" },
  {
    id: "remote-control",
    where: "Remote Control from claude.ai or the mobile app",
    hooksRun: "Yes, in the session on your machine",
    drawingShows: "In the terminal on your machine",
  },
  {
    id: "cloud",
    where: "A cloud session",
    hooksRun: "Yes, for a plugin that reaches the cloud session",
    drawingShows: "No",
  },
];

export interface BuiltInMod {
  /** The name `/plugin` shows. */
  readonly name: string;
  readonly whatItDoes: string;
  /** The mod's folder under mods/ in Anthropic's repository, or null when its source is not public. */
  readonly sourceFolder: string | null;
}

export const BUILT_IN_MOD_COLUMNS = ["Name in /plugin", "What it does", "Public source"] as const;

/** Where a built-in mod's public source lives, or null when Anthropic has not published it. */
export function builtInModSourceHref(mod: BuiltInMod): string | null {
  return mod.sourceFolder === null ? null : `${LEARN_SOURCES.modsFolder}/${mod.sourceFolder}`;
}

/** The mods built into Claude Code, from "Mods built into Claude Code" in the mods overview docs. */
export const BUILT_IN_MODS: readonly BuiltInMod[] = [
  {
    name: "cc-plugin-agents-md",
    whatItDoes: "Loads AGENTS.md as project instructions.",
    sourceFolder: "agents-md",
  },
  {
    name: "cc-plugin-diff",
    whatItDoes: "Takes over /diff and draws its pane, in interactive terminal sessions.",
    sourceFolder: "diff",
  },
  {
    name: "cc-plugin-plugin-authoring",
    whatItDoes: "Gives Claude the plugin-authoring skill for writing mods. It holds a skill and no mod code.",
    sourceFolder: null,
  },
  {
    name: "cc-plugin-sec-default",
    whatItDoes:
      "Guards what your organization manages from the mods a user installs. You cannot turn it off; an administrator sets the order in managed settings.",
    sourceFolder: "sec-default",
  },
  {
    name: "cc-plugin-telemetry",
    whatItDoes: "Sends the analytics records that Claude Code and its built-in mods log.",
    sourceFolder: "telemetry",
  },
  {
    name: "cc-plugin-you-should-know",
    whatItDoes:
      "Runs a side agent that watches longer tasks and shows a note above the prompt when it finds something you might miss. Disabled by default.",
    sourceFolder: null,
  },
];

export interface ConceptItem {
  readonly id: string;
  readonly term: string;
  readonly description: string;
  /** Where the description comes from. Every idea names at least one, so none is unsourced. */
  readonly sources: readonly LearnSource[];
}

/** Named sources, shared by the Learn, Migration and Security copy so each label and link is written once. */
export const ANNOUNCEMENT: LearnSource = { label: "Announcement issue", href: LEARN_SOURCES.announcementIssue };
export const MODS_README: LearnSource = { label: "Mods README", href: LEARN_SOURCES.modsReadme };
export const MODS_TYPES: LearnSource = { label: "Mods type declarations", href: LEARN_SOURCES.modsTypes };
export const HOOKS_DOCS: LearnSource = { label: "Hooks docs", href: LEARN_SOURCES.hooksDocs };
export const SEC_DEFAULT_README: LearnSource = { label: "Security mod README", href: LEARN_SOURCES.secDefaultReadme };

/** The five ideas a reader needs before the API makes sense, each with the source it is written from. */
export const CONCEPTS: readonly ConceptItem[] = [
  {
    id: "function-hook",
    term: "A hook is a function",
    description:
      "A classic hook is a handler, usually a shell command, that receives JSON about an event. A function hook is a TypeScript function that the engine calls with the event, so it has types and can return a value.",
    sources: [MODS_README, ANNOUNCEMENT],
  },
  {
    id: "the-dollar-object",
    term: "The $ object",
    description:
      "$ is the engine's own object, and the announcement says a mod's side effects are tracked over it. Each call on $ is one the engine makes, so a hook above the caller can pass it on, rewrite it, refuse it or answer it.",
    sources: [ANNOUNCEMENT, MODS_README, MODS_TYPES],
  },
  {
    id: "next",
    term: "next continues the chain",
    description:
      "Hooks nest in registration order, first outermost, like Express or Koa middleware. A hook calls next(e) to run the ones beneath it, returns { deny } to refuse, or returns a value to answer on its own.",
    sources: [ANNOUNCEMENT, MODS_TYPES],
  },
  {
    id: "administrators",
    term: "Administrators sit outermost",
    description:
      "An administrator can remove affordances from $ so that every plugin beneath cannot use that side effect. The sec-default mod is seated outermost on a machine with managed settings or for a Team or Enterprise organization, unless managed prependPlugins says otherwise.",
    sources: [ANNOUNCEMENT, MODS_README],
  },
  {
    id: "react",
    term: "Plugins can draw",
    description:
      "The announcement says Claude Code uses React across the board, and a hook can wrap or change what a component returns. The elements a render hook draws with come from $.ui.resolve(e), not from globals.",
    sources: [ANNOUNCEMENT, MODS_TYPES],
  },
];

export interface FaqEntry {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

/**
 * Every answer here restates a fact this page states, and sources, in the section above it. Nothing
 * new is claimed. Every id is prefixed `faq-` so a row's anchor can never collide with a DocSection id
 * on the same page (`what-is-a-mod` names both a section and, without the prefix, would have named a
 * question too).
 */
export const LEARN_FAQ: readonly FaqEntry[] = [
  {
    id: "faq-what-is-a-mod",
    question: "What is a Claude Mod?",
    answer:
      "A Claude Mod is a Claude Code plugin whose behaviour lives in a hooks module: one register entry that hooks the engine's events with JavaScript or TypeScript functions shaped ($, e, next). Claude Code ships six built-in mods, and Anthropic publishes the source of four of them.",
  },
  {
    id: "faq-are-mods-ready",
    question: "Are Claude Mods ready to use?",
    answer:
      `Yes. Mods are on by default in Claude Code v${MODS_MIN_VERSION.terminal} or later in the terminal, and from v${MODS_MIN_VERSION.desktop} in the Code tab of the Desktop app. They are new, and Anthropic's docs say their events and methods can change between releases.`,
  },
  {
    id: "faq-mod-vs-plugin",
    question: "How is a mod different from a plugin?",
    answer:
      "A plugin is a self-contained directory that packages skills, agents, hooks or MCP servers so they can be shared. A mod is a plugin whose behaviour specifically lives in a hooks module of function hooks: every mod is a plugin, but not every plugin is a mod.",
  },
  {
    id: "faq-mod-vs-classic-hook",
    question: "How is a mod different from a classic hook?",
    answer:
      "A classic hook is a handler, usually a shell command, HTTP endpoint, MCP tool call, prompt or subagent, that Claude Code runs at a lifecycle event such as PreToolUse and that can block some of them by exit code. A mod's function hook is a TypeScript function the engine calls directly with the event, so it has types and can return a value instead of just an exit code.",
  },
  {
    id: "faq-what-can-a-mod-hook",
    question: "What events can a mod hook?",
    answer:
      "Function hooks name every engine event, every call the engine makes on $, and every classic hook, bridged in as classic.<Name>. The Hooks page shows which mods and plugins use which events.",
  },
  {
    id: "faq-build-first-mod",
    question: "How do I build my first mod?",
    answer: "Build a small mod in the Getting started guide, move a hook you already have, or watch the official video tutorials.",
  },
];

export type OfficialDocId =
  | "overview"
  | "create"
  | "interface"
  | "gallery"
  | "events"
  | "api"
  | "test"
  | "troubleshoot"
  | "admin"
  | "reference";

export interface OfficialDocPage {
  readonly id: OfficialDocId;
  /** The page's own title in the official docs. */
  readonly title: string;
  readonly href: string;
  /** What the page covers, in this site's words, from the page's own summary line. */
  readonly covers: string;
}

const MODS_DOCS_BASE = "https://code.claude.com/docs/en/plugins/mods";

/** Anthropic's mods docs, in the reading order their overview's next steps suggest. */
export const OFFICIAL_MOD_DOCS: readonly OfficialDocPage[] = [
  {
    id: "overview",
    title: "Mods overview",
    href: LEARN_SOURCES.modsOverviewDocs,
    covers: "What a mod can do, how to get one, how to turn mods off, and where they run.",
  },
  {
    id: "create",
    title: "Create a mod",
    href: LEARN_SOURCES.modsCreateDocs,
    covers: "Ask Claude to write a mod, or write one yourself, then reload and validate it.",
  },
  {
    id: "interface",
    title: "Draw in the interface with a mod",
    href: `${MODS_DOCS_BASE}/interface`,
    covers: "Panes, the band above the prompt, buttons, text fields, and state that lasts between redraws.",
  },
  {
    id: "gallery",
    title: "Interface gallery for mods",
    href: `${MODS_DOCS_BASE}/gallery`,
    covers: "Every element a mod can draw, with sample code and screenshots.",
  },
  {
    id: "events",
    title: "React to events with a mod",
    href: `${MODS_DOCS_BASE}/events`,
    covers: "Observe, rewrite or answer tool calls, prompts and turns, and plan for other mods.",
  },
  {
    id: "api",
    title: "Use the mods API",
    href: `${MODS_DOCS_BASE}/api`,
    covers: "Commands, tools, model calls, timers, messages to other sessions, files and the network.",
  },
  {
    id: "test",
    title: "Test a mod",
    href: `${MODS_DOCS_BASE}/test`,
    covers: "Automated tests that fire events and press buttons, with no session, sign in or network.",
  },
  {
    id: "troubleshoot",
    title: "Troubleshoot a mod",
    href: `${MODS_DOCS_BASE}/troubleshoot`,
    covers: "Why a mod does nothing, what each refusal message means, and the debug log.",
  },
  {
    id: "admin",
    title: "Manage mods for your organization",
    href: `${MODS_DOCS_BASE}/admin`,
    covers: "Managed settings that stop or allow mods, how to review one, and policy mods.",
  },
  {
    id: "reference",
    title: "Mods reference",
    href: `${MODS_DOCS_BASE}/reference`,
    covers: "The full list of events, methods, render sites, elements, limits and settings.",
  },
];

/** One official docs page by id, so a page links it without repeating its title or URL. */
export function officialModDoc(id: OfficialDocId): OfficialDocPage {
  const page = OFFICIAL_MOD_DOCS.find((candidate) => candidate.id === id);
  if (page === undefined) throw new Error(`No official mods docs page with id ${JSON.stringify(id)}`);
  return page;
}

/** The example request "Ask Claude for a mod" in the Create a mod docs uses. */
export const ASK_CLAUDE_EXAMPLE_PROMPT = "make a mod that shows the current git branch above the prompt";

/** The steps of "Ask Claude for a mod" in the Create a mod docs, in their order. */
export const ASK_CLAUDE_STEPS: readonly TimelineItem[] = [
  {
    title: "Describe the mod",
    description: `In an interactive session, ask in your own words, for example: ${ASK_CLAUDE_EXAMPLE_PROMPT}. Claude writes the mod in a folder of its own under ~/.claude/dev-mods/, inside a folder named for the session's ID.`,
    details: [
      "In the default and acceptEdits permission modes, Claude Code asks before Claude creates each file, because ~/.claude is a protected path. Approve each one.",
    ],
  },
  {
    title: "Approve the mod",
    description:
      "When Claude saves the first file, Claude Code asks whether to enable hot reloading for the session.",
    details: [
      "Enable for this session: the mod loads when the turn ends, and reloads at the end of each turn that changes it.",
      "Not now: nothing loads for now. The files stay where Claude wrote them, and the mod loads the next time that session starts.",
    ],
  },
  {
    title: "Check that it loaded",
    description:
      "Run /plugin at the Claude Code prompt and press Tab until the Installed tab is selected. It lists the mod, and you can turn it off there.",
  },
  {
    title: "Try it, and ask for changes",
    description:
      "Use what you asked for. If it does not do what you wanted, tell Claude what to change. The mod reloads at the end of each turn that changes its files.",
  },
];

/** What happens to a mod Claude wrote after its session, and how to keep it, from the Create a mod docs. */
export const ASK_CLAUDE_KEEP =
  "A mod Claude writes loads only in the session that made it, and Claude Code deletes that session's mods folder once it is older than cleanupPeriodDays. To keep one, copy its folder somewhere of your own, such as ~/mods/git-branch, and load it from there:";

/** The sessions where a mod Claude writes does not load, from the Create a mod docs. */
export const ASK_CLAUDE_SKIPPED: readonly string[] = [
  "Nobody is there to approve it, as in a claude -p run or dontAsk mode.",
  "You have not accepted the trust prompt for the folder.",
  "You started with --safe-mode or --bare, you set disableAllHooks, or your organization's managed settings block it.",
];

export const MOD_FOLDER_TREE = [
  "mod-starter/",
  "  .claude-plugin/plugin.json   the plugin manifest",
  "  hooks/hooks.json             names the hooks module to load",
  "  hooks/register.ts            export function register(on)",
  "  hooks/is-force-push.ts       a plain helper, easy to test",
  "  tests/register.test.ts       run by claude plugin test",
  "  tests/is-force-push.test.ts  run by claude plugin test",
].join("\n");

/** What the hooks module's environment is, from the header of the type declarations Claude Code writes beside a mod. */
export const HOOKS_ENVIRONMENT_LIMITS: readonly string[] = [
  "There is no DOM and no Node, so there is no fs, no process and no require.",
  "Every file is an ES module, whatever its suffix, and a file whose name does not end in .ts, .tsx, .jsx, .js, .mjs, .cjs, .mts or .cts is not loaded.",
  "Use the web APIs the environment provides, such as URL and TextEncoder, and reach the outside world only through $.",
  "A mod can still act through $, which gives it files, the network and processes, and it can refuse or change any tool call.",
];

/** Shown before the commands that run a mod folder. Testing and loading run the mod's code; validate reads its source. */
export const RUN_WARNING: readonly string[] = [
  "Testing a mod, or loading it with --plugin-dir, runs its code with your permissions. validate reads its source and reports what it hooks without loading it.",
  "Read every file of a folder before you run it, and run only folders you trust. A mod can refuse or change any tool call and reach the outside world through $.",
];

/** What the starter's force push check does and does not catch, checked against the helper's own tests. */
export const STARTER_LIMITS =
  "This is a teaching example, not a security boundary. It catches --force, short flags that include f such as -fu, and forced refspecs such as +main. It does not see through wrappers such as sudo, env or bash -c, scripts or aliases, and it lets --force-with-lease, --delete and --mirror pass. Do not rely on it.";

export const TEST_KIT_NOTES: readonly string[] = [
  "A test receives the engine's own $ and a registrar on. The hooks a test registers with on sit beneath your mod, where the rest of the world would be, and a call they leave unanswered throws and names its event.",
  "The kit has no test.each. Register the cases with a loop, as the starter's helper tests do.",
  "tier('user') says the mod loads as an installed plugin would. A built-in mod uses tier('builtin').",
];
