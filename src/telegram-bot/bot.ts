import { Telegraf, Context, TelegramError, Scenes, session } from "telegraf";
import Config from "../config/Config";
import Logger from "../logger/logger";
import MyContext from "./interfaces/MyContext";
import MySessionData from "./interfaces/session";
import Users, { User as UserModel } from "./Models/Users";
import { Roles } from "./constants/roles";

import User from "./scenes/user";
import Admin from "./scenes/admin";
import Student from "./scenes/student";

const bot = new Telegraf<MyContext>(Config.TELEGRAM_BOT_TOKEN);

// Bot usings
bot.use(session());

bot.use(
  new Scenes.Stage<MyContext, MySessionData>([
    User,
    Student,
    Admin,
  ]).middleware()
);

// Bot middlewares
bot.use(async (ctx, next) => {
  if (ctx.from.is_bot || ctx.chat.type !== "private") {
    await ctx.replyWithHTML(
      "<b>Bu bot faqat shaxsiy yozishmalarda ishlaydi</b>"
    );
    return;
  }
  next();
});

// SwitchingData

bot.use(async (ctx, next) => {
  if (ctx.data == undefined) {
    ctx.data = {};
  }
  let user = <UserModel>await Users.findOne({
    telegramData: { id: ctx.chat.id },
  });
  if (!user) {
    let temp = new UserModel(ctx.from);
    user = temp;
    temp["_id"] = null;
    await Users.insertOne(temp);
  }
  if (user.role == Roles.Admin) {
    ctx.data.admin = user;
    ctx.scene.enter("ADMIN_SCENE");
  } else if (user.role === Roles.Student) {
    ctx.data.student = user;
    ctx.scene.enter("STUDENT_SCENE");
  } else {
    ctx.data["user"] = user;
    ctx.scene.enter("USER_SCENE");
  }
  next();
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
