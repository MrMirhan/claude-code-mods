import { z } from "zod";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Extension } from "@/lib/types";

/**
 * The site's Claude Code plugin marketplace, served at `/marketplace.json`.
 *
 * It lists only community plugins, each pinned to one commit. Claude Code installs exactly that
 * commit, so a user gets new code only after a maintainer moves the pin in a reviewed pull request.
 * Pins live in `src/data/marketplace.json`, a maintainer file apart from the contributors'
 * community files, so a listing can never add itself to the marketplace.
 *
 * Docs: https://code.claude.com/docs/en/plugins/marketplace-reference
 */

export const MARKETPLACE_PATH = "/marketplace.json";
/** What users type after `@`. Not a reserved name, and it names this site rather than Anthropic. */
export const MARKETPLACE_NAME = "claudecodemods";
/** Where the site explains the marketplace: a section of the Security page. */
export const MARKETPLACE_INFO_ID = "marketplace";
export const MARKETPLACE_INFO_PATH = `/security/#${MARKETPLACE_INFO_ID}`;
export const MARKETPLACE_CONTENT_TYPE = "application/json; charset=utf-8";
export const MARKETPLACE_DESCRIPTION =
  "Community Claude Code plugins listed on claudecodemods.com, each pinned to one commit. Unofficial and not affiliated with Anthropic. Read a plugin's source before you install it.";

/** The marketplace rules for plugin names: letters, digits, `.`, `_` and `-`, starting with a letter or digit, no `..`. */
const pluginName = z
  .string()
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/)
  .refine((name) => !name.includes(".."), "must not contain ..");
const commitSha = z.string().regex(/^[0-9a-f]{40}$/, "expected a full 40-character lowercase commit SHA");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

const githubSource = z.object({
  source: z.literal("github"),
  repo: z.string().regex(/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/, "expected owner/repo"),
  sha: commitSha,
});
const gitSubdirSource = z.object({
  source: z.literal("git-subdir"),
  url: z.string().regex(/^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+\.git$/, "expected https://github.com/owner/repo.git"),
  path: z
    .string()
    .regex(/^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/, "expected a relative path")
    .refine((value) => !value.split("/").includes(".."), "must not contain .."),
  sha: commitSha,
});

export const marketplacePinSchema = z.object({
  /** The catalog entry this plugin is listed as. */
  slug: z.string().min(1),
  /** The plugin's name in the marketplace: what users type before `@`. */
  name: pluginName,
  source: z.discriminatedUnion("source", [githubSource, gitSubdirSource]),
  /** When the pin was last set. */
  pinnedAt: isoDate,
});
export type MarketplacePin = z.infer<typeof marketplacePinSchema>;
export type MarketplaceSource = MarketplacePin["source"];

export const marketplaceFileSchema = z.object({
  version: z.literal(1),
  plugins: z.array(marketplacePinSchema),
});

/** A plugin entry as the marketplace file writes it. Only documented entry fields are used. */
export interface MarketplacePluginEntry {
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly source: MarketplaceSource;
  readonly author: { readonly name: string; readonly url?: string };
  readonly repository: string;
  readonly license?: string;
  readonly category: string;
  readonly keywords: readonly string[];
}

export interface MarketplaceDocument {
  readonly name: string;
  readonly owner: { readonly name: string; readonly url: string };
  readonly description: string;
  readonly plugins: readonly MarketplacePluginEntry[];
}

/** `owner/repo` and the folder inside it, read from a GitHub `repositoryUrl` such as `.../tree/main/plugins/x`. */
export function parseGithubRepositoryUrl(url: string): { readonly repo: string; readonly path: string | null } | null {
  const match = /^https:\/\/github\.com\/([A-Za-z0-9-]+\/[A-Za-z0-9._-]+?)(?:\.git)?(?:\/tree\/[^/]+\/(.+?))?\/?$/.exec(url);
  if (match === null) return null;
  return { repo: match[1], path: match[2] ?? null };
}

/** The repository a pin installs from, as `owner/repo`, and the folder inside it (null for the root). */
function pinnedLocation(source: MarketplaceSource): { readonly repo: string; readonly path: string | null } {
  if (source.source === "github") return { repo: source.repo, path: null };
  return { repo: source.url.replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, ""), path: source.path };
}

