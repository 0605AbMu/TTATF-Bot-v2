import { Markup, Scenes, Telegraf } from "telegraf";
import { Update } from "telegraf/types";
import MyContext from "../../../Interfaces/MyContext";
import UserModel, { HemisDataType } from "../../../Models/UserModel";
import { HomeKeyboardMarkup } from "../Constants/Markups";
import GetStudentDataFromHemis from "../other/GetStudentDataFromHemis";
import {
  IncorrectLoginAndPassword,
  StudentNotFoundError,
} from "../Errors/Errors";

interface MySessionData extends Scenes.WizardSessionData {
  login: string;
  password: string;
  isSuccess: boolean | false;
}
interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "LoginForStudent",
  Telegraf.on("text", async (ctx) => {
    ctx.scene.session.login = ctx.message.text;
    await ctx.replyWithHTML("<b>Parolingizni jo'nating: </b>");
    await ctx.wizard.next();
  }),
  Telegraf.on(
    "text",
    async (ctx, next) => {
      ctx.scene.session.password = ctx.message.text;
      await ctx.replyWithHTML(
        "<b>Ma'lumotlaringiz tekshirilyapdi. Iltimos biroz kuting...</b>"
      );
      await next();
    },
    async (ctx) => {
      //Same logic for Check student login and password for hemis
      let hemisResult: HemisDataType;
      try {
        hemisResult = await GetStudentDataFromHemis(
          ctx.scene.session.login,
          ctx.scene.session.password
        );
        const result = await UserModel.updateOne(
          { "telegamUser.id": ctx.from.id },
          {
            $set: { role: "Student", HemisData: hemisResult },
          }
        );
        if (result.modifiedCount === 0) {
          await ctx.replyWithHTML("<b>Sizning ma'lumotlaringiz topilmadi!</b>");
          await ctx.scene.leave();
          return;
        }
        await ctx.replyWithHTML(
          "<b>Tizimga muvoffaqiyatli kirdingiz. Qayta /start buyrug'ini yuborish orqali botdan foydalanishingiz mumkin.</b>",
          {
            reply_markup: Markup.removeKeyboard().reply_markup,
          }
        );
        ctx.scene.session.isSuccess = true;
      } catch (err) {
        if (
          err instanceof IncorrectLoginAndPassword ||
          err instanceof StudentNotFoundError
        ) {
          await ctx.replyWithHTML(`<b>${err.message}</b>`);
        }
        throw err;
      }
      await ctx.scene.leave();
    }
  )
);

scene.enter(async (ctx) => {
  await ctx.replyWithHTML("<b>Loginingizni yuboring: </b>");
});

scene.leave(async (ctx) => {
  if (ctx.scene.session.isSuccess) return;
  await ctx.replyWithHTML("<b>Bosh menyu</b>", {
    reply_markup: HomeKeyboardMarkup,
  });
});

export default scene;
