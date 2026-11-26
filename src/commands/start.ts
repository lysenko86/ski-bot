import { Context } from "telegraf";

export const startCommand = async (ctx: Context) => {
  await ctx.reply(
    "Вітаю! Це Ski Bot. Вибери регіон і я розкажу тобі про температуру та сніговий покрив там станом на зараз.",
  );
};
