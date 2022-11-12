import { Composer, Markup, Scenes, Telegraf } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { ReferenceProvider } from "../../../Services/ReferenceProvider";
import PasswordChecker from "../../../Services/PasswordChecker";
import UserModel from "../../../Models/UserModel";

import AggMakerService from "../../../Services/Aggrement Maker Service/service";
import AggFileBucket from "../../../Models/AggrementFilesBucket";

interface MySessionData extends Scenes.WizardSessionData {
  // password: string;
  // provider: ReferenceProvider;
}
interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "GetAggrementDocument",
  new Composer<MyContext>()
    .on("text", async (ctx) => {
      if (!new RegExp(/^[0-9]+$/gm).test(ctx.message.text)) {
        await ctx.replyWithHTML(
          "<b>Ijara summasini faqat raqamlardan iborat bo'lishi kerak.</b>"
        );
        return;
      }
      let amount = Number.parseFloat(ctx.message.text);

      if (amount < 0) {
        await ctx.replyWithHTML(
          "<b>Ijara summasi qiymati 0 dan katta bo'lishi kerak</b>"
        );
        return;
      }

      ctx.UserData.StudentData.rent = {
        amount: amount,
        location: {
          geo: undefined,
        },
        // location: null,
      };

      await ctx.replyWithHTML(
        "<b>Ijarada turgan manzilingizning joylashuvini yuboring</b>",
        {
          reply_markup: Markup.keyboard(
            [Markup.button.locationRequest("Joylashuvim")],
            { columns: 1 }
          )
            .resize(true)
            .oneTime(true).reply_markup,
        }
      );
      ctx.wizard.next();
    })
    .on("message", async (ctx) => {
      await ctx.replyWithHTML(
        "<b>Ijara summasi qiymati faqat raqamlardan iborat bo'lishi kerak</b>"
      );
      return;
    }),
  new Composer<MyContext>()
    .on("location", async (ctx) => {
      ctx.UserData.StudentData.rent.location = {
        geo: ctx.message.location,
      };
      const result = await AggMakerService.CreateDocumentAsync(
        ctx.UserData.StudentData
      );
      await ctx.replyWithDocument(
        {
          source: AggFileBucket.openDownloadStream(result),
          filename: `${ctx.UserData.StudentData.HemisData.short_name} - Ijara Shartnoma.docx`,
        },
        { reply_to_message_id: ctx.message.message_id }
      );
      ctx.scene.leave();
    })
    .on("message", async (ctx) => {
      await ctx.replyWithHTML(
        "<b>Faqat ijarada turgan manzilingizni tugma orqali yuboring!</b>"
      );
    })
);

scene.use(
  Telegraf.hears(/\/\w*/gm, (ctx, next) => {
    ctx.scene.leave();
  })
);

scene.enter(
  async (ctx, next) => {
    const date = new Date(Date.now());
    await next();
    return;
    if (
      Date.now() <=
      new Date(date.getFullYear(), date.getMonth(), 7, 0, 0, 0, 0).getDate()
    )
      await next();
    else {
      await ctx.replyWithHTML(
        `<b>Shartnomalarni har oyning 7-sanasiga qadar tayyorlash mumkin!</b>`
      );
      ctx.scene.leave();
    }
  },
  async (ctx, next) => {
    if (ctx.UserData.StudentData == undefined)
      throw new Error("Talaba ma'lumotlari mavjud emas!");
    for (let x of Object.keys(ctx.UserData.StudentData)) {
      if (!ctx.UserData.StudentData[x]) {
        ctx.replyWithHTML(
          "<b>Ijara shartnomasini to'ldirish uchun ma'lumotlaringiz yetarli emas. Ma'lumotlaringizni to'ldirib qaytadan harakat qiling!</b>"
        );
        ctx.scene.leave();
        return;
      }
      await next();
    }
  },
  async (ctx, next) => {
    await ctx.replyWithHTML("<b>Ijara summasini kiriting: </b>");
  }
);

scene.use(
  Composer.catch(async (err, ctx) => {
    await ctx.scene.leave();
    throw err;
  })
);

export default scene;
