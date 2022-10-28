import { Composer, Markup, Scenes, Telegraf } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import UserModel from "../../../Models/UserModel";
import HemisDataModel from "../../../Models/HemisDataModel";
import { ReferenceProvider } from "../../../Services/ReferenceProvider";
import { HomeKeyboardMarkup } from "../Constants/Markups";

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

const AdminMeta = {
  password: "159357Dax",
  login: "admin",
};

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
    async (ctx, next) => {
      if (
        AdminMeta.login == ctx.scene.session.login &&
        AdminMeta.password == ctx.scene.session.password
      ) {
        await UserModel.updateOne(
          {
            _id: ctx.UserData._id,
          },
          {
            $set: {
              role: "Admin",
            },
          }
        );
        await ctx.replyWithHTML(
          `<b>Tizimga kirdingiz!\n/start buyrug'ini yuboring</b>`
        );
      } else await next();
    },
    async (ctx) => {
      const hemisData = await HemisDataModel.findOne({
        student_id_number: ctx.scene.session.login,
      });
      if (hemisData == null) {
        await ctx.replyWithHTML(
          "<b>Bunday login va parolga ega talaba topilmadi!</b>"
        );
        ctx.scene.leave();
        return;
      }
      ctx.UserData.StudentData = {
        HemisData: hemisData,
        login: ctx.scene.session.login,
        password: ctx.scene.session.password,
      };
      const cookie = await new ReferenceProvider(ctx.UserData).GetCookies();
      if (cookie == null) {
        await ctx.replyWithHTML(
          "<b>Sizning ma'lumotlaringiz topilmadi. Tizimga kira olmaysiz.</b>"
        );
        ctx.scene.leave();
        return;
      }
      const updateResult = await UserModel.updateOne(
        { _id: ctx.UserData._id },
        {
          $set: {
            StudentData: ctx.UserData.StudentData,
            role: "Student",
          },
        }
      );

      if (updateResult.modifiedCount == 0) {
        await ctx.replyWithHTML(
          "<b>Sizning ma'lumotlaringiz topilmadi. Tizimga kira olmadingiz.</b>"
        );
        ctx.UserData.StudentData = null;
        ctx.scene.leave();
        return;
      }

      await ctx.replyWithHTML(
        "<b>Tizimga muvoffaqiyatli kirdingiz. Qayta /start buyrug'ini yuborish orqali botdan foydalanishingiz mumkin.</b>",
        {
          reply_markup: Markup.removeKeyboard().reply_markup,
        }
      );
      ctx.scene.session.isSuccess = true;

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

scene.use(
  Composer.catch((err, ctx) => {
    ctx.scene.leave();
  })
);

export default scene;
