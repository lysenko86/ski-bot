import type { Telegraf } from "telegraf";
import { locations } from "../data/locations.js";
import {
  formatLocationWeatherMessage,
  getWeatherReport,
  type WeatherReport,
} from "./weather.js";

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const LOCATION_REQUEST_SPACING_MINUTES = 1;
const MAX_ALERT_TEMPERATURE_C = -4;
const MIN_ALERT_SNOW_DEPTH_CM = 7;

const LOCATION_REQUEST_SPACING_MS =
  LOCATION_REQUEST_SPACING_MINUTES * 60 * 1000;
const MIN_ALERT_SNOW_DEPTH_METERS = MIN_ALERT_SNOW_DEPTH_CM / 100;

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function meetsSkiConditions(
  current: Awaited<ReturnType<typeof getWeatherReport>>["current"],
): boolean {
  const noPrecipitation = current.precipitation === 0;
  const snowOnly =
    current.snowfall !== null &&
    current.snowfall > 0 &&
    (current.rain === null || current.rain === 0) &&
    (current.showers === null || current.showers === 0);

  return (
    current.temperature !== null &&
    current.temperature <= MAX_ALERT_TEMPERATURE_C &&
    (noPrecipitation || snowOnly) &&
    current.snowDepth !== null &&
    current.snowDepth >= MIN_ALERT_SNOW_DEPTH_METERS
  );
}

export function getSkiConditionPeriods(report: WeatherReport) {
  return report.periods.filter((period) =>
    meetsSkiConditions(period.conditions),
  );
}

export function startWeatherMonitor(
  bot: Telegraf,
  chatId: string | undefined,
): void {
  const destination = chatId?.trim();

  if (!destination) {
    console.warn(
      "Automatic weather alerts are disabled. Set ALERT_CHAT_ID to a Telegram chat ID.",
    );
    return;
  }

  let isChecking = false;

  const checkLocations = async (): Promise<void> => {
    if (isChecking) {
      return;
    }

    isChecking = true;

    try {
      for (const [index, location] of locations.entries()) {
        if (index > 0) {
          await delay(LOCATION_REQUEST_SPACING_MS);
        }

        try {
          const requestedAt = new Date().toISOString();
          console.log("[Weather monitor] Requesting weather", {
            location: location.name,
            requestedAt,
          });

          const report = await getWeatherReport(
            location.latitude,
            location.longitude,
          );

          console.log("[Weather monitor] Weather response", {
            location: location.name,
            requestedAt,
            receivedAt: new Date().toISOString(),
            report,
          });

          const matchingPeriods = getSkiConditionPeriods(report);

          if (matchingPeriods.length === 0) {
            continue;
          }

          for (const period of matchingPeriods) {
            await bot.telegram.sendMessage(
              destination,
              formatLocationWeatherMessage(location, period.message),
              { parse_mode: "HTML" },
            );
          }
        } catch (error) {
          console.error(`Weather check failed for ${location.name}:`, error);
        }
      }
    } finally {
      isChecking = false;
    }
  };

  void checkLocations();
  setInterval(() => void checkLocations(), CHECK_INTERVAL_MS);
}
