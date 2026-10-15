import { existsSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { getExtensionBySlug } from "@/lib/catalog";
import { sourceOnlyExtension } from "@/components/catalog/__fixtures__/extensions";
import type { Extension } from "@/lib/types";
import { stubIntersectionObserver } from "./__fixtures__/intersection-observer";
import { CommunitySpotlightSection } from "./CommunitySpotlightSection";
import { COMMUNITY_SPOTLIGHT } from "./home-data";

beforeAll(stubIntersectionObserver);

const communityExtension: Extension = {
  ...sourceOnlyExtension,
  kind: "mod",
  hooks: ["session.start", "tool.call", "ui.render", "turn.start"],
};

describe("CommunitySpotlightSection", () => {
  it("renders nothing when the spotlighted entry is not in the catalog", () => {
    const { container } = render(<CommunitySpotlightSection extension={undefined} spotlight={COMMUNITY_SPOTLIGHT} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("reads its copy from the entry and links to the entry's page and source", () => {
    render(<CommunitySpotlightSection extension={communityExtension} spotlight={COMMUNITY_SPOTLIGHT} />);
    expect(screen.getByRole("heading", { name: communityExtension.name })).toBeInTheDocument();
    expect(screen.getByText(communityExtension.summary)).toBeInTheDocument();
    // next/link only applies trailingSlash: true at build time, so jsdom rendering drops it here.
    expect(screen.getByRole("link", { name: `Read about ${communityExtension.name}` })).toHaveAttribute(
      "href",
      `/extensions/${communityExtension.slug}`,
    );
    expect(screen.getByRole("link", { name: /Source on GitHub/ })).toHaveAttribute("href", communityExtension.repositoryUrl);
  });

  it("marks the entry as a community listing and states the disclosure", () => {
    render(<CommunitySpotlightSection extension={communityExtension} spotlight={COMMUNITY_SPOTLIGHT} />);
    expect(screen.getByText("Community listing")).toBeInTheDocument();
    expect(screen.getByText(COMMUNITY_SPOTLIGHT.disclosure)).toBeInTheDocument();
  });

  it("names the first hooks and counts the rest, like the featured rows", () => {
    render(<CommunitySpotlightSection extension={communityExtension} spotlight={COMMUNITY_SPOTLIGHT} />);
    expect(screen.getByText("4 hooks: session.start, tool.call, ui.render +1 more")).toBeInTheDocument();
  });

  it("shows the artwork with its alt text and size, so the layout does not shift", () => {
    render(<CommunitySpotlightSection extension={communityExtension} spotlight={COMMUNITY_SPOTLIGHT} />);
    const image = screen.getByRole("img", { name: COMMUNITY_SPOTLIGHT.imageAlt });
    expect(image).toHaveAttribute("src", COMMUNITY_SPOTLIGHT.imageSrc);
    expect(image).toHaveAttribute("width", String(COMMUNITY_SPOTLIGHT.imageWidth));
    expect(image).toHaveAttribute("height", String(COMMUNITY_SPOTLIGHT.imageHeight));
  });
});

describe("COMMUNITY_SPOTLIGHT", () => {
  it("names an entry that is in the real catalog, so the home page never loses the section silently", () => {
    expect(getExtensionBySlug(COMMUNITY_SPOTLIGHT.slug)).toBeDefined();
  });

  it("points at an image that exists in public/", () => {
    expect(existsSync(path.join(process.cwd(), "public", COMMUNITY_SPOTLIGHT.imageSrc))).toBe(true);
  });
});
