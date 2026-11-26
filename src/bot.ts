import { Telegraf } from "telegraf";
import dotenv from "dotenv";

import { infoCommand } from "./commands/info.js";
import { requestCommand } from "./commands/request.js";
import { createLocationCommand } from "./commands/location.js";
import { textHandler } from "./handlers/text.js";
import { locations } from "./data/locations.js";
import { startWeatherMonitor } from "./services/weather-monitor.js";

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN не знайдено у .env");
}

const bot = new Telegraf(token);

bot.start(infoCommand);

const locationCommands = locations.map((location) => ({
  command: location.command,
  description: `Погода у ${location.name}`,
  handler: createLocationCommand(location),
}));

for (const { command, handler } of locationCommands) {
  bot.command(command, handler);
}

bot.command("info", infoCommand);
bot.command("request", requestCommand);

// TEMP: Uncomment only if you need to retrieve the chat ID again.
// bot.command("chatid", async (ctx) => {
//   await ctx.reply(`Chat ID: ${ctx.chat.id}`);
// });

bot.on("text", textHandler);

async function startBot() {
  await bot.telegram.setMyCommands([
    {
      command: "info",
      description: "Інформація про бота",
    },
    ...locationCommands.map(({ command, description }) => ({
      command,
      description,
    })),
    {
      command: "request",
      description: "Я хочу отримувати автоматичні сповіщення",
    },
  ]);

  await bot.launch();

  console.log("Бот запущений ✅");
  startWeatherMonitor(bot, process.env.ALERT_CHAT_ID);
}

startBot();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
