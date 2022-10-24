import { session, Telegraf, Scenes, Composer, TelegramError } from "telegraf";
import Config from "../config/Config";
import Logger from "../logger/logger";
import MyContext from "./Interfaces/MyContext";
import logger from "../logger/logger";

import Admin from "./Composers/Admin/Admin";
import Student from "./Composers/Student/Student";
import User from "./Composers/User/User";

//Middlewares
import InitializeUserData from "./Middlewares/InitializeUserData";
import ChatTypeChecker from "./Middlewares/ChatTypeChecker";

const bot = new Telegraf<MyContext>(Config.TELEGRAM_BOT_TOKEN);

bot.use(session());

/// Initialization data of User;
bot.use(InitializeUserData);
///Bot works only in private chat
bot.use(ChatTypeChecker);

// Composing user to Admin
bot.use(
  Composer.optional((ctx: MyContext) => {
    if (ctx.UserData.role === "Admin") return true;
    else return false;
  }, Admin)
);

// Composing user to Student
bot.use(
  Composer.catch(
    (err, ctx) => {
      Logger.LogError(<Error>err);
    },
    Composer.optional((ctx: MyContext) => {
      if (ctx.UserData.role === "Student") {
        return true;
      } else return false;
    }, Student)
  )
);

// Composing user to User
bot.use(
  Composer.catch((err, ctx) => {
    if (err instanceof TelegramError) logger.LogTelegramError(err);
    else logger.LogError(<Error>err);
  }, User)
);

bot
  .launch()
  .then((res) => {
    Logger.LogMessage("Bot ishga tushdi.");
  })
  .catch((err) => {
    Logger.LogError(err);
  });
