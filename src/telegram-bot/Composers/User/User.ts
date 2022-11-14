import { Composer, Markup, session, Scenes, Telegraf } from "telegraf";
import MyContext from "../../Interfaces/MyContext";
import UserModel from "../../Models/UserModel";

import * as buttons from "./Constants/Keyboards";
import { HomeKeyboardMarkup } from "./Constants/Markups";

import LoginForStudentScene from "./Scenes/LoginForStudentScene";
import GetPassportDataScene from "./Scenes/GetPassportDataScene";

const User = new Composer<MyContext>();

User.use(session());
User.use(
  new Scenes.Stage([LoginForStudentScene, GetPassportDataScene]).middleware()
);

User.start(async (ctx) => {
  await ctx.replyWithHTML("<b>👋Assalomu alaykum. Xush kelibsiz!</b>", {
    reply_markup: HomeKeyboardMarkup,
  });
});

User.hears(buttons.Home.Stat, async (ctx) => {
  await ctx.replyWithHTML(`<b>📆Bugungi sana: ${new Date(
    Date.now()
  ).toLocaleDateString()};
📈Jami a'zolar soni: ${await UserModel.countDocuments()} ta;
👨‍🎓Talabalar soni: ${await UserModel.count({ role: "Student" })} ta;</b>`);
});

User.hears(buttons.Home.Kirish, async (ctx) => {
  try {
    await ctx.scene.enter("LoginForStudent");
  } catch (error) {
    console.log(error);
  }
});

User.hears(buttons.Home.GetPassportData, async (ctx) => {
  await ctx.scene.enter("GetPassportData");
});

export default User;
