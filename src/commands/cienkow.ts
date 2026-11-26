import { Context } from "telegraf";
import { getWeather } from "../services/weather.js";

export const cienkowCommand = async (ctx: Context) => {
  try {
    const weather = await getWeather(
      49.631889,
      18.930278
    );

    await ctx.reply(
      `
<a href="https://maps.google.com/?q=49.631889,18.930278"><b>🏔️ Cieńków</b></a>

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