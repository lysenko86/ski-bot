import { Telegraf } from "telegraf";
import dotenv from "dotenv";

import { startCommand } from "./commands/start.js";
import { textHandler } from "./handlers/text.js";
import { registerButtonActions } from "./actions/buttons.js";
import { helpCommand } from "./commands/help.js";
import { aboutCommand } from "./commands/about.js";

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN не знайдено у .env");
}

const bot = new Telegraf(token);

bot.start(startCommand);

bot.command("help", helpCommand);

bot.command("about", aboutCommand);

bot.on("text", textHandler);

registerButtonActions(bot);

async function startBot() {
  await bot.telegram.setMyCommands([
    {
      command: "start",
      description: "Запуск бота"
    },
    {
      command: "help",
      description: "Допомога"
    },
    {
      command: "about",
      description: "Про бота"
    }
  ]);

  await bot.launch();

  console.log("Бот запущений ✅");
}

startBot();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));