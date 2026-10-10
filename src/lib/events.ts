import path from "node:path";
import { defaultDataDirectory, displayPath, formatIssues, readJsonFile } from "@/lib/data-files";
import {
  eventsFileSchema,
  supplementFileSchema,
  type EventsFile,
  type HookEvent,
  type SupplementEvent,
  type SupplementFile,
} from "@/lib/types";

/**
 * The hook events of Claude Code's function hooks, in `src/data/events.json`. The file is written
 * by `scripts/sync-events.mjs` from Anthropic's type declarations and holds names only.
 * Server code only: this module reads the file system.
 */

export const EVENTS_FILE_NAME = "events.json";
export const SUPPLEMENT_FILE_NAME = "event-supplement.json";

/**
 * Reads and validates the events file inside `dataDirectory`.
 * @throws Error naming the file and listing every zod issue with its path.
 */
export function loadEventsFile(dataDirectory: string): EventsFile {
  const filePath = path.join(dataDirectory, EVENTS_FILE_NAME);
  const result = eventsFileSchema.safeParse(readJsonFile(filePath));
  if (!result.success) {
    throw new Error(`Invalid ${displayPath(filePath)}:\n${formatIssues(result.error.issues)}`);
  }
  return result.data;
}

/**
 * Reads and validates the hand-kept supplement inside `dataDirectory`: names Anthropic's mods
 * reference or changelog lists that the pinned declarations do not declare yet.
 * @throws Error naming the file and listing every zod issue with its path.
 */
export function loadSupplementFile(dataDirectory: string): SupplementFile {
  const filePath = path.join(dataDirectory, SUPPLEMENT_FILE_NAME);
  const result = supplementFileSchema.safeParse(readJsonFile(filePath));
  if (!result.success) {
    throw new Error(`Invalid ${displayPath(filePath)}:\n${formatIssues(result.error.issues)}`);
  }
  return result.data;
}

let cachedEventsFile: EventsFile | undefined;
let cachedSupplementFile: SupplementFile | undefined;

function getSupplementFile(): SupplementFile {
  cachedSupplementFile ??= loadSupplementFile(defaultDataDirectory());
  return cachedSupplementFile;
}

function getEventsFile(): EventsFile {
  cachedEventsFile ??= loadEventsFile(defaultDataDirectory());
  return cachedEventsFile;
}

/**
 * Every event the pinned declarations declare, sorted by name. Pages that quote the declarations'
 * commit count these; the Hooks page adds `getSupplementEvents()` on top.
 */
export function getEvents(): readonly HookEvent[] {
  return getEventsFile().events;
}

/** The upstream commit, Claude Code version and sync date the names were read from. */
export function getEventsSource(): EventsFile["source"] {
  return getEventsFile().source;
}

/** Names from Anthropic's mods reference and changelog that the pinned declarations do not declare yet. */
export function getSupplementEvents(): readonly SupplementEvent[] {
  return getSupplementFile().events;
}

/** Which reference version and changelog entries the supplement was checked against, and when. */
export function getSupplementSource(): SupplementFile["source"] {
  return getSupplementFile().source;
}

// Pure helpers live in event-names.ts so client components can import them; re-exported for callers of this module.
export { eventSourceUrl, nounOf, patternMatchesEvent } from "@/lib/event-names";
