import { Composer, Markup, Scenes, Telegraf } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { ReferenceProvider } from "../../../Services/ReferenceProvider";
import PasswordChecker from "../../../Services/PasswordChecker";
import UserModel from "../../../Models/UserModel";

import { InlineMarkupOnStudentDataUpdating } from "../Constants/Markups";

import AggMakerService from "../../../Services/Aggrement Maker Service/service";
import AggFileBucket from "../../../Models/AggrementFilesBucket";
import { Message } from "telegraf/types";
import StudentModel, { IStudent } from "../../../Models/StudentModel";

interface MySessionData extends Scenes.WizardSessionData {
  //   provider: ReferenceProvider;
  regex?: RegExp;
  stepIndex: number;
  targetMessage: Message;
  isChanged: boolean;
}
interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const Steps: {
  message: Function;
  regex: RegExp;
  paramName: string;
  errorMessage: string;
}[] = [
  {
    message: (e, errorMessage) =>
      `${
        errorMessage ? errorMessage + "\n" : ""
      }Tug'ulgan sanangizni MM.DD.YYYY formatda kiriting(${e ?? "Noma'lum"}):`,
    regex: new RegExp(/^([0-9]{2}.[0-9]{2}.[0-9]{4})$/gm),
    paramName: "birthDate",
    errorMessage: null,
  },
];

const scene = new Scenes.WizardScene<MyWizardContext>(
  "UpdateStudentData",
  // Ma'lumotni yozib qo'yuvchi
  new Composer<MyWizardContext>()
    .on("text", async (ctx) => {
      let step = Steps[ctx.scene.session.stepIndex];
      if (!step) {
        ctx.scene.leave();
      }

      if (step?.regex)
        if (!Steps[ctx.scene.session.stepIndex]?.regex.test(ctx.message.text)) {
          step.errorMessage = "Noto'g'ri qiymat kiritdingiz";
          ctx.scene.reenter();
          return;
        }

      ctx.UserData.StudentData[step.paramName] = ctx.message.text;

      try {
        await ctx.deleteMessage();
      } catch (error) {}

      if (Steps.length > ctx.scene.session.stepIndex + 1) {
        ctx.scene.session.stepIndex++;
        ctx.scene.session.isChanged = true;
        ctx.scene.reenter();
      } else if (ctx.scene.session.isChanged == true) {
        await StudentModel.updateOne(
          { login: ctx.UserData.StudentData.login },
          { $set: ctx.UserData.StudentData as IStudent },
          { upsert: true, ignoreUndefined: false, checkKeys: false }
        );
        if (ctx.scene.session.targetMessage)
          await ctx.telegram.editMessageText(
            ctx.scene.session.targetMessage.chat.id,
            ctx.scene.session.targetMessage.message_id,
            undefined,
            "<b>Ma'lumotlaringiz muvoffaqiyatli yangilandi</b>",
            {
              parse_mode: "HTML",
            }
          );
        else
          await ctx.replyWithHTML(
            "<b>Ma'lumotlaringiz muvoffaqiyatli yangilandi</b>"
          );
      } else {
        await ctx.replyWithHTML("<b>Ma'lumotlar yangilab bo'lindi!</b>");
        await ctx.scene.leave();
      }
    })
    .action("next", (ctx) => {})
    .action("cancel", (ctx) => {})
);

scene.use(
  Telegraf.hears(/\/\w*/gm, (ctx, next) => {
    ctx.scene.leave();
  })
);

scene.use(
  Telegraf.action("next", async (ctx) => {
    await ctx.wizard.next();
  })
);

scene.use(
  Telegraf.action("cancel", async (ctx) => {
    await ctx.deleteMessage();
    ctx.answerCbQuery("❌Bekor qilindi!");
    ctx.scene.leave();
  })
);

scene.enter(async (ctx, next) => {
  console.log(ctx.scene.session.stepIndex);
  if (!ctx.scene.session.stepIndex) ctx.scene.session.stepIndex = 0;
  let step = Steps[ctx.scene.session.stepIndex];
  ctx.scene.session;
  if (ctx.scene.session.targetMessage)
    await ctx.telegram.editMessageText(
      ctx.scene.session.targetMessage.chat.id,
      ctx.scene.session.targetMessage.message_id,
      undefined,
      step.message(ctx.UserData.StudentData[step.paramName], step.errorMessage),
      {
        parse_mode: "HTML",
        reply_markup: InlineMarkupOnStudentDataUpdating.reply_markup,
      }
    );
  else {
    ctx.scene.session.targetMessage = await ctx.replyWithHTML(
      step.message(ctx.UserData.StudentData[step.paramName], step.errorMessage),
      {
        reply_markup: InlineMarkupOnStudentDataUpdating.reply_markup,
      }
    );
  }
});

scene.use(
  Composer.catch(async (err, ctx) => {
    await ctx.scene.leave();
    throw err;
  })
);

export default scene;
