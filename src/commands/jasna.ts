import { Context } from "telegraf";
import { getWeather } from "../services/weather.js";

export const jasnaCommand = async (ctx: Context) => {
  try {
    const weather = await getWeather(
      48.964861,
      19.586333
    );

    await ctx.reply(
      `
<a href="https://maps.google.com/?q=48.964861,19.586333"><b>🏔️ Jasná</b></a>

${weather}
      `.trim(),
      {
        parse_mode: "HTML",
      },
    );
  } catch (error) {
    console.error(error);

    await ctx.reply(
      "❌ Не вдалося отримати погоду для Вісли."
    );
  }
};