import { getAllExtensions } from "@/lib/catalog";
import { MARKETPLACE_CONTENT_TYPE, buildMarketplace } from "@/lib/marketplace";
import { getMarketplacePins } from "@/lib/marketplace-data";

// Required for `output: "export"`: rendered once at build time and served as a static file.
export const dynamic = "force-static";

export function GET(): Response {
  const marketplace = buildMarketplace(getMarketplacePins(), getAllExtensions());
  return new Response(JSON.stringify(marketplace, null, 2), { headers: { "Content-Type": MARKETPLACE_CONTENT_TYPE } });
}
