import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type DailyCommandCounts = Record<string, Record<string, number>>;

const TIME_ZONE = "Europe/Warsaw";
let supabase: SupabaseClient | undefined;

function getSupabaseClient(): SupabaseClient {
  if (supabase) {
    return supabase;
  }

  const url = process.env.SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !secretKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SECRET_KEY must be configured to use analytics.",
    );
  }

  supabase = createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return supabase;
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

export async function recordCommand(command: string): Promise<void> {
  if (!/^[a-z0-9_]+$/.test(command)) {
    throw new Error(`Invalid command name for analytics: ${command}`);
  }

  const { error } = await getSupabaseClient().rpc("record_command_usage", {
    p_usage_date: getDateKey(new Date()),
    p_command: command,
  });

  if (error) {
    throw error;
  }
}

export async function getAnalyticsReport(): Promise<string> {
  const today = getDateKey(new Date());
  const dateRange = getRecentDateKeys(today, 30);
  const oldestDate = dateRange[dateRange.length - 1];

  if (!oldestDate) {
    throw new Error("Unable to determine analytics date range");
  }

  const { data, error } = await getSupabaseClient()
    .from("command_usage_daily")
    .select("usage_date, command, command_count")
    .gte("usage_date", oldestDate)
    .lte("usage_date", today);

  if (error) {
    throw error;
  }

  const counts: DailyCommandCounts = {};

  for (const row of data) {
    const commandCount = Number(row.command_count);

    if (
      typeof row.usage_date !== "string" ||
      typeof row.command !== "string" ||
      !Number.isSafeInteger(commandCount) ||
      commandCount < 0
    ) {
      throw new Error("Supabase returned invalid analytics data");
    }

    const dateCounts = (counts[row.usage_date] ??= {});
    dateCounts[row.command] = commandCount;
  }

  return formatAnalyticsReport(counts, today);
}
