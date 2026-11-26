import { Context } from "telegraf";
import { mainKeyboard } from "../keyboards/mainKeyboard.js";

export const startCommand = async (ctx: Context) => {
  await ctx.reply(
    "Вітаю! Обери дію:",
    mainKeyboard
  );
};
