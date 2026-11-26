import { Context } from "telegraf";

export const aboutCommand = async (ctx: Context) => {
  await ctx.reply(`
🤖 Ski Bot

Стек:

✅ Node.js
✅ Telegraf
✅ TypeScript
✅ dotenv

Версія: 1.0.0
  `);
};
