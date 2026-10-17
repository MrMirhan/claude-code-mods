import type { HubKind } from "@/lib/kind-hubs";

/**
 * Text for the kind landing pages (`/mods/`, `/plugins/` and so on). Each paragraph restates the
 * official Claude Code docs page linked as `docsUrl`; which entries exist, who publishes them and
 * how each one is installed comes from the catalog, never from this file.
 */
export interface KindHubContent {
  /** The page's h1. */
  readonly heading: string;
  /** One of the kind, as the "What is a ..." heading names it. */
  readonly singular: string;
  /** One sentence under the h1. */
  readonly lead: string;
  /** "What is a ..." paragraphs. */
  readonly about: readonly string[];
  /** "How you get one" paragraphs. */
  readonly gettingIt: readonly string[];
  /** Example command shapes for the "How you get one" section, with placeholders, never a real entry. */
  readonly commandShapes: readonly string[];
  readonly docsUrl: string;
  readonly docsLabel: string;
}

export const KIND_HUB_CONTENT: Readonly<Record<HubKind, KindHubContent>> = {
  mod: {
    heading: "Claude Code mods",
    singular: "Mod",
    lead: "Every mod in the directory: the ones built into Claude Code, Anthropic's samples, and mods from the community.",
    about: [
      "A mod is a Claude Code plugin that changes how Claude Code looks and behaves. It is made of JavaScript or TypeScript event handlers in a hooks module, which run inside Claude Code.",
      "Mods are on by default from Claude Code v2.1.287 in the terminal, and from v2.1.286 in the Desktop app. Some of Claude Code's own features are mods, such as /diff.",
    ],
    gettingIt: [
      "A built-in mod is already in Claude Code: there is nothing to install. Other mods are plugins, so you install one from a plugin marketplace, or run it from a folder on your machine while you try it.",
      "A mod runs JavaScript inside Claude Code with your permissions. Read its source before you run it.",
    ],
    commandShapes: ["claude --plugin-dir <path-to-mod>"],
    docsUrl: "https://code.claude.com/docs/en/plugins/mods/overview",
    docsLabel: "Mods overview in the Claude Code docs",
  },
  plugin: {
    heading: "Claude Code plugins",
    singular: "Plugin",
    lead: "Plugins listed in the directory, each with the command that installs it.",
    about: [
      "A plugin is what Claude Code installs. One plugin can hold slash commands, agents, skills, hooks, MCP servers and mods, so a single install adds all of them.",
    ],
    gettingIt: [
      "You install a plugin from a marketplace with /plugin install and the plugin's name followed by @ and the marketplace's name. Anthropic's official marketplace, claude-plugins-official, needs no setup; any other marketplace must be added first.",
      "A plugin can run code on your machine with your user permissions, so install only plugins you trust.",
    ],
    commandShapes: ["/plugin marketplace add <owner>/<repo>", "/plugin install <plugin>@<marketplace>"],
    docsUrl: "https://code.claude.com/docs/en/plugins/install",
    docsLabel: "Install plugins in the Claude Code docs",
  },
  skill: {
    heading: "Claude Code skills",
    singular: "Skill",
    lead: "Skills listed in the directory, with the plugin or source each one comes from.",
    about: [
      "A skill is a folder with a SKILL.md file of instructions. Claude uses it when a task matches the skill's description, and the skill's body loads only when it is used.",
    ],
    gettingIt: [
      "The skills here come inside plugins: install the plugin that carries the skill, as its page shows. You can also save a skill folder of your own under ~/.claude/skills to use it in all your projects.",
    ],
    commandShapes: ["~/.claude/skills/<skill-name>/SKILL.md"],
    docsUrl: "https://code.claude.com/docs/en/skills",
    docsLabel: "Skills in the Claude Code docs",
  },
  agent: {
    heading: "Claude Code subagents",
    singular: "Subagent",
    lead: "Subagents listed in the directory, with the plugin that installs each one.",
    about: [
      "A subagent is an agent with its own system prompt, tool access and context window, defined in a markdown file. It does a side task in its own context and returns the result, so search results and logs stay out of your main conversation.",
    ],
    gettingIt: [
      "Each subagent here ships in a plugin's agents folder: install the plugin its page names. Your own subagents can live in ~/.claude/agents for every project, or in a project's .claude/agents folder.",
    ],
    commandShapes: ["/plugin install <plugin>@<marketplace>"],
    docsUrl: "https://code.claude.com/docs/en/sub-agents",
    docsLabel: "Subagents in the Claude Code docs",
  },
  "mcp-server": {
    heading: "MCP servers for Claude Code",
    singular: "MCP server",
    lead: "MCP servers listed in the directory, each with the command that sets it up.",
    about: [
      "An MCP server is a program that gives Claude Code extra tools and data through the Model Context Protocol, such as file access, a browser or a memory store.",
    ],
    gettingIt: [
      "Most are added with claude mcp add, followed by a name and the command that starts the server. Some are also packaged as plugins, and install like any other plugin.",
    ],
    commandShapes: ["claude mcp add <name> -- <command>", "claude mcp add --transport http <name> <url>"],
    docsUrl: "https://code.claude.com/docs/en/mcp",
    docsLabel: "MCP in the Claude Code docs",
  },
};
