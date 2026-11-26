import { Context } from "telegraf";
import { askGemini } from "../services/gemini.js";

export const textHandler = async (ctx: Context) => {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  const text = ctx.message.text;

  if (text.startsWith("/")) {
    return;
  }

  try {
    await ctx.sendChatAction("typing");

    const answer = await askGemini(text);

    await ctx.reply(answer);
  } catch (error: any) {
    console.error(error);

    if (error?.status === 503) {
      await ctx.reply(
        "⚠️ Gemini зараз перевантажений. Спробуй ще раз через кілька хвилин."
      );
      return;
    }

    await ctx.reply(
      "❌ Не вдалося отримати відповідь від Gemini."
    );
  }
};