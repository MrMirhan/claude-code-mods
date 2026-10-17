import type { ReactNode } from "react";
import { InlineLink } from "./InlineLink";
import { CopyCommand } from "@/components/ui/CopyCommand";
import { cn } from "@/lib/cn";
import type { Extension } from "@/lib/types";
import { DetailCallout } from "./DetailCallout";

/** How to install an entry from this site's own marketplace, pre-resolved by the page from its pin. */
export interface MarketplaceInstall {
  readonly commands: readonly string[];
  /** The pinned commit's full SHA. */
  readonly sha: string;
  /** The pinned commit's tree on GitHub, so a reader can read exactly what installs. */
  readonly treeUrl: string;
  readonly pinnedAt: string;
}

export interface InstallSectionProps {
  readonly extension: Pick<Extension, "availability" | "installCommands">;
  /** Set when the entry is in the site's marketplace. */
  readonly marketplaceInstall?: MarketplaceInstall | null;
}

/** Length of the commit id shown in text; the link carries the full SHA. */
const SHORT_SHA_LENGTH = 7;

/** Source-only copy. A mod guide may still give clone, load or local marketplace steps, so this never says there are none. */
export const NO_INSTALL_COMMAND = "No one-step install command is listed. See the source repository, and any setup steps on this page.";
/** Defines the availability label. Caveats such as a minimum version come from the entry's own notice, shown above. */
export const BUILT_IN_EXPLANATION = "Built in. This ships inside Claude Code. Its source is published so you can read it.";

/**
 * What "getting it" means depends on availability. Install commands come only from the catalog
 * entry, and built-in or source-only entries get a plain statement instead of an empty box,
 * because an empty block reads as a rendering bug.
 */
export function InstallSection({ extension, marketplaceInstall = null }: InstallSectionProps): ReactNode {
  const { availability, installCommands } = extension;
  const isInstallable = availability === "installable" && installCommands.length > 0;
  if (marketplaceInstall !== null && !isInstallable) return <MarketplaceInstallPanel install={marketplaceInstall} />;

  return (
    <section
      aria-labelledby="install-heading"
      // The panel only frames real commands; the callout below carries its own border.
      className={cn("flex flex-col gap-4", isInstallable && "rounded-panel border border-border bg-surface p-5")}
    >
      <h2 id="install-heading" className="text-lg font-semibold tracking-tight text-fg">
        Install
      </h2>
      {isInstallable ? (
        <>
          <div className="flex flex-col gap-3">
            {installCommands.map((command) => (
              <CopyCommand key={command} command={command} />
            ))}
          </div>
          <p className="text-sm leading-relaxed text-fg-muted">
            Read the source before you run these.{" "}
            <InlineLink href="/security/#before-you-install">What to check first</InlineLink>
          </p>
        </>
      ) : (
        <DetailCallout tone="note">
          <p>{availability === "built-in" ? BUILT_IN_EXPLANATION : NO_INSTALL_COMMAND}</p>
        </DetailCallout>
      )}
    </section>
  );
}

/**
 * Install from the site's marketplace. The text names the exact commit that installs, because the
 * pin is the whole promise: the same code until a maintainer moves it. It says nothing about review.
 */
function MarketplaceInstallPanel({ install }: { readonly install: MarketplaceInstall }): ReactNode {
  return (
    <section aria-labelledby="install-heading" className="flex flex-col gap-4 rounded-panel border border-border bg-surface p-5">
      <h2 id="install-heading" className="text-lg font-semibold tracking-tight text-fg">
        Install
      </h2>
      <div className="flex flex-col gap-3">
        {install.commands.map((command) => (
          <CopyCommand key={command} command={command} />
        ))}
      </div>
      <p className="text-sm leading-relaxed text-fg-muted">
        From this site&apos;s community marketplace, pinned on <time dateTime={install.pinnedAt}>{install.pinnedAt}</time> to
        commit <InlineLink href={install.treeUrl}>{install.sha.slice(0, SHORT_SHA_LENGTH)}</InlineLink>. You get that
        commit until the pin is moved. Read the source before you install it.{" "}
        <InlineLink href="/security/#before-you-install">What to check first</InlineLink>
      </p>
    </section>
  );
}
