import { session, Telegraf, Scenes, Composer, TelegramError } from "telegraf";
import Config from "../config/Config";
import Logger from "../logger/logger";
import MyContext from "./Interfaces/MyContext";
import logger from "../logger/logger";
import https from "https";

import Admin from "./Composers/Admin/Admin";
import Student from "./Composers/Student/Student";
import User from "./Composers/User/User";

//Middlewares
import InitializeUserData from "./Middlewares/InitializeUserData";
import ChatTypeChecker from "./Middlewares/ChatTypeChecker";

const bot = new Telegraf<MyContext>(Config.TELEGRAM_BOT_TOKEN, {
  telegram: {
    attachmentAgent: new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 10000,
      rejectUnauthorized: false,
    }),
  },
});

bot.use(session());

// Check Chat Type
bot.use(ChatTypeChecker);
// Initialize User Data
bot.use(InitializeUserData);

// Composing user to Admin
// bot.use(
//   Composer.catch(
//     ErrorLogger,
//     Composer.optional((ctx: MyContext) => {
//       if (ctx.UserData.role === "Admin") return true;
//       else return false;
//     }, Composer.catch(ErrorLogger, Admin))
//   )
// );

bot.use(async (ctx, next) => {
  try {
    if (ctx.UserData.role == "Student")
      Composer.compose([Student.middleware()])(ctx, next);
    else if (ctx.UserData.role == "Admin")
      Composer.compose([Admin.middleware()])(ctx, next);
    else Composer.compose([User.middleware()])(ctx, next);
  } catch (error) {
    console.log(error);
    // throw error;
  }
});

async function ErrorLogger(err, ctx: MyContext) {
  await ctx.replyWithHTML(`<b>❌Xatolik:\n${err.message}</b>`);
  if (err instanceof TelegramError) logger.LogTelegramError(err);
  else logger.LogError(err);
}

bot
  .launch()
  .then((res) => {
    Logger.LogMessage("Bot ishga tushdi.");
  })
  .catch((err) => {
    Logger.LogError(err);
  });
