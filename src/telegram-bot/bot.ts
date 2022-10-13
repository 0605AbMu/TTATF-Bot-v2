import { Telegraf, Context, TelegramError, Scenes, session } from "telegraf";
import Config from "../config/Config";
import Logger from "../logger/logger";
import MyContext from "./interfaces/MyContext";
import MySessionData from "./interfaces/ContextData";
import Users, { User as UserModel } from "./Models/Users";
import { Roles } from "./constants/roles";

import User from "./scenes/User/user";
import Admin from "./scenes/Admin/admin";
import Student from "./scenes/Student/student";

const bot = new Telegraf<MyContext>(Config.TELEGRAM_BOT_TOKEN);

// Bot usings
bot.use(session());

bot.use(
  new Scenes.Stage<MyContext, Scenes.SceneSessionData>([
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
  await next();
});

// SwitchingData
bot.use(async (ctx, next) => {
  if (ctx.data == undefined) {
    ctx.data = {};
  }
  let user = <UserModel>await Users.findOne({
    "telegramData.id": ctx.from.id,
  });
  if (user == null) {
    let temp = new UserModel(ctx.from);
    user = temp;
    temp["_id"] = null;
    await Users.insertOne(temp);
  }
  if (user.role === Roles.Admin) {
    ctx.data.admin = user;
    await ctx.scene.enter("ADMIN_SCENE");
  } else if (user.role === Roles.Student) {
    ctx.data.student = user;
    await ctx.scene.enter("STUDENT_SCENE");
  } else {
    ctx.data["user"] = user;
    await ctx.scene.enter("USER_SCENE");
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
