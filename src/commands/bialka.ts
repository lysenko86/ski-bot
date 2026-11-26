import { Context } from "telegraf";
import { getWeather } from "../services/weather.js";

export const bialkaCommand = async (ctx: Context) => {
  try {
    const weather = await getWeather(
      49.389528,
      20.099056
    );

    await ctx.reply(
      `
<a href="https://maps.google.com/?q=49.389528,20.099056"><b>🏔️ Białka Tatrzańska</b></a>

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