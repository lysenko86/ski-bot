import type { Context } from "telegraf";
import { getWeather } from "../services/weather.js";
import type { Location } from "../data/locations.js";

export function createLocationCommand(location: Location) {
  return async (ctx: Context): Promise<void> => {
    try {
      const weather = await getWeather(location.latitude, location.longitude);

      await ctx.reply(
        `
<a href="https://maps.google.com/?q=${location.latitude},${location.longitude}"><b>🏔️ ${location.name}</b></a>

${weather}
        `.trim(),
        {
          parse_mode: "HTML",
        },
      );
    } catch (error) {
      console.error(error);

      await ctx.reply(`❌ Не вдалося отримати погоду для ${location.name}.`);
    }
  };
}
