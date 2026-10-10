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
  ALLOW_MANAGED_MODS_ONLY_JSON,
  GUARD_CONFIG_ID,
  GUARD_LOAD_FACTS,
  GUARD_OPTIONS,
  MODS_ADMIN,
  MODS_ADMIN_DEFAULTS,
  MODS_ADMIN_GUARD_OPTIONS,
  MODS_ADMIN_ORG_MODS,
  MODS_ADMIN_POLICIES,
  ORG_MODS_NOTE,
  ORG_ORDER_NOTE,
  ORG_POLICIES,
  ORG_PRECEDENCE,
} from "@/components/docs/securityContent";

const SUBHEADING_CLASS = "text-xl font-semibold tracking-tight text-fg";

/**
 * The `#for-organizations` section: a short summary of Anthropic's "Manage mods for your organization"
 * page that links out for the detail. Every string comes from securityContent.ts.
 */
export function ForOrganizationsSection(): ReactNode {
  return (
    <DocSection id="for-organizations" title="For organizations">
      <Prose>
        <p>
          If you deploy managed settings for Claude Code, you decide whether mods run on your users&apos; machines,
          which ones, and in what order. Mods are on by default. This is a summary: the{" "}
          <TextLink href={MODS_ADMIN.href}>Manage mods for your organization</TextLink> page has the full detail and
          the settings to read before you deploy them.
        </p>
      </Prose>

      <div id="org-policies" className="flex flex-col gap-6">
        <h3 className={SUBHEADING_CLASS}>Choose a policy</h3>
        <ComparisonTable
          caption="Mod policies and the managed settings for each"
          columns={["What you want", "Settings"]}
          rows={ORG_POLICIES.map((policy) => ({ id: policy.id, header: policy.want, cells: [policy.settings] }))}
        />
        <Prose>
          <p>
            To keep every mod your users bring from running its hooks, set <InlineCode>allowManagedModsOnly</InlineCode>{" "}
            on the built-in guard in managed settings:
          </p>
        </Prose>
        <CodeBlock code={ALLOW_MANAGED_MODS_ONLY_JSON} filename="managed-settings.json" />
        <Prose>
          <p>
            <InlineCode>allowManagedHooksOnly</InlineCode> reaches further and also blocks hooks in users&apos; own
            settings files. <InlineCode>disableSideloadFlags</InlineCode> rejects <InlineCode>--plugin-dir</InlineCode>{" "}
            and <InlineCode>--plugin-url</InlineCode> at startup, along with <InlineCode>--agents</InlineCode> and{" "}
            <InlineCode>--mcp-config</InlineCode>, and keeps mods Claude writes during a session from
            loading. Built-in mods keep running under these settings.
          </p>
          <SourceLine sources={[MODS_ADMIN_POLICIES]} />
        </Prose>
      </div>

      <div id="org-guard" className="flex flex-col gap-6 pt-4">
        <h3 className={SUBHEADING_CLASS}>The built-in guard</h3>
        <Prose>
          <p>
            The guard is a built-in policy mod that Claude Code loads ahead of every mod a user installs. Its options go
            in managed settings under <InlineCode>pluginConfigs</InlineCode>, keyed by{" "}
            <InlineCode>{GUARD_CONFIG_ID}</InlineCode>.
          </p>
        </Prose>
        <ComparisonTable
          caption="Built-in guard options, unset and set to true"
          columns={["Option", "Unset", "true"]}
          rows={GUARD_OPTIONS.map((option) => ({
            id: option.name,
            header: <InlineCode>{option.name}</InlineCode>,
            cells: [option.unset, option.enabled],
          }))}
        />
        <DefinitionList items={GUARD_LOAD_FACTS} />
        <SourceLine sources={[MODS_ADMIN_DEFAULTS, MODS_ADMIN_GUARD_OPTIONS]} />
      </div>

      <div id="org-precedence" className="flex flex-col gap-6 pt-4">
        <h3 className={SUBHEADING_CLASS}>What still takes precedence</h3>
        <DefinitionList items={ORG_PRECEDENCE} />
        <Callout tone="warning">
          <p>
            None of these controls sandboxes a mod. A mod you allow runs as the user, with the user&apos;s access to
            files, processes and the network.
          </p>
        </Callout>
        <SourceLine sources={[MODS_ADMIN_DEFAULTS]} />
      </div>

      <div id="org-own-mods" className="flex flex-col gap-6 pt-4">
        <h3 className={SUBHEADING_CLASS}>Your organization&apos;s own mods</h3>
        <Prose>
          <p>{ORG_MODS_NOTE}</p>
          <p>{ORG_ORDER_NOTE}</p>
          <SourceLine sources={[MODS_ADMIN_ORG_MODS, MODS_ADMIN]} />
        </Prose>
      </div>
    </DocSection>
  );
}
