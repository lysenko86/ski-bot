import { Telegraf } from "telegraf";

export const registerButtonActions = (bot: Telegraf) => {
  bot.action("hello", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("Привіт! 👋");
  });

  bot.action("info", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("Я бот на Node.js + TypeScript 🚀");
  });
};
