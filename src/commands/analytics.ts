import type { Context } from "telegraf";
import { getAnalyticsReport } from "../services/analytics.js";

export async function analyticsCommand(ctx: Context): Promise<void> {
  const ownerChatId = process.env.REQUESTS_CHAT_ID?.trim();
  const chat = ctx.chat;

  if (
    !ownerChatId ||
    !chat ||
    chat.type !== "private" ||
    String(chat.id) !== ownerChatId
  ) {
    await ctx.reply("Ця команда доступна лише адміністратору в приватному чаті.");
    return;
  }

  try {
    await ctx.reply(await getAnalyticsReport());
  } catch (error) {
    console.error("Failed to load bot analytics:", error);
    await ctx.reply("Не вдалося прочитати статистику.");
  }
}
