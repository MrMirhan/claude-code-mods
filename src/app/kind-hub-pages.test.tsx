import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeAll, describe, expect, it } from "vitest";
import { stubIntersectionObserver } from "@/components/docs/testSupport";
import { getAllExtensions } from "@/lib/catalog";
import { kindHubPage, type HubKind } from "@/lib/kind-hubs";
import { SITE_URL } from "@/lib/site";
import AgentsPage, { metadata as agentsMetadata } from "./agents/page";
import McpServersPage, { metadata as mcpServersMetadata } from "./mcp-servers/page";
import ModsPage, { metadata as modsMetadata } from "./mods/page";
import PluginsPage, { metadata as pluginsMetadata } from "./plugins/page";
import SkillsPage, { metadata as skillsMetadata } from "./skills/page";

beforeAll(stubIntersectionObserver);

const ROUTES: readonly { kind: HubKind; Page: () => ReactNode; metadata: typeof modsMetadata }[] = [
  { kind: "mod", Page: ModsPage, metadata: modsMetadata },
  { kind: "plugin", Page: PluginsPage, metadata: pluginsMetadata },
  { kind: "skill", Page: SkillsPage, metadata: skillsMetadata },
  { kind: "agent", Page: AgentsPage, metadata: agentsMetadata },
  { kind: "mcp-server", Page: McpServersPage, metadata: mcpServersMetadata },
];

describe("kind hub routes", () => {
  it.each(ROUTES)("$kind: metadata names its own page and the page lists exactly that kind", ({ kind, Page, metadata }) => {
    const page = kindHubPage(kind);
    expect(metadata.title).toBe(page?.title);
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}${page?.path}`);

    const { container } = render(<Page />);
    const expected = getAllExtensions().filter((extension) => extension.kind === kind);
    expect(container.querySelectorAll("#listings > ul > li")).toHaveLength(expected.length);
    for (const extension of expected) {
      expect(screen.getAllByRole("link", { name: extension.name }).length).toBeGreaterThan(0);
    }
  });
});
