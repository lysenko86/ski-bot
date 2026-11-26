import type { Context } from "telegraf";

export const textHandler = async (ctx: Context): Promise<void> => {
  const message = ctx.message;

  if (!message || !("text" in message) || message.text.startsWith("/")) {
    return;
  }

  await ctx.reply("Бот працює лише через команди. Скористайся меню.");
};