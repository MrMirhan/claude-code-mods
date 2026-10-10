import type { EventFamily } from "@/lib/types";

/**
 * Short descriptions and links to Anthropic's docs for the Hooks page. Pure data, no file system,
 * so client components can import it.
 *
 * Every line is this site's own paraphrase of Anthropic's public docs pages (the mods reference, the
 * guides it links and the changelog), checked on 2026-10-10. Nothing is taken from the type
 * declarations: they are published under "All rights reserved" terms, so the site keeps only names
 * from them. When the docs and the types Claude Code writes for a build disagree, the types win.
 */

const DOCS = "https://code.claude.com/docs/en";
export const MODS_REFERENCE_URL = `${DOCS}/plugins/mods/reference`;
export const HOOKS_DOCS_URL = `${DOCS}/hooks`;
const MODS_API_GUIDE_URL = `${DOCS}/plugins/mods/api`;
const MODS_INTERFACE_GUIDE_URL = `${DOCS}/plugins/mods/interface`;

export interface DocsLink {
  readonly href: string;
  readonly label: string;
}

export interface FamilyDocs {
  readonly summary: string;
  readonly link: DocsLink;
}

/** What each family is, with the page of Anthropic's docs that lists it. */
export const FAMILY_DOCS: Readonly<Record<EventFamily, FamilyDocs>> = {
  engine: {
    summary:
      "Moments in Claude Code's own work: a tool call, a prompt, a turn, the session, a drawing. A hook can watch one, pass on a changed copy, or answer it itself.",
    link: { href: `${MODS_REFERENCE_URL}#events`, label: "Events in Anthropic's mods reference" },
  },
  op: {
    summary:
      "Every method on $ is also an event, named for its namespace and method. A hook on one sees the calls that mods running after it make, and can let a call through, refuse it, or answer with a value of its own.",
    link: { href: `${MODS_REFERENCE_URL}#mods-api-methods`, label: "Mods API methods in Anthropic's mods reference" },
  },
  classic: {
    summary:
      "Each settings hook event, under the name classic.<Event>. The hook reads the same JSON a command hook gets on stdin.",
    link: { href: `${HOOKS_DOCS_URL}#hook-events`, label: "Hook events in Anthropic's hooks reference" },
  },
};

const REFERENCE_SECTIONS = {
  tools: { href: `${MODS_REFERENCE_URL}#tools`, label: "Tools" },
  prompts: { href: `${MODS_REFERENCE_URL}#prompts-and-what-claude-reads`, label: "Prompts and what Claude reads" },
  commands: { href: `${MODS_REFERENCE_URL}#commands-and-configuration`, label: "Commands and configuration" },
  turns: { href: `${MODS_REFERENCE_URL}#turns`, label: "Turns" },
  session: { href: `${MODS_REFERENCE_URL}#session`, label: "Session" },
  subagents: { href: `${MODS_REFERENCE_URL}#subagents`, label: "Subagents" },
  interface: { href: `${MODS_REFERENCE_URL}#interface`, label: "Interface" },
  otherMods: { href: `${MODS_REFERENCE_URL}#other-mods`, label: "Other mods" },
  telemetry: { href: `${MODS_REFERENCE_URL}#telemetry`, label: "Telemetry" },
  methods: { href: `${MODS_REFERENCE_URL}#mods-api-methods`, label: "Mods API methods" },
} as const satisfies Record<string, DocsLink>;

const GUIDES = {
  command: { href: `${MODS_API_GUIDE_URL}#add-a-command`, label: "Add a command" },
  tool: { href: `${MODS_API_GUIDE_URL}#add-a-tool`, label: "Add a tool" },
  model: { href: `${MODS_API_GUIDE_URL}#call-a-model`, label: "Call a model" },
  background: { href: `${MODS_API_GUIDE_URL}#run-work-in-the-background`, label: "Run work in the background" },
  turnFromJob: { href: `${MODS_API_GUIDE_URL}#start-a-turn-from-a-background-job`, label: "Start a turn from a background job" },
  sessions: { href: `${MODS_API_GUIDE_URL}#send-and-receive-messages-between-sessions`, label: "Send and receive messages between sessions" },
  reach: { href: `${MODS_API_GUIDE_URL}#reach-files-processes-and-the-network`, label: "Reach files, processes, and the network" },
  draw: { href: `${MODS_INTERFACE_GUIDE_URL}#pick-where-to-draw`, label: "Draw in the interface" },
  state: { href: `${MODS_INTERFACE_GUIDE_URL}#keep-state`, label: "Keep state" },
} as const satisfies Record<string, DocsLink>;

export interface NounDocs {
  /** One line on the namespace, or null where the docs only list its names. */
  readonly summary: string | null;
  readonly link: DocsLink;
}

