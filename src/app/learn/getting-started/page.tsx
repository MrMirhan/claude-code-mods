import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Callout } from "@/components/docs/Callout";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocPage } from "@/components/docs/DocPage";
import { DocSection, Prose } from "@/components/docs/DocSection";
import { InlineCode } from "@/components/docs/InlineCode";
import { TextLink } from "@/components/docs/TextLink";
import { Timeline } from "@/components/docs/Timeline";
import {
  ASK_CLAUDE_KEEP,
  ASK_CLAUDE_SKIPPED,
  ASK_CLAUDE_STEPS,
  HOOKS_ENVIRONMENT_LIMITS,
  LEARN_SOURCES,
  MOD_FOLDER_TREE,
  MODS_MIN_VERSION,
  officialModDoc,
  RETIRED_FLAG_NAME,
  RUN_WARNING,
  STARTER_LIMITS,
  TEST_KIT_NOTES,
  TESTED_WITH,
} from "@/components/docs/learnContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { CopyCommand } from "@/components/ui/CopyCommand";
import { buildDocPageGraph } from "@/lib/seo/jsonLd";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { COMMUNITY_REPOSITORY_URL } from "@/lib/site";
import { STARTER_MOD_DIRECTORY, loadStarterModFiles } from "@/lib/starter-mod";

export const metadata: Metadata = buildStaticPageMetadata(PAGE_SEO.learnGettingStarted);

