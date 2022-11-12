import { Composer, Markup, Scenes, Telegraf } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { ReferenceProvider } from "../../../Services/ReferenceProvider";
import PasswordChecker from "../../../Services/PasswordChecker";
import UserModel from "../../../Models/UserModel";

import { InlineMarkupOnStudentDataUpdating } from "../Constants/Markups";

import AggMakerService from "../../../Services/Aggrement Maker Service/service";
import AggFileBucket from "../../../Models/AggrementFilesBucket";
import { InlineKeyboardButton, Message } from "telegraf/types";
import StudentModel, { IStudent } from "../../../Models/StudentModel";

interface MySessionData extends Scenes.WizardSessionData {
  //   provider: ReferenceProvider;
  regex?: RegExp;
  stepIndex: number;
  targetMessage: Message;
  currentStep: TStep;
  isChanged: boolean;
}
interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}
type TStep = {
  name: string;
  message: Function;
  regex: RegExp;
  paramName: string;
  errorMessage: string;
};

const Steps: TStep[] = [
  {
    name: "Tug'ulgan sanangiz",
    message: (e, errorMessage) =>
      `${
        errorMessage ? errorMessage + "\n" : ""
      }Tug'ulgan sanangizni MM.DD.YYYY formatda kiriting(${e ?? "Noma'lum"}):`,
    regex: new RegExp(/^([0-9]{2}.[0-9]{2}.[0-9]{4})$/gm),
    paramName: "birthDate",
    errorMessage: null,
  },
];

let keyboard: InlineKeyboardButton[][] = [
  Steps.map((x) => {
    return {
      text: x.name,
      callback_data: x.paramName,
    };
  }),
  [{ text: "♻️Saqlash", callback_data: "save" }],
];

const scene = new Scenes.WizardScene<MyWizardContext>(
  "UpdateStudentData",
  new Composer<MyWizardContext>()
    .action("save", async (ctx) => {})
    .on("callback_query", async (ctx) => {
      let step = Steps.find((x) => (x.paramName = ctx.callbackQuery.data));
      if (!step) ctx.scene.reenter();
      ctx.scene.session.currentStep = step;
      await ctx.replyWithHTML(
        step.message(
          ctx.UserData.StudentData?.[step.paramName],
          step.errorMessage
        ),
        {
          reply_markup: Markup.inlineKeyboard([
            { text: "Bekor qilish", callback_data: "cancel" },
          ]).reply_markup,
        }
      );
      ctx.wizard.next();
    }),
  new Composer<MyWizardContext>()
    .action("cancel", async (ctx) => {
      ctx.deleteMessage();
      ctx.scene.reenter();
    })
    .on("text", async (ctx) => {
      let step = ctx.scene.session.currentStep;
      if (!step) ctx.scene.reenter();
      if (step.regex)
        if (!step.regex.test(ctx.message.text)) {
          ctx
            .replyWithHTML("<b>Noto'g'ri formatda ma'lumot yubordingiz: </b>")
            .catch()
            .then((res) =>
              setTimeout(() => {
                ctx.deleteMessage(res.message_id).catch();
              }, 3000)
            );
          ctx.telegram.editMessageReplyMarkup(
            ctx.scene.session.targetMessage.chat.id,
            ctx.scene.session.targetMessage.message_id,
            undefined,
            {
              inline_keyboard: keyboard,
            }
          );
        }
      ctx.UserData.StudentData[step.paramName] = ctx.message.text;
      ctx.deleteMessage().catch();
      ctx.scene.reenter();
    })
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

scene.enter(async (ctx) => {
  ctx
    .editMessageReplyMarkup({
      inline_keyboard: keyboard,
    })
    .catch();
  ctx.scene.session.targetMessage = ctx.message;
});

// scene.enter(async (ctx, next) => {
//   if (!ctx.scene.session.stepIndex) ctx.scene.session.stepIndex = 0;
//   let step = Steps[ctx.scene.session.stepIndex];
//   console.log(ctx.session.__scenes.targetMessage);
//   if (ctx.scene.session.targetMessage)
//     await ctx.telegram.editMessageText(
//       ctx.scene.session.targetMessage.chat.id,
//       ctx.scene.session.targetMessage.message_id,
//       undefined,
//       step.message(ctx.UserData.StudentData[step.paramName], step.errorMessage),
//       {
//         parse_mode: "HTML",
//         reply_markup: InlineMarkupOnStudentDataUpdating.reply_markup,
//       }
//     );
//   else {
//     ctx.scene.session.targetMessage = await ctx.replyWithHTML(
//       step.message(ctx.UserData.StudentData[step.paramName], step.errorMessage),
//       {
//         reply_markup: InlineMarkupOnStudentDataUpdating.reply_markup,
//       }
//     );
//   }
// });

scene.use(
  Composer.catch(async (err, ctx) => {
    await ctx.scene.leave();
    throw err;
  })
);

export default scene;
