import { Telegraf, Context, TelegramError, Scenes, session } from "telegraf";
import Config from "../config/Config";
import Logger from "../logger/logger";
import MyContext from "./interfaces/MyContext";
const bot = new Telegraf<MyContext>(Config.TELEGRAM_BOT_TOKEN);

bot.use(session());

bot.use(async (ctx, next) => {
  if (ctx.from.is_bot || ctx.chat.type !== "private") {
    await ctx.replyWithHTML(
      "<b>Bu bot faqat shaxsiy yozishmalarda ishlaydi</b>"
    );
    return;
  }
  next();
});

// Authorization

bot.use(async (ctx, next) => {});

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
