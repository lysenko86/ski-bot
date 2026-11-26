import { Context } from "telegraf";

export const helpCommand = async (ctx: Context) => {
  await ctx.reply(`
Доступні команди:

/start - запуск бота
/help - допомога
/about - інформація про бота
  `);
};
