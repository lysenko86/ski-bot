import { Context } from "telegraf";

export const infoCommand = async (ctx: Context) => {
  await ctx.reply(`⛷ Ski Bot

Вітаю! Цей бот допоможе перевірити температуру та сніговий покрив у гірськолижних регіонах.

Обери регіон у меню або надішли відповідну команду, щоб отримати погоду.

Версія: 1.0.0`);
};
