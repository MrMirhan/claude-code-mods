import type { Metadata } from "next";
import type { ReactNode } from "react";
import { KindHubPage } from "@/components/docs/KindHubPage";
import { getAllExtensions } from "@/lib/catalog";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata: Metadata = buildStaticPageMetadata(PAGE_SEO.mcpServersHub);

export default function McpServersPage(): ReactNode {
  return <KindHubPage kind="mcp-server" extensions={getAllExtensions().filter((extension) => extension.kind === "mcp-server")} />;
}
