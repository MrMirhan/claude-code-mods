import type { ReactNode } from "react";
import { ComparisonTable } from "@/components/docs/ComparisonTable";
import { DocSection, Prose } from "@/components/docs/DocSection";
import { InlineCode } from "@/components/docs/InlineCode";
import { TextLink } from "@/components/docs/TextLink";
import { CopyCommand } from "@/components/ui/CopyCommand";
import { COMMUNITY_REPOSITORY_URL } from "@/lib/site";
import { MARKETPLACE_INFO_ID, MARKETPLACE_NAME, marketplaceAddCommand, pinTreeUrl, type MarketplacePin } from "@/lib/marketplace";
import type { Extension } from "@/lib/types";

export interface MarketplaceSectionProps {
  readonly pins: readonly MarketplacePin[];
  /** Catalog entries, to name each pinned plugin and link its page. */
  readonly extensions: readonly Extension[];
}

const AUTO_UPDATE_DOCS_URL = "https://code.claude.com/docs/en/plugins/install#keep-plugins-updated";

/**
 * The `#marketplace` section: what the site's own plugin marketplace lists, what a pin promises
 * and what it does not. The plugin table is built from the pin file, never written here.
 */
export function MarketplaceSection({ pins, extensions }: MarketplaceSectionProps): ReactNode {
  const bySlug = new Map(extensions.map((extension) => [extension.slug, extension]));
  return (
    <DocSection id={MARKETPLACE_INFO_ID} title="The community marketplace">
      <Prose>
        <p>
          This site serves a Claude Code plugin marketplace named <InlineCode>{MARKETPLACE_NAME}</InlineCode>. It lists
          community plugins from the directory, so you can install them with one command instead of cloning their
          repositories. Anthropic&apos;s own plugins are not in it: install those from Anthropic&apos;s official
          marketplace, as their pages show.
        </p>
      </Prose>
      <CopyCommand command={marketplaceAddCommand()} label="Add the marketplace in a Claude Code session" />
      <Prose>
        <p>
          Each plugin is pinned to one commit by its full SHA, and Claude Code installs exactly that commit, even after
          the author pushes new code. A pin moves only by a pull request to{" "}
          <TextLink href={COMMUNITY_REPOSITORY_URL}>this site&apos;s repository</TextLink>, where the change to{" "}
          <InlineCode>src/data/marketplace.json</InlineCode> is public.
        </p>
        <p>
          Before a pin is set or moved, a maintainer reads the plugin&apos;s source at that commit, looking for network
          calls, the commands it runs and the files it reads or writes. That reading is not an audit and promises
          nothing about safety. A plugin can run code on your machine with your permissions, so make the checks above
          yourself.
        </p>
        <p>
          Claude Code leaves auto-update off for a marketplace like this one unless you turn it on (
          <TextLink href={AUTO_UPDATE_DOCS_URL}>Keep plugins updated</TextLink>). Even with it on, you get new code only
          when a pin moves.
        </p>
        <p>
          An author who does not want their plugin in the marketplace can say so in an issue or a pull request. It is
          then removed from the marketplace and stays listed in the directory.
        </p>
      </Prose>
      <ComparisonTable
        caption="Plugins in the community marketplace"
        columns={["Plugin", "Pinned commit", "Pinned on"]}
        rows={pins.map((pin) => {
          const extension = bySlug.get(pin.slug);
          return {
            id: pin.name,
            header:
              extension === undefined ? (
                pin.name
              ) : (
                <TextLink href={`/extensions/${extension.slug}/`}>{extension.name}</TextLink>
              ),
            cells: [
              <TextLink key="sha" href={pinTreeUrl(pin)}>
                <code>{pin.source.sha.slice(0, 7)}</code>
              </TextLink>,
              <time key="date" dateTime={pin.pinnedAt}>
                {pin.pinnedAt}
              </time>,
            ],
          };
        })}
      />
    </DocSection>
  );
}
