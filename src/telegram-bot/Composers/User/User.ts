import { Composer, Markup, session, Scenes } from "telegraf";
import MyContext from "../../Interfaces/MyContext";
import UserModel from "../../Models/UserModel";

import * as buttons from "./Constants/Keyboards";
import { HomeKeyboardMarkup } from "./Constants/Markups";

import LoginForStudentScene from "./Scenes/LoginForStudentScene";

const User = new Composer<MyContext>();

User.use(session());
User.use(new Scenes.Stage([LoginForStudentScene]).middleware());

User.start(async (ctx) => {
  ctx.replyWithHTML("<b>👋Assalomu alaykum. Xush kelibsiz!</b>", {
    reply_markup: HomeKeyboardMarkup,
  });
});

User.hears(buttons.Home.Kirish, async (ctx) => {
  await ctx.scene.enter("LoginForStudent");
});

User.hears(buttons.Home.Stat, async (ctx) => {
  await ctx.replyWithHTML(`<b>📆Bugungi sana: ${new Date(
    Date.now()
  ).toLocaleDateString()};
📈Jami a'zolar soni: ${await UserModel.countDocuments()} ta;
👨‍🎓Talabalar soni: ${await UserModel.count({ role: "Student" })} ta;</b>`);
});

User.use(Composer.catch((err, ctx) => {}));

export default User;
