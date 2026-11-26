import { Telegraf } from "telegraf";
import dotenv from "dotenv";

import { startCommand } from "./commands/start.js";
import { textHandler } from "./handlers/text.js";
import { cienkowCommand } from "./commands/cienkow.js";
import { jasnaCommand } from "./commands/jasna.js";
import { bialkaCommand } from "./commands/bialka.js";
import { aboutCommand } from "./commands/about.js";

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN не знайдено у .env");
}

const bot = new Telegraf(token);

bot.start(startCommand);

bot.command("cienkow", cienkowCommand);
bot.command("jasna", jasnaCommand);
bot.command("bialka", bialkaCommand);

bot.command("about", aboutCommand);

bot.on("text", textHandler);

async function startBot() {
  await bot.telegram.setMyCommands([
    {
      command: "start",
      description: "Запуск бота"
    },
    {
      command: "cienkow",
      description: "Погода у Cieńków"
    },
    {
      command: "jasna",
      description: "Погода у Jasná"
    },
    {
      command: "bialka",
      description: "Погода у Białka Tatrzańska"
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