export default function GettingStartedPage(): ReactNode {
  const starterFiles = loadStarterModFiles();

  return (
    <DocPage
      title="Build your first Claude Mod"
      description="Ask Claude to write a mod for you, or test and run a small starter mod that refuses force pushes."
    >
      <JsonLd data={buildDocPageGraph(PAGE_SEO.learnGettingStarted)} />
      <Callout tone="warning">
        <p>
          Mods are new, and Anthropic&apos;s docs say their events and methods can change between releases. The commands
          here were run with Claude Code {TESTED_WITH.claudeCodeVersion} on {TESTED_WITH.date}. If your version is newer,
          check them against <TextLink href={LEARN_SOURCES.modsCreateDocs}>Create a mod</TextLink> in the official docs.
        </p>
      </Callout>
      <DocSection id="ask-claude" title="The easiest way: ask Claude for a mod">
        <Prose>
          <p>
            Describe the mod you want and Claude writes it. Claude works from a skill built into Claude Code named{" "}
            <InlineCode>plugin-authoring</InlineCode>, which tells it where to write the mod, which events and methods
            your version has, and how the mod loads. Claude can load the skill on its own when you ask for a mod, or
            you can run <InlineCode>/plugin-authoring</InlineCode> at the Claude Code prompt yourself. You need a
            version where <TextLink href="#enable">mods are on</TextLink>.
          </p>
        </Prose>
        <Timeline items={ASK_CLAUDE_STEPS} label="Steps to have Claude write a mod" />
        <Callout tone="warning">
          <p>
            A mod is code that runs with your permissions, the one Claude writes included. Read its files before you
            approve them.
          </p>
        </Callout>
        <Prose>
          <p>{ASK_CLAUDE_KEEP}</p>
        </Prose>
        <CopyCommand command="claude --plugin-dir ~/mods/git-branch" label="Load a mod you copied out of the session" />
        <Prose>
          <p>A mod Claude writes does not load in these sessions:</p>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            {ASK_CLAUDE_SKIPPED.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          <p>
            The steps are from <TextLink href={LEARN_SOURCES.modsCreateDocs}>Create a mod</TextLink> in the official
            docs. To learn how a mod&apos;s code works, build the starter below yourself.
          </p>
        </Prose>
      </DocSection>
      <DocSection id="enable" title="Check that mods are on">
        <Prose>
          <p>
            Mods are on by default. In the terminal, use Claude Code v{MODS_MIN_VERSION.terminal} or later. The Desktop
            app ships its own copy of Claude Code, and mods work in its Code tab from v{MODS_MIN_VERSION.desktop}. Check
            the version where you use mods. In the terminal, run:
          </p>
        </Prose>
        <CopyCommand command="claude --version" label="Check the terminal version" />
        <Prose>
          <p>
            In the Desktop app, enter <InlineCode>/status</InlineCode> in a local session in the Code tab and read the{" "}
            <strong>Claude Code</strong> row.
          </p>
          <p>
            To see which mods a terminal session loaded, run <InlineCode>/plugin</InlineCode> at the Claude Code prompt. A
            dim line under the tabs gives the count and the names, such as{" "}
            <InlineCode>1 mod active · first-mod</InlineCode>. Built-in mods are left out of that line.
          </p>
          <p>
            To turn mods off, disable one in <InlineCode>/plugin</InlineCode>, start one session with{" "}
            <InlineCode>--safe-mode</InlineCode>, or set <InlineCode>&quot;disableAllHooks&quot;: true</InlineCode> in{" "}
            <InlineCode>~/.claude/settings.json</InlineCode>, which also stops your settings hooks. The last two stop
            the mods you installed, not the ones built into Claude Code. The{" "}
            <TextLink href={LEARN_SOURCES.modsOverviewDocs}>mods overview</TextLink> covers each one.
          </p>
        </Prose>
        <Callout>
          <p>
            If you set <InlineCode>{RETIRED_FLAG_NAME}</InlineCode> during early access, remove it.{" "}
            {`Claude Code v${MODS_MIN_VERSION.terminal} and later ignores it`}, so setting it to{" "}
            <InlineCode>0</InlineCode> does not keep mods off.
          </p>
        </Callout>
      </DocSection>
      <DocSection id="folder" title="What a mod folder holds">
        <Prose>
          <p>
            A mod folder is a complete plugin: a manifest, a <InlineCode>hooks/hooks.json</InlineCode> that names the
            hooks module, TypeScript under <InlineCode>hooks/</InlineCode>, and tests.
          </p>
        </Prose>
        <CodeBlock code={MOD_FOLDER_TREE} label="Folder layout of the starter mod" />
        <Prose>
          <p>The hooks module runs in an environment of its own:</p>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            {HOOKS_ENVIRONMENT_LIMITS.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </Prose>
      </DocSection>
      <DocSection id="starter" title="The starter mod">
        <Prose>
          <p>
            <InlineCode>block-force-push</InlineCode> refuses a Bash call that force pushes with git and passes every
            other tool call to the hooks beneath it. <InlineCode>on(&apos;tool.call&apos;, …)</InlineCode> hooks the
            engine&apos;s event for a tool call, <InlineCode>e.tool === &apos;Bash&apos;</InlineCode> narrows{" "}
            <InlineCode>e</InlineCode> so <InlineCode>e.command</InlineCode> is a string, returning{" "}
            <InlineCode>{"{ deny }"}</InlineCode> refuses the call, and <InlineCode>next(e)</InlineCode> lets it
            through. The files below are read from{" "}
            <TextLink href={`${COMMUNITY_REPOSITORY_URL}/tree/main/${STARTER_MOD_DIRECTORY}`}>{STARTER_MOD_DIRECTORY}</TextLink>{" "}
            in this site&apos;s repository when the site is built, and they passed the tests below on Claude Code{" "}
            {TESTED_WITH.claudeCodeVersion} on {TESTED_WITH.date}. The commands on this page run from the root of a clone
            of that repository:
          </p>
        </Prose>
        <CopyCommand command={`git clone ${COMMUNITY_REPOSITORY_URL}.git`} label="Clone the repository" />
        <CopyCommand command="cd claude-code-mods" label="Go to the root of the clone" />
        <div className="flex flex-col gap-6">
          {starterFiles.map((file) => (
            <CodeBlock key={file.path} filename={file.path} code={file.content} />
          ))}
        </div>
        <Callout>
          <p>{STARTER_LIMITS}</p>
        </Callout>
      </DocSection>
      <DocSection id="test" title="Test it">
        <Callout tone="warning">
          {RUN_WARNING.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Callout>
        <CopyCommand command={`claude plugin test ${STARTER_MOD_DIRECTORY}`} label="Run the starter's tests" />
        <Prose>
          <p>All of the starter&apos;s tests passed on Claude Code {TESTED_WITH.claudeCodeVersion}. What to know about the test kit:</p>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            {TEST_KIT_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p>
            To write tests of your own, read <TextLink href={officialModDoc("test").href}>{officialModDoc("test").title}</TextLink>{" "}
            in the official docs.
          </p>
        </Prose>
      </DocSection>
      <DocSection id="run" title="Check it and run it">
        <CopyCommand command={`claude plugin validate ${STARTER_MOD_DIRECTORY}`} label="Validate the manifest and the hooks module" />
        <CopyCommand command={`claude --plugin-dir ${STARTER_MOD_DIRECTORY}`} label="Run Claude Code with the mod loaded from source" />
        <Prose>
          <p>
            <InlineCode>validate</InlineCode> reads the manifest and the module the way the engine will. For the
            starter it reports that the module hooks <InlineCode>tool.call</InlineCode> and calls nothing on{" "}
            <InlineCode>$</InlineCode>. The starter was checked by its tests and by <InlineCode>validate</InlineCode>; it
            was not run in a live session for this page.
          </p>
        </Prose>
      </DocSection>
      <DocSection id="types" title="Get the types">
        <Prose>
          <p>
            When Claude Code loads a mod with <InlineCode>--plugin-dir</InlineCode> in an interactive session, it writes
            TypeScript declaration files into the mod&apos;s <InlineCode>.claude-plugin/types/</InlineCode> folder. They
            describe the events, methods and elements of the version you run, so your editor can check your hooks. If
            the mod has no <InlineCode>tsconfig.json</InlineCode> of its own, Claude Code adds one at its root.
          </p>
          <p>
            Events and methods can change between releases, so when these files and a page disagree, trust the files.
            See <TextLink href={LEARN_SOURCES.modsCreateDocs}>Create a mod</TextLink> for the full list.
          </p>
        </Prose>
      </DocSection>
      <DocSection id="next" title="Where to go next">
        <Prose>
          <p>
            Read how the four built-in mods with public source are written in the <TextLink href="/browse/?kind=mod">directory</TextLink>,
            look up an event on the <TextLink href="/hooks/">Hooks page</TextLink>, move a hook you already have with{" "}
            <TextLink href="/learn/migration/">classic hooks to function hooks</TextLink>, and see{" "}
            <TextLink href="/learn/">what a mod is and how it compares with plugins, hooks and skills</TextLink>.
          </p>
          <p>
            If a mod does nothing, start with{" "}
            <TextLink href={officialModDoc("troubleshoot").href}>{officialModDoc("troubleshoot").title}</TextLink>. The
            rest of Anthropic&apos;s mod docs are listed on <TextLink href="/learn/#official-docs">Learn</TextLink>.
          </p>
        </Prose>
      </DocSection>
    </DocPage>
  );
}
