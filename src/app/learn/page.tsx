import { ArrowRight } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Callout } from "@/components/docs/Callout";
import { ComparisonTable } from "@/components/docs/ComparisonTable";
import { DefinitionList } from "@/components/docs/DefinitionList";
import { DocPage } from "@/components/docs/DocPage";
import { DocSection, Prose } from "@/components/docs/DocSection";
import { InlineCode } from "@/components/docs/InlineCode";
import { TextLink } from "@/components/docs/TextLink";
import {
  BUILT_IN_MOD_COLUMNS,
  BUILT_IN_MODS,
  type BuiltInMod,
  builtInModSourceHref,
  CONCEPTS,
  KIND_COMPARISON,
  KIND_COMPARISON_COLUMNS,
  LEARN_FAQ,
  LEARN_SOURCES,
  MODS_MIN_VERSION,
  OFFICIAL_MOD_DOCS,
  WHERE_MODS_RUN,
  WHERE_MODS_RUN_COLUMNS,
} from "@/components/docs/learnContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { getEvents, getEventsSource } from "@/lib/events";
import { buildLearnGraph } from "@/lib/seo/jsonLd";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { EVENT_FAMILIES, type EventFamily } from "@/lib/types";

export const metadata: Metadata = buildStaticPageMetadata(PAGE_SEO.learn);

/** A built-in mod's public source folder as a link, or a plain note when Anthropic has not published it. */
function BuiltInModSource({ mod }: { readonly mod: BuiltInMod }): ReactNode {
  const href = builtInModSourceHref(mod);
  if (href === null) return "Not public";
  return <TextLink href={href}>{`mods/${mod.sourceFolder ?? ""}`}</TextLink>;
}

function countByFamily(family: EventFamily): number {
  return getEvents().filter((event) => event.family === family).length;
}

