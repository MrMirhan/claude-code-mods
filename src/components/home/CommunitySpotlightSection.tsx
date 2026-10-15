import { ArrowRight, GithubLogo } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { CommunityBadge } from "@/components/catalog/CommunityBadge";
import { extensionHref } from "@/components/catalog/ExtensionCard";
import { KindIcon } from "@/components/catalog/KindIcon";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { KIND_LABELS } from "@/lib/types";
import type { Extension } from "@/lib/types";
import type { CommunitySpotlight } from "./home-data";
import { summarizeHooks } from "./home-data";

export interface CommunitySpotlightSectionProps {
  /** The catalog entry for `spotlight.slug`, or undefined when it is no longer listed. */
  readonly extension: Extension | undefined;
  readonly spotlight: CommunitySpotlight;
}

/**
 * One community entry, shown large: its artwork, name, summary and the events it hooks, with a
 * link to its page and its source. All copy except the disclosure comes from the catalog entry, so
 * the section can never drift from the listing. It renders nothing when the entry is gone.
 */
export function CommunitySpotlightSection({ extension, spotlight }: CommunitySpotlightSectionProps): ReactNode {
  if (extension === undefined) return null;
  const { slug, name, kind, summary, publisher, repositoryUrl } = extension;
  const hooks = summarizeHooks(extension.hooks);

  return (
    <section aria-label="Community spotlight" className="border-t border-border">
      <Container className="flex flex-col gap-10 py-16 md:py-20">
        <SectionHeading
          eyebrow="Community spotlight"
          title={name}
          body="A mod from the community, picked by the maintainers to show what a mod can draw inside Claude Code."
        />
        <Reveal>
          <div className="grid items-center gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
            <div className="overflow-hidden rounded-panel border border-border-strong bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export with unoptimized images; pixel art must not be resampled */}
              <img
                src={spotlight.imageSrc}
                alt={spotlight.imageAlt}
                width={spotlight.imageWidth}
                height={spotlight.imageHeight}
                loading="lazy"
                className="block h-auto w-full [image-rendering:pixelated]"
              />
            </div>
            <div className="flex flex-col items-start gap-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <p className="flex items-center gap-1.5 font-mono text-xs text-fg-muted">
                  <KindIcon kind={kind} size={14} />
                  {KIND_LABELS[kind]}
                </p>
                <CommunityBadge publisher={publisher} />
              </div>
              <p className="text-lg leading-relaxed text-fg">{summary}</p>
              {hooks !== null ? (
                <p className="font-mono text-xs text-fg-muted">
                  {`${hooks.countLabel}: ${hooks.shown.join(", ")}${hooks.hiddenCount > 0 ? ` +${hooks.hiddenCount} more` : ""}`}
                </p>
              ) : null}
              <p className="text-sm text-fg-muted">{spotlight.disclosure}</p>
              <div className="flex flex-wrap gap-3">
                <Button href={extensionHref(slug)} iconRight={<ArrowRight size={18} weight="regular" aria-hidden="true" />}>
                  {`Read about ${name}`}
                </Button>
                <Button
                  href={repositoryUrl}
                  variant="secondary"
                  iconLeft={<GithubLogo size={18} weight="regular" aria-hidden="true" />}
                >
                  Source on GitHub
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
