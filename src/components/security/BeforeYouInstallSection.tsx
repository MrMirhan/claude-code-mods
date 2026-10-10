import type { ReactNode } from "react";
import { Callout } from "@/components/docs/Callout";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { ComparisonTable } from "@/components/docs/ComparisonTable";
import { DefinitionList } from "@/components/docs/DefinitionList";
import { DocSection, Prose } from "@/components/docs/DocSection";
import { InlineCode } from "@/components/docs/InlineCode";
import { SourceLine } from "@/components/docs/SourceLine";
import { TextLink } from "@/components/docs/TextLink";
import {
  BEFORE_YOU_INSTALL,
  FLAG_RETIRED_NOTE,
  MOD_OFF_SWITCHES,
  MOD_REACH,
  MODS_ADMIN_REVIEW,
  MODS_OVERVIEW_TRUST,
  MODS_OVERVIEW_TURN_OFF,
  NOT_SANDBOXED_NOTE,
  PERMISSION_PROMPT_NOTE,
  RISKY_CALLS,
  RISKY_HOOKS_NOTE,
  VALIDATE_COMMAND,
  VALIDATE_SAMPLE_OUTPUT,
} from "@/components/docs/securityContent";
import { CopyCommand } from "@/components/ui/CopyCommand";

const SUBHEADING_CLASS = "text-xl font-semibold tracking-tight text-fg";
const MINOR_HEADING_CLASS = "text-lg font-semibold tracking-tight text-fg";

/**
 * The `#before-you-install` section. Extension detail pages of every kind link here, so the
 * checks for any extension come first and the mod-specific trust model follows under its own h3.
 */
export function BeforeYouInstallSection(): ReactNode {
  return (
    <DocSection id="before-you-install" title="Before you install anything">
      <Prose>
        <p>
          Nothing on this site reviews an extension for you, so these checks are yours to make. They take a few minutes
          and apply to every extension, on this site or anywhere else. A mod needs the extra steps after them.
        </p>
      </Prose>

      <div className="flex flex-col gap-6">
        <h3 className={SUBHEADING_CLASS}>Checks for any extension</h3>
        <ul role="list" className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          {BEFORE_YOU_INSTALL.map((item) => (
            <li key={item.title} className="flex max-w-[65ch] flex-col gap-2 border-t border-border pt-4">
              <h4 className={MINOR_HEADING_CLASS}>{item.title}</h4>
              <p className="text-base leading-relaxed text-fg-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <div id="before-you-install-a-mod" className="flex flex-col gap-6 pt-4">
        <h3 className={SUBHEADING_CLASS}>Before you install a mod</h3>
        <Callout tone="warning">
          <p>
            A mod is code that runs inside Claude Code with your permissions. Install mods only from authors and
            marketplaces you trust.
          </p>
        </Callout>

        <h4 className={MINOR_HEADING_CLASS}>What a mod can reach</h4>
        <Prose>
          <p>Once it loads, a mod can:</p>
        </Prose>
        <DefinitionList items={MOD_REACH} />
        <Prose>
          <p>{NOT_SANDBOXED_NOTE}</p>
          <p>{PERMISSION_PROMPT_NOTE}</p>
          <SourceLine sources={[MODS_OVERVIEW_TRUST]} />
        </Prose>

        <h4 className={MINOR_HEADING_CLASS}>List what it does with claude plugin validate</h4>
        <Prose>
          <p>
            You can list which events a mod handles and what it asks Claude Code to do without running it. Get the
            plugin&apos;s files first, for example by cloning its repository, then run this in your shell on the
            plugin&apos;s directory:
          </p>
        </Prose>
        <CopyCommand command={VALIDATE_COMMAND} label="List a mod's hooks and calls" />
        <Prose>
          <p>
            The <InlineCode>hooks:</InlineCode> line lists the events the mod receives, and the{" "}
            <InlineCode>calls:</InlineCode> line lists the mods API methods its code calls:
          </p>
        </Prose>
        <CodeBlock code={VALIDATE_SAMPLE_OUTPUT} label="Sample hooks and calls output" />
        <Prose>
          <p>On the calls: line, these are the ones to look for:</p>
        </Prose>
        <ComparisonTable
          caption="Calls to look for in claude plugin validate output"
          columns={["Call", "What it means"]}
          rows={RISKY_CALLS.map((risky) => ({
            id: risky.calls.join(","),
            header: (
              <span className="flex flex-wrap gap-x-2 gap-y-1">
                {risky.calls.map((call) => (
                  <InlineCode key={call}>{call}</InlineCode>
                ))}
              </span>
            ),
            cells: [risky.meaning],
          }))}
        />
        <Prose>
          <p>{RISKY_HOOKS_NOTE}</p>
          <SourceLine sources={[MODS_ADMIN_REVIEW]} />
        </Prose>

        <h4 className={MINOR_HEADING_CLASS}>Turn mods off</h4>
        <Prose>
          <p>Mods are on by default. Pick how many to stop and for how long, and undo the same change to turn them back on:</p>
        </Prose>
        <DefinitionList items={MOD_OFF_SWITCHES.map((item) => ({ id: item.id, term: item.scope, description: item.how }))} />
        <Callout>
          <p>{FLAG_RETIRED_NOTE}</p>
        </Callout>
        <Prose>
          <SourceLine sources={[MODS_OVERVIEW_TURN_OFF]} />
        </Prose>
      </div>

      <Prose>
        <p>
          For where the data comes from and what it does and does not check, see{" "}
          <TextLink href="/about/">About</TextLink>.
        </p>
      </Prose>
    </DocSection>
  );
}
