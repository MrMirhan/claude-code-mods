import type { Metadata } from "next";
import type { ReactNode } from "react";
import { KindHubPage } from "@/components/docs/KindHubPage";
import { getAllExtensions } from "@/lib/catalog";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata: Metadata = buildStaticPageMetadata(PAGE_SEO.agentsHub);

export default function AgentsPage(): ReactNode {
  return <KindHubPage kind="agent" extensions={getAllExtensions().filter((extension) => extension.kind === "agent")} />;
}