/** Engine nouns, each linked to the section of the reference whose table lists its events. */
const ENGINE_NOUN_DOCS: Readonly<Record<string, NounDocs>> = {
  agent: { summary: "When a subagent type is offered to Claude, and when a subagent or a teammate is about to start.", link: REFERENCE_SECTIONS.subagents },
  attribution: { summary: null, link: REFERENCE_SECTIONS.prompts },
  command: { summary: "When a command runs or is listed.", link: REFERENCE_SECTIONS.commands },
  config: { summary: "When a /config row is shown or changed.", link: REFERENCE_SECTIONS.commands },
  engine: { summary: null, link: REFERENCE_SECTIONS.otherMods },
  plugin: { summary: null, link: REFERENCE_SECTIONS.otherMods },
  prompt: { summary: "The text the user types and the text Claude Code sends to Claude on its own, such as the system prompt and reminders.", link: REFERENCE_SECTIONS.prompts },
  session: { summary: "The session starting, ending, compacting, and trading messages with other sessions.", link: REFERENCE_SECTIONS.session },
  skill: { summary: null, link: REFERENCE_SECTIONS.prompts },
  telemetry: { summary: "The usage records Claude Code logs.", link: REFERENCE_SECTIONS.telemetry },
  tool: { summary: "Around each tool call Claude makes, from the description Claude reads to the decision on whether the call runs.", link: REFERENCE_SECTIONS.tools },
  turn: { summary: "One answer from start to finish, including each request to the model within it.", link: REFERENCE_SECTIONS.turns },
  ui: { summary: "When Claude Code draws a render site, and when the user uses a control a mod drew.", link: REFERENCE_SECTIONS.interface },
};

/** Namespaces on `$`, each linked to the guide the reference points to for it, or to the reference itself. */
const OP_NOUN_DOCS: Readonly<Record<string, NounDocs>> = {
  agent: { summary: null, link: REFERENCE_SECTIONS.methods },
  audio: { summary: null, link: REFERENCE_SECTIONS.methods },
  clock: { summary: "Timers in place of setTimeout and setInterval, and the current time.", link: GUIDES.background },
  command: { summary: "Add a command of the mod's own.", link: GUIDES.command },
  config: { summary: null, link: REFERENCE_SECTIONS.methods },
  env: { summary: "Read and set environment variables.", link: GUIDES.reach },
  fs: { summary: "Read, write, list and inspect files.", link: GUIDES.reach },
  http: { summary: "Fetch over http or https.", link: GUIDES.reach },
  mcp: { summary: "Call an MCP tool, or connect a server your own plugin lists.", link: GUIDES.reach },
  model: { summary: "Send a mod's own requests to a model, with or without the current conversation.", link: GUIDES.model },
  process: { summary: "Run a command and wait for it to exit, or stream a long-running command's output.", link: GUIDES.reach },
  prompt: { summary: "Submit a prompt from a mod. Claude reads it after a sentence naming the mod as the sender, unless asUser is true.", link: GUIDES.turnFromJob },
  session: { summary: "Facts about this session, such as its messages, folders, model and usage, and messages to other sessions.", link: GUIDES.sessions },
  settings: { summary: "Read what the settings files and managed policy hold.", link: GUIDES.reach },
  state: { summary: "Reactive state a mod reads and sets, declared in its types file.", link: GUIDES.state },
  store: { summary: "A key-value store that every session on the machine shares.", link: GUIDES.state },
  tool: { summary: "Add a tool for Claude.", link: GUIDES.tool },
  turn: { summary: null, link: REFERENCE_SECTIONS.methods },
  ui: { summary: "Open and close panes, and show toasts, status lines, transcript lines, questions and notifications.", link: GUIDES.draw },
};

/** The docs for a noun as it appears in `family`, or null for a noun this file does not describe. */
export function nounDocs(family: EventFamily, noun: string): NounDocs | null {
  if (family === "classic") return null;
  const table = family === "engine" ? ENGINE_NOUN_DOCS : OP_NOUN_DOCS;
  return Object.hasOwn(table, noun) ? table[noun] : null;
}

/**
 * One line per event, where the docs give enough to write one. Engine events follow the reference's
 * "fires when" column; calls on `$` follow the guides and changelog where those describe the method.
 */
