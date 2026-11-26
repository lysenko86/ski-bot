import { Markup } from "telegraf";

export const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("👋 Привіт", "hello")],
  [Markup.button.callback("ℹ️ Інфо", "info")]
]);
