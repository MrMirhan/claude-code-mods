import path from "node:path";
import { getAllExtensions } from "@/lib/catalog";
import { defaultDataDirectory, displayPath, formatIssues, readJsonFile } from "@/lib/data-files";
import { findPinProblems, marketplaceFileSchema, type MarketplacePin } from "@/lib/marketplace";
import type { Extension } from "@/lib/types";

/** Maintainer-owned pins for `/marketplace.json`. Server only: it reads files (see `data-files.ts`). */
export const MARKETPLACE_FILE_NAME = "marketplace.json";

/**
 * Reads and validates the pins in `dataDirectory`, checked against `extensions`.
 * @throws Error naming the file and every problem when the pins are invalid.
 */
export function loadMarketplacePins(dataDirectory: string, extensions: readonly Extension[]): readonly MarketplacePin[] {
  const filePath = path.join(dataDirectory, MARKETPLACE_FILE_NAME);
  const result = marketplaceFileSchema.safeParse(readJsonFile(filePath));
  if (!result.success) throw new Error(`${displayPath(filePath)}: invalid marketplace file\n${formatIssues(result.error.issues)}`);
  const problems = findPinProblems(result.data.plugins, extensions);
  if (problems.length > 0) throw new Error(`${displayPath(filePath)}:\n    ${problems.join("\n    ")}`);
  return result.data.plugins;
}

let cachedPins: readonly MarketplacePin[] | undefined;

export function getMarketplacePins(): readonly MarketplacePin[] {
  cachedPins ??= loadMarketplacePins(defaultDataDirectory(), getAllExtensions());
  return cachedPins;
}

/** The pin for one catalog entry, or undefined when it is not in the marketplace. */
export function getMarketplacePin(slug: string): MarketplacePin | undefined {
  return getMarketplacePins().find((pin) => pin.slug === slug);
}
