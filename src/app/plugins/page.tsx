import type { Metadata } from "next";
import type { ReactNode } from "react";
import { KindHubPage } from "@/components/docs/KindHubPage";
import { getAllExtensions } from "@/lib/catalog";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata: Metadata = buildStaticPageMetadata(PAGE_SEO.pluginsHub);

export default function PluginsPage(): ReactNode {
  return <KindHubPage kind="plugin" extensions={getAllExtensions().filter((extension) => extension.kind === "plugin")} />;
}
