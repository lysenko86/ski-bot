import type { Context } from "telegraf";

export async function requestCommand(ctx: Context): Promise<void> {
  const destination = process.env.REQUESTS_CHAT_ID?.trim();
  const user = ctx.from;
  const chat = ctx.chat;

  if (!destination) {
    console.error(
      "Cannot forward notification request: REQUESTS_CHAT_ID is not configured.",
    );
    await ctx.reply(
      "Зараз не вдалося надіслати запит адміністратору. Спробуй пізніше.",
    );
    return;
  }

  if (!user || !chat) {
    console.error("Cannot forward notification request without user and chat.");
    await ctx.reply(
      "Не вдалося визначити чат для запиту. Спробуй написати боту приватно.",
    );
    return;
  }

  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  const message = [
    "🔔 Запит на автоматичні сповіщення",
    `Ім’я: ${name || "не вказане"}`,
    `Username: ${user.username ? `@${user.username}` : "не вказаний"}`,
    `Telegram ID: ${user.id}`,
    `ID чату для сповіщень: ${chat.id}`,
    `Тип чату: ${chat.type}`,
  ].join("\n");

  try {
    await ctx.telegram.sendMessage(destination, message);
  } catch (error) {
    console.error("Failed to forward notification request:", error);
    await ctx.reply(
      "Не вдалося надіслати запит адміністратору. Спробуй пізніше.",
    );
    return;
  }

  await ctx.reply(
    "Запит надіслано адміністратору. Він отримав твоє ім’я, username (якщо є), Telegram ID та ID цього чату. Запит сам по собі не вмикає сповіщення автоматично.",
  );
}
