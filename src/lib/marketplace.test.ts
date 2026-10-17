import { describe, expect, it } from "vitest";
import { sourceOnlyExtension } from "@/components/catalog/__fixtures__/extensions";
import { getAllExtensions } from "@/lib/catalog";
import {
  MARKETPLACE_NAME,
  buildMarketplace,
  findPinProblems,
  marketplaceFileSchema,
  marketplaceInstallCommands,
  parseGithubRepositoryUrl,
  pinTreeUrl,
  type MarketplacePin,
} from "@/lib/marketplace";
import { getMarketplacePins } from "@/lib/marketplace-data";
import type { Extension } from "@/lib/types";

const SHA = "0123456789abcdef0123456789abcdef01234567";

function communityEntry(overrides: Partial<Extension> = {}): Extension {
  return {
    ...sourceOnlyExtension,
    slug: "fixture-mod",
    name: "Fixture Mod",
    repositoryUrl: "https://github.com/fixture-org/fixture-mod",
    publisher: { name: "fixture-org", url: "https://github.com/fixture-org", kind: "community" },
    license: "MIT",
    tags: ["one", "two"],
    ...overrides,
  };
}

const rootPin: MarketplacePin = {
  slug: "fixture-mod",
  name: "fixture-mod",
  source: { source: "github", repo: "fixture-org/fixture-mod", sha: SHA },
  pinnedAt: "2026-10-17",
};

describe("parseGithubRepositoryUrl", () => {
  it("reads owner/repo and an optional folder", () => {
    expect(parseGithubRepositoryUrl("https://github.com/a/b")).toEqual({ repo: "a/b", path: null });
    expect(parseGithubRepositoryUrl("https://github.com/a/b.git")).toEqual({ repo: "a/b", path: null });
    expect(parseGithubRepositoryUrl("https://github.com/a/b/tree/main/plugins/x")).toEqual({ repo: "a/b", path: "plugins/x" });
    expect(parseGithubRepositoryUrl("https://gitlab.com/a/b")).toBeNull();
  });
});

describe("findPinProblems", () => {
  it("accepts a community pin that installs from the repository its page shows", () => {
    expect(findPinProblems([rootPin], [communityEntry()])).toEqual([]);
  });

  it("accepts a git-subdir pin at the folder its page shows", () => {
    const entry = communityEntry({ repositoryUrl: "https://github.com/fixture-org/mono/tree/main/plugins/fixture-mod" });
    const pin: MarketplacePin = {
      ...rootPin,
      source: { source: "git-subdir", url: "https://github.com/fixture-org/mono.git", path: "plugins/fixture-mod", sha: SHA },
    };
    expect(findPinProblems([pin], [entry])).toEqual([]);
  });

  it("refuses a pin whose repository or folder differs from the page's source", () => {
    const otherRepo: MarketplacePin = { ...rootPin, source: { source: "github", repo: "attacker/fixture-mod", sha: SHA } };
    expect(findPinProblems([otherRepo], [communityEntry()]).join()).toMatch(/installs from attacker\/fixture-mod/);
    const entry = communityEntry({ repositoryUrl: "https://github.com/fixture-org/mono/tree/main/plugins/fixture-mod" });
    const otherFolder: MarketplacePin = {
      ...rootPin,
      source: { source: "git-subdir", url: "https://github.com/fixture-org/mono.git", path: "plugins/other", sha: SHA },
    };
    expect(findPinProblems([otherFolder], [entry])).toHaveLength(1);
  });

  it("refuses entries that are not community listings, unknown slugs and duplicates", () => {
    const anthropic = communityEntry({ publisher: { name: "Anthropic", url: "https://github.com/anthropics", kind: "anthropic" } });
    expect(findPinProblems([rootPin], [anthropic]).join()).toMatch(/community plugins only/);
    expect(findPinProblems([{ ...rootPin, slug: "missing" }], [communityEntry()]).join()).toMatch(/no catalog entry/);
    expect(findPinProblems([rootPin, rootPin], [communityEntry()]).join()).toMatch(/duplicate plugin name/);
  });
});

