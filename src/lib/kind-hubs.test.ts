import { describe, expect, it } from "vitest";
import { countByKind } from "@/lib/catalog";
import { HUB_KINDS, isHubKind, kindHref, kindHubPage } from "@/lib/kind-hubs";
import { PAGE_SEO, STATIC_PAGE_KEYS } from "@/lib/seo/pages";
import { EXTENSION_KINDS } from "@/lib/types";

/** Fewer entries than this makes a kind page too thin to be worth indexing on its own. */
const MIN_HUB_ENTRIES = 5;

describe("kind hubs", () => {
  it("gives every hub kind a static page that the sitemap and llms files list", () => {
    const listedPaths = new Set<string>(STATIC_PAGE_KEYS.map((key) => PAGE_SEO[key].path));
    for (const kind of HUB_KINDS) {
      const page = kindHubPage(kind);
      expect(page, kind).not.toBeNull();
      expect(listedPaths.has(page?.path ?? ""), kind).toBe(true);
      expect(page?.breadcrumbParent?.path, kind).toBe(PAGE_SEO.browse.path);
    }
  });

  it("keeps hub pages for kinds with enough entries to stand on their own", () => {
    const counts = countByKind();
    for (const kind of HUB_KINDS) {
      expect(counts[kind], kind).toBeGreaterThanOrEqual(MIN_HUB_ENTRIES);
    }
  });

  it("sends kinds without a page to the filtered directory", () => {
    for (const kind of EXTENSION_KINDS.filter((candidate) => !isHubKind(candidate))) {
      expect(kindHubPage(kind), kind).toBeNull();
      expect(kindHref(kind)).toBe(`/browse/?kind=${kind}`);
    }
  });

  it("never gives a hub the /hooks/ path, which belongs to the event reference", () => {
    for (const kind of HUB_KINDS) {
      expect(kindHubPage(kind)?.path, kind).not.toBe(PAGE_SEO.hooks.path);
    }
  });
});
