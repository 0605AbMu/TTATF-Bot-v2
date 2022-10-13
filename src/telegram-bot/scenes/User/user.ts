import { Scenes, Telegraf, Markup, TelegramError, session } from "telegraf";
import MyContext from "../../interfaces/MyContext";
import RegisterSceneForStudentRole from "./RegisterSceneForStudentRole";
import { Home } from "./buttons";

const User = new Scenes.BaseScene<MyContext>("USER_SCENE");

User.use(
  new Scenes.Stage([RegisterSceneForStudentRole], {
    default: "REGISTER_FOR_STUDENT_ROLE",
  }).middleware()
);

User.enter(async (ctx, next) => {
  await ctx.replyWithHTML("<b>Assalomu alaykum. Hush kelibsiz!</b>", {
    reply_markup: Markup.keyboard(Object.values(Home), { columns: 2 }).resize(
      true
    ).reply_markup,
  });
  await next();
});

User.hears(Home.Kirish, async (ctx) => {
  //   ctx.scene.session.
  await ctx.scene.enter("REGISTER_FOR_STUDENT_ROLE");
  console.log(ctx.scene.session.state);
});

export default User;
