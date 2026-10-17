import type { ExtensionKind } from "@/lib/types";
import { PAGE_SEO, type PageSeo } from "@/lib/seo/pages";

/**
 * Kinds that have their own landing page (`/mods/`, `/plugins/` and so on). Hooks and commands have
 * only three entries each, too few for a page of their own, so they stay as browse filters. A hook
 * hub would also collide with `/hooks/`, the event reference.
 */
export const HUB_KINDS = ["mod", "plugin", "skill", "agent", "mcp-server"] as const satisfies readonly ExtensionKind[];
export type HubKind = (typeof HUB_KINDS)[number];

const HUB_PAGES: Readonly<Record<HubKind, PageSeo>> = {
  mod: PAGE_SEO.modsHub,
  plugin: PAGE_SEO.pluginsHub,
  skill: PAGE_SEO.skillsHub,
  agent: PAGE_SEO.agentsHub,
  "mcp-server": PAGE_SEO.mcpServersHub,
};

export function isHubKind(kind: ExtensionKind): kind is HubKind {
  return (HUB_KINDS as readonly ExtensionKind[]).includes(kind);
}

/** The landing page for `kind`, or null for a kind that has none. */
export function kindHubPage(kind: ExtensionKind): PageSeo | null {
  return isHubKind(kind) ? HUB_PAGES[kind] : null;
}

/** Where a link about one kind should go: its landing page when it has one, else the filtered directory. */
export function kindHref(kind: ExtensionKind): string {
  return kindHubPage(kind)?.path ?? `/browse/?kind=${encodeURIComponent(kind)}`;
}
