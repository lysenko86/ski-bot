import type { Context } from "telegraf";
import {
  formatLocationWeatherMessage,
  getWeatherReport,
} from "../services/weather.js";
import type { Location } from "../data/locations.js";

export function createLocationCommand(location: Location) {
  return async (ctx: Context): Promise<void> => {
    try {
      const report = await getWeatherReport(
        location.latitude,
        location.longitude,
      );

      await ctx.reply(formatLocationWeatherMessage(location, report.message), {
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error(error);

      await ctx.reply(`❌ Не вдалося отримати погоду для ${location.name}.`);
    }
  };
}
