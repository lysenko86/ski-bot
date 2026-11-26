import { Telegraf } from "telegraf";
import dotenv from "dotenv";

import { startCommand } from "./commands/start.js";
import { createLocationCommand } from "./commands/location.js";
import { textHandler } from "./handlers/text.js";
import { aboutCommand } from "./commands/about.js";
import { locations } from "./data/locations.js";

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN не знайдено у .env");
}

const bot = new Telegraf(token);

bot.start(startCommand);

const locationCommands = locations.map((location) => ({
  command: location.command,
  description: `Погода у ${location.name}`,
  handler: createLocationCommand(location),
}));

for (const { command, handler } of locationCommands) {
  bot.command(command, handler);
}

bot.command("about", aboutCommand);

bot.on("text", textHandler);

async function startBot() {
  await bot.telegram.setMyCommands([
    {
      command: "start",
      description: "Запуск бота",
    },
    ...locationCommands.map(({ command, description }) => ({
      command,
      description,
    })),
    {
      command: "about",
      description: "Про бота",
    },
  ]);

  await bot.launch();

  console.log("Бот запущений ✅");
}

startBot();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
