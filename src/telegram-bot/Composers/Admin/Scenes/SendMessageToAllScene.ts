import { Composer, Markup, Scenes, Telegraf, TelegramError } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { HomeMarkup } from "../Constants/Markups";
import UserModel from "../.../../../../Models/UserModel";

interface MySessionData extends Scenes.WizardSessionData {
  //   allHemisData: IHemisData[];
}

interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "SendMessageToAll",
  new Composer<MyWizardContext>()
    .on("text", async (ctx, next) => {
      if (ctx.message.text != "❌Bekor qilish") return await next();
      await ctx.replyWithHTML("<b>❌Bekor qilindi!</b>", {
        reply_markup: HomeMarkup.resize().reply_markup,
      });
      ctx.scene.leave();
    })
    .on("message", async (ctx) => {
      let message = ctx.message;
      (await UserModel.find().toArray()).forEach(async (x) => {
        try {
          await ctx.telegram.sendCopy(x.telegamUser.id, message);
        } catch (error) {}
      });
      ctx.replyWithHTML(`<b>Xabaringiz foydalanuvchilarga yetkazildi!</b>`, {
        reply_markup: HomeMarkup.resize(true).reply_markup,
      });
      ctx.scene.leave();
    })
);

scene.enter(async (ctx) => {
  await ctx.replyWithHTML(
    "<b>Menga xabar yuboring. Men uni barcha foydalanuvchilarga yetkazaman!</b>",
    {
      reply_markup: Markup.keyboard(["❌Bekor qilish"]).resize(true)
        .reply_markup,
    }
  );
});

scene.use(
  Composer.catch((err, ctx) => {
    ctx.scene.leave();
    ctx.replyWithHTML(`<b>❌Xatolik:\n${(<TelegramError>err).message}</b>`, {
      reply_markup: HomeMarkup.resize().reply_markup,
    });
  })
);

export default scene;
