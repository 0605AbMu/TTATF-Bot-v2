import { Composer, Markup, session, Scenes } from "telegraf";
import MyContext from "../../Interfaces/MyContext";

import * as buttons from "./Constants/Keyboards";
import { HomeKeyboardMarkup } from "./Constants/Markups";

import LoginForStudentScene from "./Scenes/LoginForStudentScene";

const User = new Composer<MyContext>();

User.use(session());
User.use(new Scenes.Stage([LoginForStudentScene]).middleware());

User.start((ctx) => {
  ctx.replyWithHTML("<b>Assalomu alaykum. Xush kelibsiz</b>", {
    reply_markup: HomeKeyboardMarkup,
  });
});

User.hears(buttons.Home.Kirish, async (ctx) => {
  await ctx.scene.enter("LoginForStudent");
});

export default User;
