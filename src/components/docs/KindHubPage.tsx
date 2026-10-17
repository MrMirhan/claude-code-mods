import type { ReactNode } from "react";
import { ExtensionCard } from "@/components/catalog/ExtensionCard";
import { toListItem } from "@/components/catalog/ExtensionListItem";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocPage } from "@/components/docs/DocPage";
import { DocSection, Prose } from "@/components/docs/DocSection";
import { TextLink } from "@/components/docs/TextLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { HUB_KINDS, kindHubPage, type HubKind } from "@/lib/kind-hubs";
import { buildCollectionGraph } from "@/lib/seo/jsonLd";
import { indefiniteArticle, lowerCaseLabel } from "@/lib/seo/text";
import type { Extension } from "@/lib/types";
import { KIND_HUB_CONTENT } from "./kindHubContent";

export interface KindHubPageProps {
  readonly kind: HubKind;
  /** Every catalog entry of this kind, in catalog order. Passed in so the component stays pure. */
  readonly extensions: readonly Extension[];
}

/**
 * Landing page for one kind (`/mods/`, `/plugins/` and so on): what the kind is, every entry of
 * that kind as a server-rendered card, how you get one, and links to the other kinds. Unlike a
 * `/browse/?kind=` filter, it is its own indexable page with its own title and canonical URL.
 */
export function KindHubPage({ kind, extensions }: KindHubPageProps): ReactNode {
  const page = kindHubPage(kind);
  if (page === null) throw new Error(`no landing page for kind ${kind}`);
  const content = KIND_HUB_CONTENT[kind];
  const otherKinds = HUB_KINDS.filter((other) => other !== kind);

  return (
    <DocPage title={content.heading} description={content.lead}>
      <JsonLd data={buildCollectionGraph(page, extensions)} />

      <DocSection id="what" title={`What is ${indefiniteLabel(content.singular)}?`}>
        <Prose>
          {content.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>
            Read more in the <TextLink href={content.docsUrl}>{content.docsLabel}</TextLink>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="listings" title={`${content.heading} in the directory (${extensions.length})`}>
        {extensions.length === 0 ? (
          <Prose>
            <p>Nothing of this kind is listed yet.</p>
          </Prose>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {extensions.map((extension) => (
              <li key={extension.slug}>
                <ExtensionCard extension={toListItem(extension)} />
              </li>
            ))}
          </ul>
        )}
        <Prose>
          <p>
            To search these or narrow them by category,{" "}
            <TextLink href={`/browse/?kind=${encodeURIComponent(kind)}`}>open them in the directory</TextLink>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="get" title="How you get one">
        <Prose>
          {content.gettingIt.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>
            Before you install anything, read <TextLink href="/security/">what the directory checks and what it does not</TextLink>.
          </p>
        </Prose>
        <CodeBlock code={content.commandShapes.join("\n")} label="Command shape, with placeholders in angle brackets" />
      </DocSection>

      <DocSection id="other-kinds" title="Other kinds">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-base">
          {otherKinds.map((other) => {
            const otherPage = kindHubPage(other);
            return otherPage === null ? null : (
              <li key={other}>
                <TextLink href={otherPage.path}>{KIND_HUB_CONTENT[other].heading}</TextLink>
              </li>
            );
          })}
          <li>
            <TextLink href="/browse/">The whole directory</TextLink>
          </li>
        </ul>
      </DocSection>
    </DocPage>
  );
}

/** "a mod", "an MCP server": the term after its article, lower-cased unless it is an acronym. */
function indefiniteLabel(label: string): string {
  const phrase = lowerCaseLabel(label);
  return `${indefiniteArticle(phrase)} ${phrase}`;
}