export default function LearnPage(): ReactNode {
  const source = getEventsSource();
  const [engineCount, opCount, classicCount] = EVENT_FAMILIES.map(countByFamily);

  return (
    <DocPage
      title="Learn Claude Mods"
      description="What a Claude Mod is, how function hooks work, and how a mod differs from the other ways to extend Claude Code."
    >
      <JsonLd data={buildLearnGraph(LEARN_FAQ)} />
      <Callout>
        <p>
          Mods are on by default in Claude Code {`v${MODS_MIN_VERSION.terminal}`} or later in the terminal, and from{" "}
          {`v${MODS_MIN_VERSION.desktop}`} in the Code tab of the Desktop app. They are new, and Anthropic&apos;s docs say
          their events and methods can change between releases. This site is unofficial: the sources are linked beside
          each idea and in the table, so you can check them.
        </p>
      </Callout>
      <div className="flex flex-wrap items-center gap-3">
        <Button href="/learn/tutorials/" size="lg" iconRight={<ArrowRight size={18} weight="regular" aria-hidden="true" />}>
          Watch the video tutorials
        </Button>
        <Button href="/learn/getting-started/" variant="ghost" size="lg">
          Build your first mod
        </Button>
      </div>
      <DocSection id="what-is-a-mod" title="What is a Claude Mod?">
        <Prose>
          <p>
            A mod is a Claude Code plugin whose behaviour lives in a hooks module: one <InlineCode>register</InlineCode>{" "}
            entry that hooks the engine&apos;s events with JavaScript or TypeScript functions shaped{" "}
            <InlineCode>($, e, next)</InlineCode>. The announcement puts it this way: a mod is just a plugin that uses
            function hooks, and function hooks are the documented primitive that mods are built on.
          </p>
          <p>
            Claude Code ships six built-in mods, and Anthropic publishes the source of four of them. Read those four in
            the <TextLink href="/browse/?kind=mod">directory</TextLink>, in the{" "}
            <TextLink href={LEARN_SOURCES.modsReadme}>Mods README</TextLink>, or in the{" "}
            <TextLink href={LEARN_SOURCES.announcementIssue}>announcement issue</TextLink>.
          </p>
        </Prose>
      </DocSection>
      <DocSection id="built-in" title="Mods built into Claude Code">
        <Prose>
          <p>
            Some of Claude Code&apos;s own features are mods. Run <InlineCode>/plugin</InlineCode> and open the
            Installed tab to see the ones your session has, listed under Built-in. You cannot update or uninstall them,
            and <InlineCode>--safe-mode</InlineCode>, <InlineCode>--bare</InlineCode> and{" "}
            <InlineCode>disableAllHooks</InlineCode> do not stop them.
          </p>
        </Prose>
        <ComparisonTable
          caption="The mods built into Claude Code"
          columns={BUILT_IN_MOD_COLUMNS}
          rows={BUILT_IN_MODS.map((mod) => ({
            id: mod.name,
            header: <InlineCode>{mod.name}</InlineCode>,
            cells: [mod.whatItDoes, <BuiltInModSource key="source" mod={mod} />],
          }))}
        />
        <Prose>
          <p className="text-sm">
            Source: <TextLink href={LEARN_SOURCES.modsOverviewDocs}>Mods overview</TextLink>, which also says how to
            turn each one off.
          </p>
        </Prose>
      </DocSection>
      <DocSection id="official-docs" title="Anthropic's official docs">
        <Prose>
          <p>Anthropic documents mods in these pages. When this site and the docs disagree, trust the docs.</p>
          <ul role="list" className="flex list-disc flex-col gap-2 pl-5">
            {OFFICIAL_MOD_DOCS.map((page) => (
              <li key={page.id}>
                <TextLink href={page.href}>{page.title}</TextLink>: {page.covers}
              </li>
            ))}
          </ul>
        </Prose>
      </DocSection>
      <DocSection id="how-it-works" title="How function hooks work">
        <DefinitionList
          items={CONCEPTS.map((concept) => ({
            id: concept.id,
            term: concept.term,
            description: (
              <>
                <p>{concept.description}</p>
                <p className="text-sm">
                  Source:{" "}
                  {concept.sources.map((source, index) => (
                    <span key={source.href}>
                      {index === 0 ? "" : ", "}
                      <TextLink href={source.href}>{source.label}</TextLink>
                    </span>
                  ))}
                </p>
              </>
            ),
          }))}
        />
      </DocSection>
      <DocSection id="compared" title="Mods compared with the rest">
        <Prose>
          <p>
            Claude Code can be extended in {KIND_COMPARISON.length - 1} other ways. They overlap, and a plugin can package
            several of them. The others work from outside Claude Code: each runs a script, or gives Claude text or tools.
            A mod runs inside Claude Code, so it is the only one that can draw in the interface. If one of the others
            already does what you need, start there.
          </p>
        </Prose>
        <ComparisonTable
          caption="Mods compared with plugins, classic hooks, MCP servers and skills"
          columns={KIND_COMPARISON_COLUMNS}
          rows={KIND_COMPARISON.map((kind) => ({
            id: kind.id,
            header: kind.name,
            cells: [
              kind.whatItIs,
              kind.whatItCanChange,
              kind.drawsInTheInterface,
              kind.whatYouWrite,
              kind.pickItWhen,
              <span key="sources">
                {kind.sources.map((source, index) => (
                  <span key={source.href}>
                    {index === 0 ? "" : ", "}
                    <TextLink href={source.href}>{source.label}</TextLink>
                  </span>
                ))}
              </span>,
            ],
          }))}
        />
      </DocSection>
      <DocSection id="where-mods-run" title="Where mods run">
        <Prose>
          <p>
            A mod&apos;s hooks run in every kind of session that loads its plugin. What it draws shows up in fewer
            places: only the terminal and the Code tab of the Desktop app show its panes, bands and replaced rows.
          </p>
        </Prose>
        <ComparisonTable
          caption="Where a mod's hooks run and where what it draws shows"
          columns={WHERE_MODS_RUN_COLUMNS}
          rows={WHERE_MODS_RUN.map((place) => ({
            id: place.id,
            header: place.where,
            cells: [place.hooksRun, place.drawingShows],
          }))}
        />
        <Prose>
          <p>
            A mod that draws can check which app it is running in, and fall back to a line in the transcript or a
            command&apos;s text reply where nothing draws. Source:{" "}
            <TextLink href={LEARN_SOURCES.modsOverviewDocs}>Mods overview</TextLink>.
          </p>
        </Prose>
      </DocSection>
      <DocSection id="events" title="What a mod can hook">
        <Prose>
          <p>
            Function hooks name {getEvents().length} events: {engineCount} engine events, {opCount} calls on{" "}
            <InlineCode>$</InlineCode> and {classicCount} classic hooks bridged in as{" "}
            <InlineCode>classic.&lt;Name&gt;</InlineCode>. The names were read from Anthropic&apos;s type declarations
            at commit <InlineCode>{source.sha.slice(0, 7)}</InlineCode>
            {source.claudeCodeVersion === null ? "" : ` (Claude Code ${source.claudeCodeVersion})`} on {source.syncedAt}.
            The <TextLink href="/hooks/">Hooks page</TextLink> shows which mods and plugins use which events.
          </p>
        </Prose>
      </DocSection>
      <DocSection id="faq" title="Frequently asked questions">
        <DefinitionList
          items={LEARN_FAQ.map((entry) => ({
            id: entry.id,
            // A real h3, not just styled text, so a screen reader's "next heading" shortcut reaches
            // every question, the same way it reaches every DocSection title on this page.
            term: <h3 className="text-base font-medium text-fg">{entry.question}</h3>,
            anchorId: entry.id,
            description: <p>{entry.answer}</p>,
          }))}
        />
      </DocSection>
      <DocSection id="next" title="Where to go next">
        <Prose>
          <p>
            Build a small mod in the <TextLink href="/learn/getting-started/">Getting started guide</TextLink>, move a
            hook you already have with <TextLink href="/learn/migration/">classic hooks to function hooks</TextLink>, or
            watch the <TextLink href="/learn/tutorials/">official video tutorials</TextLink>. To share a mod you have
            built, see how to <TextLink href="/publish/">publish it</TextLink>, and read{" "}
            <TextLink href="/security/">what this site does and does not check</TextLink> and{" "}
            <TextLink href="/security/#mod-runtime">how Claude Code keeps a mod in check</TextLink> first.
          </p>
        </Prose>
      </DocSection>
    </DocPage>
  );
}