const EVENT_SUMMARIES: Readonly<Record<string, string>> = {
  // Engine: tools
  "tool.call": "A tool is about to run. A hook can let it run, refuse it with a reason, or answer with a result of its own.",
  "tool.check": "Claude Code decides whether a tool call may run, after the tool.call and PreToolUse hooks. A hook can answer allow, ask or deny.",
  "tool.describe": "A tool's description is first sent to Claude. A hook can rewrite it, and can put the tool behind tool search or load it upfront.",
  // Engine: prompts and what Claude reads
  "prompt.submit": "A prompt is submitted. A hook can rewrite it, add context, or drop it with a reason.",
  "prompt.fill": "Text is about to go into the prompt box as a draft.",
  "prompt.suggest": "Text is about to appear in the prompt box as a dim suggestion.",
  "prompt.edit": "The user edits the prompt box. Hooks here get 50 milliseconds, not the usual 10 seconds.",
  "prompt.autocomplete": "Lets a mod add its own rows to the prompt box's autocomplete list.",
  "prompt.compose": "Claude Code renders a system prompt. A hook can return the sections in the order they are sent.",
  "prompt.section": "Once for each named section of the system prompt. A hook can rewrite the section or leave it out.",
  "prompt.context": "Once per conversation, for the context sent with the first message.",
  "prompt.attachment": "Claude Code adds a message of its own for Claude, such as a reminder. A hook can rewrite it or leave it out.",
  "prompt.mention": "Claude Code is about to read a file a prompt @-mentions. A hook can point it at another file or refuse.",
  "skill.prompt": "A skill's text is expanded for Claude.",
  "attribution.text": "Claude Code writes the attribution text for a commit or pull request.",
  // Engine: commands and configuration
  "command.run": "A command is about to run.",
  "command.describe": "Once for each command, for the command list. A hook can change its description or hide it.",
  "config.set": "A /config row is about to change. A hook can change the value or refuse.",
  "config.describe": "Once for each /config row. A hook can change its label and description or hide it.",
  // Engine: turns
  "turn.start": "A turn begins.",
  "turn.step": "One request is about to go to the model. A hook can change the model or the effort.",
  "turn.complete": "A turn ended. A hook can show a line under the answer.",
  // Engine: session
  "session.start": "Once for each loaded mod before the first prompt, and again after that mod reloads. Not after /clear, /resume or /branch.",
  "session.end": "The session ends, or /clear, /resume or /branch runs.",
  "session.compact": "The conversation is about to be compacted. A hook can skip it.",
  "session.receive": "A message arrives from another agent or session. A hook can consume it.",
  "session.send": "A message is about to go to another agent or session. A hook can stop it.",
  "session.append": "Once for each row the conversation keeps, such as a prompt or a tool result, before it is stored. A hook can rewrite the row's text.",
  "session.attach": "Another app connects to the session.",
  "session.detach": "Another app disconnects from the session.",
  "session.measure": "After each turn, and when the share of a plan limit used changes.",
  // Engine: subagents
  "agent.offer": "A subagent type is offered to Claude. A hook can withhold it.",
  "agent.spawn": "A subagent or an agent team teammate is about to start. A hook can choose its model or refuse.",
  // Engine: interface
  "ui.render": "A render site is about to be drawn.",
  "ui.resolve": "Mods load, once for each app, render site and mod, to build the element table $.ui.resolve reads.",
  "ui.press": "A Button a mod drew is pressed.",
  "ui.input": "An Input a mod drew is used.",
  "ui.select": "A Select a mod drew is used.",
  "ui.focus": "The focused control of a pane or the band is about to change.",
  "ui.scroll": "The scroll position of a pane or the band is about to change.",
  "ui.message": "A Client element posts data to its mod.",
  "ui.fault": "A Client element a mod drew failed to load, draw or run.",
  // Engine: other mods
  "plugin.register": "A hooks module is about to load. A hook can refuse it.",
  "engine.create": "The mods API is being built for a mod. A hook can add a namespace to it.",
  // Engine: telemetry
  "telemetry.log": "A telemetry record is about to be logged. A mod you install must filter its hook with { to: 'collector' }.",
  "telemetry.mark": "One use of a feature is marked. A mod you install must filter its hook with { to: 'collector' }.",
  // Calls on $
  "ui.close": "Close a pane. As an event, it fires when a pane is about to close, whoever closes it.",
  "ui.ask": "Ask the user a question with numbered options, in the dialog Claude uses to ask you something.",
  "ui.toast": "Show a toast with the mod's name for a few seconds.",
  "ui.status": "Show one line under the prompt until the mod changes it.",
  "ui.log": "Add a dim line to the transcript that Claude does not read.",
  "ui.blit": "Repaint one Raster on screen without running the ui.render hook again.",
  "ui.notify": "Raise a native notification through the user's own notification setting, naming the channel that sent it.",
  "ui.selection": "Read the text the user last selected in fullscreen mode.",
  "tool.register": "Add a tool for Claude. Since Claude Code 2.1.293, isDeferred: false lists its schema from the start instead of behind tool search.",
  "model.complete": "Send a prompt to a model on its own, without the conversation.",
  "model.fork": "Send the current conversation to a model with a prompt at the end.",
  "fs.write": "Write a file. The write is not atomic, so keep data several sessions change in $.store.",
  "mcp.connect": "Connect an MCP server that the mod's own plugin manifest lists.",
  "session.usage": "Read the session's start time, context use, rate limits and cost.",
  "agent.list": "List this session's subagents and teammates with their status.",
};

/** The line for `eventName`, or null when the docs give too little to write one. */
export function eventSummary(eventName: string): string | null {
  return Object.hasOwn(EVENT_SUMMARIES, eventName) ? EVENT_SUMMARIES[eventName] : null;
}

/** Anthropic's section on a classic hook, such as `hooks#pretooluse` for `classic.PreToolUse`. */
export function classicHookDocsUrl(eventName: string): string | null {
  if (!eventName.startsWith("classic.")) return null;
  return `${HOOKS_DOCS_URL}#${eventName.slice("classic.".length).toLowerCase()}`;
}
