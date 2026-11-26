import { Context } from "telegraf";

export const aboutCommand = async (ctx: Context) => {
  await ctx.reply(`
⛷  Ski Bot

Цей бот перевіряє температуру і сніговий покрив у певних регіонах, щоб допомогти тобі вирішити, чи варто їхати кататися на лижах.

Версія: 1.0.0
  `);
};
