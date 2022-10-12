import { Telegraf, Context, TelegramError, Scenes, session } from "telegraf";
import Config from "../config/Config";
import Logger from "../logger/logger";
const bot = new Telegraf(Config.TELEGRAM_BOT_TOKEN);

bot.use(session());
const sc = new Scenes.BaseScene("sfdsf");

// bot.telegram.se
bot.use((ctx, next) => {
  //   ctx.state.number ;

  next();
});

bot.use((ctx) => {
  ctx.replyWithHTML(JSON.stringify(ctx.state));
  //   ctx.replyWithHTML(JSON.stringify(ctx.ses));
});

bot.catch((err, ctx) => {
  // Catching Telegram Error
  if (err instanceof TelegramError)
    return Logger.LogTelegramError(<TelegramError>err);
  // Some Errors Catching
  //Catching other errors
  Logger.LogError(<Error>err);
});

bot.launch();
