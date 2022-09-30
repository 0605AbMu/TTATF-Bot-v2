import { Telegraf, TelegramError } from "telegraf";
import Config from "../config/Config";

// import error handler
import ErrorHandler from "./middlewares/ErrorHandler";

// bot registration
const token: string = Config.BOT_TOKEN;
const bot = new Telegraf(token);

bot.start((msg) => {
  throw new TelegramError({ error_code: 404, description: "eror" });
});

bot.catch(ErrorHandler);

bot.launch();
