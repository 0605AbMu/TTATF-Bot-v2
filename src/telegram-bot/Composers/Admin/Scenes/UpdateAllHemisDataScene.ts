import { Composer, Markup, Scenes, Telegraf, TelegramError } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import HemisDataModel, { HemisData } from "../../../Models/HemisDataModel";
import GetAllDataFromHemis from "../../../Services/GetAllDataFromHemis";

interface MySessionData extends Scenes.WizardSessionData {
  allHemisData: HemisData[];
}
interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "UpdateAllHemisData",
  new Composer<MyWizardContext>()
    .action("yes", async (ctx, next) => {

      await ctx.replyWithHTML("<b>⏳Biroz kuting. Ma'lumotlar qo'shilyapdi.</b>");
      await HemisDataModel.deleteMany({});
      await HemisDataModel.insertMany(ctx.scene.session.allHemisData);
      await ctx.replyWithHTML(
        "<b>✅Barcha ma'lumotlar muvoffaqiyatli yangilandi!</b>"
      );
      ctx.scene.leave();
    })
    .action("no", async (ctx) => {
      await ctx.answerCbQuery("❌Bekor qilindi!");
      ctx.scene.leave();
    })
    .middleware()
);

scene.enter(async (ctx) => {
  await ctx.replyWithHTML(
    "<b>⏳Biroz kuting. Ma'lumotlar HEMIS tizimidan olinyapdi.</b>"
  );
  ctx.scene.session.allHemisData = await GetAllDataFromHemis();
  await ctx.replyWithHTML(
    `<b>📈Barcha o'qib olingan talaba ma'lumotlarining soni: ${ctx.scene.session.allHemisData.length} ta.
<u>Haqiqatdan ham yangilashni istaysizmi❓</u></b>`,
    {
      reply_markup: Markup.inlineKeyboard([
        { text: "Ha", callback_data: "yes" },
        { text: "Yo'q", callback_data: "no" },
      ]).reply_markup,
    }
  );
});

scene.use(
  Composer.catch((err, ctx) => {
    ctx.replyWithHTML(`<b>❌Xatolik:\n${(<TelegramError>err).message}</b>`);
  })
);

export default scene;
