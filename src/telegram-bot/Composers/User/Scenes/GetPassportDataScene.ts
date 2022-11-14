import { Composer, Markup, Scenes, Telegraf } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { HomeKeyboardMarkup } from "../Constants/Markups";
import logger from "../../../../logger/logger";
import StudentPasportDataModel from "../../../Models/StudentPasportModel";

interface MySessionData extends Scenes.WizardSessionData {}
interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "GetPassportData",
  new Composer<MyWizardContext>()
    .on("text", async (ctx) => {
      if (ctx.message.text == "Orqaga") {
        ctx.scene.leave();
        await ctx.replyWithHTML("<b>Bosh menyu</b>");
        return;
      }
      if (!new RegExp(/^[0-9]{14}$/gm).test(ctx.message.text))
        throw new Error("Notog'ri formatda ma'lumot yuborildi!");
      let data = await StudentPasportDataModel.findOne({
        jshshir: ctx.message.text,
      });
      if (data == null) {
        ctx.replyWithHTML("<b>4️⃣0️⃣4️⃣Ma'lumotlaringiz topilmadi!</b>", {
          reply_markup: HomeKeyboardMarkup,
        });
      } else {
        await ctx.replyWithHTML(
          `<b>👨‍🎓Talaba: ${data.studentName};
🆔Talaba ID si: ${data.student_id_number};
🔵JSHSHIR: ${data.jshshir};
🔵Pasport seria: ${data.seria};</b>`,
          {
            reply_markup: HomeKeyboardMarkup,
          }
        );
      }
      ctx.scene.leave();
    })
    .on("message", async (ctx) => {
      throw new Error("Noto'g'ri ma'lumot yuborildi!");
    })
);

scene.use(
  Telegraf.hears(/\/\w*/gm, (ctx, next) => {
    ctx.scene.leave();
  })
);

scene.enter(async (ctx) => {
  await ctx.replyWithHTML(
    "<b>JSHSHIR raqamingizni yuboring[14 ta raqam]: </b>",
    {
      reply_markup: Markup.keyboard(["Orqaga"]).resize(true).reply_markup,
    }
  );
});

scene.use(
  Composer.catch(async (err, ctx) => {
    await ctx.scene.leave();
    ctx.replyWithHTML(`<b>❌Xatolik:\n${(<Error>err).message}</b>`, {
      reply_markup: HomeKeyboardMarkup,
    });
    logger.LogError(<Error>err);
  })
);

export default scene;
