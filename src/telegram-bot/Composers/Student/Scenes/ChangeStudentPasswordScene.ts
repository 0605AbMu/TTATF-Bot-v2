import { Composer, Markup, Scenes, Telegraf } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { ReferenceProvider } from "../../../Services/ReferenceProvider";
import PasswordChecker from "../../../Services/PasswordChecker";
import UserModel from "../../../Models/UserModel";

interface MySessionData extends Scenes.WizardSessionData {
  password: string;
  provider: ReferenceProvider;
}
interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "ChangePassword",
  Telegraf.on(
    "text",
    async (ctx, next) => {
      ctx.scene.session.password = ctx.message.text;
      if (!PasswordChecker(ctx.scene.session.password)) {
        ctx.replyWithHTML(`<b>Siz kiritgan parol xavfsizlik talablariga mos emas.
Parol:
✅Kamida 8 ta belgidan iborat bo'lishi;
✅Kamida 1 katta harfdan iborat bo'lishi;
✅Kamida 1 ta raqamdan iborat bo'lishi;
Shart!</b>`);
        await ctx.scene.reenter();
        return;
      }
      await ctx.replyWithHTML("<b>⏳Iltimos biroz kuting....</b>");
      await next();
    },
    async (ctx) => {
      await ctx.scene.session.provider.ChangePassword(
        ctx.scene.session.password
      );
      ctx.replyWithHTML(
        `<b>Parolingiz muvoffaqiyatli almashtirildi.
Eski parol: ${PasswordStrToShowable(ctx.UserData.StudentData.password)};
Yangisi: ${PasswordStrToShowable(ctx.scene.session.password)};
Qayta /start buyrug'ini yuborish orqali tizimga qaytadan kiring.
</b>`,
        Markup.removeKeyboard()
      );
      await ctx.scene.leave();
      await UserModel.updateOne(
        { _id: ctx.UserData._id },
        { $set: { role: "User" } }
      );
    }
  )
);

scene.enter(async (ctx) => {
  ctx.scene.session.provider = new ReferenceProvider(ctx.UserData);
  await ctx.replyWithHTML("<b>Yangi parol kiriting: </b>");
});

function PasswordStrToShowable(password: string): string {
  return (
    "".padEnd(password.length - 4, "*") +
    password.substring(password.length - 4)
  );
}

export default scene;
