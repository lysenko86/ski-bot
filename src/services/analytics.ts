import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export type DailyCommandCounts = Record<string, Record<string, number>>;

const DATA_FILE = join(process.cwd(), ".data", "analytics.json");
const TEMP_FILE = `${DATA_FILE}.tmp`;
const TIME_ZONE = "Europe/Warsaw";

let dailyCounts: DailyCommandCounts | undefined;
let loadPromise: Promise<void> | undefined;
let writeQueue: Promise<void> = Promise.resolve();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDailyCommandCounts(value: unknown): value is DailyCommandCounts {
  if (!isRecord(value)) {
    return false;
  }

  return Object.entries(value).every(([date, commands]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isRecord(commands)) {
      return false;
    }

    return Object.entries(commands).every(
      ([command, count]) =>
        /^[a-z0-9_]+$/.test(command) &&
        typeof count === "number" &&
        Number.isSafeInteger(count) &&
        count >= 0,
    );
  });
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

async function loadCounts(): Promise<void> {
  let contents: string;

  try {
    contents = await readFile(DATA_FILE, "utf8");
  } catch (error) {
    if (isMissingFileError(error)) {
      dailyCounts = {};
      return;
    }

    throw error;
  }

  const parsed: unknown = JSON.parse(contents);

  if (!isDailyCommandCounts(parsed)) {
    throw new Error(`Invalid analytics data in ${DATA_FILE}`);
  }

  dailyCounts = parsed;
}

async function ensureLoaded(): Promise<void> {
  if (!loadPromise) {
    loadPromise = loadCounts();
  }

  await loadPromise;
}

async function persistCounts(): Promise<void> {
  if (!dailyCounts) {
    throw new Error("Analytics data has not been loaded");
  }

  const snapshot = `${JSON.stringify(dailyCounts, null, 2)}\n`;
  const write = writeQueue.then(async () => {
    await mkdir(dirname(DATA_FILE), { recursive: true });
    await writeFile(TEMP_FILE, snapshot, "utf8");
    await rename(TEMP_FILE, DATA_FILE);
  });

  writeQueue = write.catch(() => undefined);
  await write;
}

export async function recordCommand(command: string): Promise<void> {
  if (!/^[a-z0-9_]+$/.test(command)) {
    throw new Error(`Invalid command name for analytics: ${command}`);
  }

  await ensureLoaded();

  if (!dailyCounts) {
    throw new Error("Analytics data has not been loaded");
  }

  const today = getDateKey(new Date());
  const todayCounts = (dailyCounts[today] ??= {});
  todayCounts[command] = (todayCounts[command] ?? 0) + 1;

  await persistCounts();
}

function getDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  const year = part("year");
  const month = part("month");
  const day = part("day");

  if (!year || !month || !day) {
    throw new Error("Unable to determine analytics date");
  }

  return `${year}-${month}-${day}`;
}

function getRecentDateKeys(today: string, days: number): string[] {
  const [yearText, monthText, dayText] = today.split("-");

  if (!yearText || !monthText || !dayText) {
    throw new Error(`Invalid analytics date: ${today}`);
  }

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  return Array.from({ length: days }, (_, offset) => {
    const date = new Date(Date.UTC(year, month - 1, day - offset));
    const dateYear = date.getUTCFullYear();
    const dateMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dateDay = String(date.getUTCDate()).padStart(2, "0");

    return `${dateYear}-${dateMonth}-${dateDay}`;
  });
}

function countCommandsForDates(
  counts: DailyCommandCounts,
  dates: string[],
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const date of dates) {
    for (const [command, count] of Object.entries(counts[date] ?? {})) {
      result[command] = (result[command] ?? 0) + count;
    }
  }

  return result;
}

function formatPeriod(
  title: string,
  commandCounts: Record<string, number>,
): string {
  const total = Object.values(commandCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const breakdown = Object.entries(commandCounts)
    .sort(([commandA, countA], [commandB, countB]) =>
      countA === countB
        ? commandA.localeCompare(commandB)
        : countB - countA,
    )
    .map(([command, count]) => `/${command}: ${count}`)
    .join("\n");

  return `${title}: ${total}\n${breakdown || "Команд не викликали"}`;
}

export function formatAnalyticsReport(
  counts: DailyCommandCounts,
  today = getDateKey(new Date()),
): string {
  return [
    "📊 Виклики команд (без збереження Telegram ID)",
    "",
    formatPeriod("Сьогодні", countCommandsForDates(counts, [today])),
    "",
    formatPeriod(
      "Останні 7 днів",
      countCommandsForDates(counts, getRecentDateKeys(today, 7)),
    ),
    "",
    formatPeriod(
      "Останні 30 днів",
      countCommandsForDates(counts, getRecentDateKeys(today, 30)),
    ),
  ].join("\n");
}

export async function getAnalyticsReport(): Promise<string> {
  await ensureLoaded();

  if (!dailyCounts) {
    throw new Error("Analytics data has not been loaded");
  }

  return formatAnalyticsReport(dailyCounts);
}