/**
 * Every reason the pins cannot be published, as readable messages; empty when they are fine. A pin
 * must name a community entry, and must install from the exact repository and folder that the
 * entry's `repositoryUrl` shows readers, so the marketplace can never install code from somewhere
 * the directory page does not point to.
 */
export function findPinProblems(pins: readonly MarketplacePin[], extensions: readonly Extension[]): readonly string[] {
  const problems: string[] = [];
  const bySlug = new Map(extensions.map((extension) => [extension.slug, extension]));
  const seenNames = new Set<string>();
  const seenSlugs = new Set<string>();
  for (const pin of pins) {
    const label = `marketplace pin "${pin.name}"`;
    if (seenNames.has(pin.name.toLowerCase())) problems.push(`${label}: duplicate plugin name`);
    seenNames.add(pin.name.toLowerCase());
    if (seenSlugs.has(pin.slug)) problems.push(`${label}: slug ${pin.slug} is pinned twice`);
    seenSlugs.add(pin.slug);

    const extension = bySlug.get(pin.slug);
    if (extension === undefined) {
      problems.push(`${label}: no catalog entry has slug ${pin.slug}`);
      continue;
    }
    if (extension.publisher.kind !== "community") {
      problems.push(`${label}: ${pin.slug} is not a community entry; the marketplace lists community plugins only`);
    }
    const listed = parseGithubRepositoryUrl(extension.repositoryUrl);
    const pinned = pinnedLocation(pin.source);
    if (listed === null) {
      problems.push(`${label}: ${pin.slug}'s repositoryUrl is not a GitHub repository URL`);
    } else if (listed.repo.toLowerCase() !== pinned.repo.toLowerCase() || listed.path !== pinned.path) {
      problems.push(
        `${label}: installs from ${pinned.repo}${pinned.path === null ? "" : `/${pinned.path}`}, ` +
          `but ${pin.slug}'s page points to ${listed.repo}${listed.path === null ? "" : `/${listed.path}`}`,
      );
    }
  }
  return problems;
}

/** The two commands that install a pinned plugin: add the marketplace, then install from it. */
export function marketplaceInstallCommands(pin: Pick<MarketplacePin, "name">, siteUrl: string = SITE_URL): readonly string[] {
  return [marketplaceAddCommand(siteUrl), `/plugin install ${pin.name}@${MARKETPLACE_NAME}`];
}

export function marketplaceAddCommand(siteUrl: string = SITE_URL): string {
  return `/plugin marketplace add ${siteUrl}${MARKETPLACE_PATH}`;
}

/** The pinned commit's tree on GitHub, at the plugin's own folder, so a reader sees exactly what installs. */
export function pinTreeUrl(pin: Pick<MarketplacePin, "source">): string {
  const { repo, path } = pinnedLocation(pin.source);
  return `https://github.com/${repo}/tree/${pin.source.sha}${path === null ? "" : `/${path}`}`;
}

/**
 * The marketplace document. Pure: the route serializes it, tests read it as an object. Display
 * fields come from the catalog entry, because Claude Code shows only the entry's own fields until a
 * plugin from a non-relative source is installed.
 * @throws Error listing every problem when a pin is invalid, so a bad pin fails the build.
 */
export function buildMarketplace(
  pins: readonly MarketplacePin[],
  extensions: readonly Extension[],
  siteUrl: string = SITE_URL,
): MarketplaceDocument {
  const problems = findPinProblems(pins, extensions);
  if (problems.length > 0) throw new Error(`Invalid marketplace pins:\n${problems.join("\n")}`);
  const bySlug = new Map(extensions.map((extension) => [extension.slug, extension]));
  return {
    name: MARKETPLACE_NAME,
    owner: { name: SITE_NAME, url: siteUrl },
    description: MARKETPLACE_DESCRIPTION,
    plugins: pins.map((pin) => {
      // findPinProblems has checked that every slug exists.
      const extension = bySlug.get(pin.slug) as Extension;
      const { repo } = pinnedLocation(pin.source);
      return {
        name: pin.name,
        displayName: extension.name,
        description: extension.summary,
        source: pin.source,
        author: {
          name: extension.publisher.name,
          ...(extension.publisher.url === null ? {} : { url: extension.publisher.url }),
        },
        repository: `https://github.com/${repo}`,
        ...(extension.license === null ? {} : { license: extension.license }),
        category: extension.kind,
        keywords: [...extension.tags],
      };
    }),
  };
}