describe("marketplaceFileSchema", () => {
  it("requires a full lowercase SHA and refuses .. in names and paths", () => {
    const parse = (pin: unknown) => marketplaceFileSchema.safeParse({ version: 1, plugins: [pin] }).success;
    expect(parse(rootPin)).toBe(true);
    expect(parse({ ...rootPin, source: { ...rootPin.source, sha: "abc123" } })).toBe(false);
    expect(parse({ ...rootPin, source: { ...rootPin.source, sha: SHA.toUpperCase() } })).toBe(false);
    expect(parse({ ...rootPin, name: "a..b" })).toBe(false);
    expect(
      parse({ ...rootPin, source: { source: "git-subdir", url: "https://github.com/a/b.git", path: "../x", sha: SHA } }),
    ).toBe(false);
    expect(parse({ ...rootPin, source: { source: "url", url: "https://example.com/x.git", sha: SHA } })).toBe(false);
    expect(parse({ ...rootPin, source: { source: "github", repo: "owner/..", sha: SHA } })).toBe(false);
    const subdir = (url: string, path: string) => ({ ...rootPin, source: { source: "git-subdir", url, path, sha: SHA } });
    expect(parse(subdir("https://github.com/a/...git", "x"))).toBe(false);
    expect(parse(subdir("https://github.com/a/b.git", "./x"))).toBe(false);
    expect(parse(subdir("https://github.com/a/b.git", "x/./y"))).toBe(false);
    expect(parse(subdir("https://github.com/a/b.git", "plugins/x"))).toBe(true);
  });
});

describe("buildMarketplace", () => {
  it("writes the documented fields, display text from the catalog, and the pinned source unchanged", () => {
    const document = buildMarketplace([rootPin], [communityEntry()], "https://example.org");
    expect(document.name).toBe(MARKETPLACE_NAME);
    expect(document.owner).toEqual({ name: "Claude Code Mods", url: "https://example.org" });
    expect(document).not.toHaveProperty("$schema");
    expect(document.plugins).toEqual([
      {
        name: "fixture-mod",
        displayName: "Fixture Mod",
        description: communityEntry().summary,
        source: rootPin.source,
        author: { name: "fixture-org", url: "https://github.com/fixture-org" },
        repository: "https://github.com/fixture-org/fixture-mod",
        license: "MIT",
        category: "skill",
        keywords: ["one", "two"],
      },
    ]);
  });

  it("throws on an invalid pin so a bad pin fails the build", () => {
    expect(() => buildMarketplace([{ ...rootPin, slug: "missing" }], [communityEntry()])).toThrow(/Invalid marketplace pins/);
  });

  it("builds from the real pin file and catalog", () => {
    const document = buildMarketplace(getMarketplacePins(), getAllExtensions());
    expect(document.plugins.length).toBeGreaterThan(0);
    for (const plugin of document.plugins) {
      expect(plugin.source.sha, plugin.name).toMatch(/^[0-9a-f]{40}$/);
    }
  });
});

describe("install commands and links", () => {
  it("adds the marketplace by URL, then installs name@marketplace", () => {
    expect(marketplaceInstallCommands(rootPin, "https://example.org")).toEqual([
      "/plugin marketplace add https://example.org/marketplace.json",
      `/plugin install fixture-mod@${MARKETPLACE_NAME}`,
    ]);
  });

  it("links the pinned commit's tree at the plugin folder", () => {
    expect(pinTreeUrl(rootPin)).toBe(`https://github.com/fixture-org/fixture-mod/tree/${SHA}`);
    expect(
      pinTreeUrl({ source: { source: "git-subdir", url: "https://github.com/a/b.git", path: "plugins/x", sha: SHA } }),
    ).toBe(`https://github.com/a/b/tree/${SHA}/plugins/x`);
  });
});
