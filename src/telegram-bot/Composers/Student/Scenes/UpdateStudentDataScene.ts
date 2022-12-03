import { Composer, Context, Markup, Scenes, Telegraf } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { ReferenceProvider } from "../../../Services/ReferenceProvider";
import PasswordChecker from "../../../Services/PasswordChecker";
import UserModel from "../../../Models/UserModel";

import { InlineMarkupOnStudentDataUpdating } from "../Constants/Markups";

import AggMakerService from "../../../Services/Aggrement Maker Service/service";
import AggFileBucket from "../../../Models/AggrementFilesBucket";
import { InlineKeyboardButton, KeyboardButton, Message } from "telegraf/types";
import StudentModel, { IStudent, Student } from "../../../Models/StudentModel";
import { HomeMarkup } from "../Constants/Markups";
import { ArrayChunk } from "../Util/Array";
import logger from "../../../../logger/logger";
import _ from "lodash";
interface MySessionData extends Scenes.WizardSessionData {
  changes: { key: string, value: any }[]
  provider: ReferenceProvider;
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
  checkMethod: Function;
  paramName: string;
  replyMarkup?: KeyboardButton[];
};

const Steps: TStep[] = [
  {
    name: "Ijara uy narxi",
    message: (e) =>
      `Ijarada turgan uyingizning narxini yuboring[faqat raqamlarda va so'mda](${e ?? "Noma'lum"
      }):`,
    paramName: "rent.amount",
    checkMethod: <T extends string>(s: T): boolean => {
      return new RegExp(/^([0-9]+)$/gm).test(s);
    },
  },
  {
    name: "Telefon raqam",
    message: (e) =>
      `Telefon raqamingizni yuboring[+998911234567](${e ?? "Noma'lum"}):`,
    paramName: "phone",
    checkMethod: <T extends string>(s: T): boolean => {
      return (
        new RegExp(/^([0-9]{9})$/gm).test(s) ||
        new RegExp(/^\+998([0-9]{9})$/gm).test(s)
      );
    },
  },
  {
    name: "Ijarada turgan shahringiz",
    message: (e) => `Qaysi shahrda ijaraga turasiz?(${e ?? "Noma'lum"}):`,
    paramName: "rent.location.city",
    checkMethod: <T extends string>(s: T): boolean => {
      return true;
    },
  },
  {
    name: "Ijara uy manzili",
    message: (e) =>
      `Ijarada turgan uyingizning manzilini yuboring(${e ?? "Noma'lum"}):`,
    paramName: "rent.location.address",
    checkMethod: <T extends string>(s: T): boolean => {
      return true;
    },
  },
  {
    name: "STIR",
    message: (e) =>
      `STIR raqamingizni yuboring[faqat raqamlarda](${e ?? "Noma'lum"}):`,
    paramName: "stir",
    checkMethod: <T extends string>(s: T): boolean => {
      return new RegExp(/^([0-9]+)$/gm).test(s);
    },
  },
  {
    name: "Telegram raqami",
    message: (e) =>
      `Telegram raqamingizni ulashing[faqat tugma orqali](${e ?? "Noma'lum"}):`,
    paramName: "tgPhone",
    checkMethod: <T extends string>(s: T): boolean => {
      return true;
    },
    replyMarkup: [Markup.button.contactRequest("Telefon raqamimni ulashish")],
  },
  {
    name: "E-mail",
    message: (e) => `E-mail manzilingizni yuboring(${e ?? "Noma'lum"}):`,
    paramName: "email",
    checkMethod: <T extends string>(s: T): boolean => {
      return new RegExp(
        /^([a-zA-z0-9@#$%^&*`'"><>< ]+@[a-zA-z0-9]+\.[a-zA-Z]+)$/gm
      ).test(s);
    },
  },
];

const scene = new Scenes.WizardScene<MyWizardContext>(
  "UpdateStudentData",
  new Composer<MyWizardContext>()
    .action("save", async ctx => {
      ctx.scene.session.changes.forEach(x => {
        _.set(ctx.UserData.StudentData, x.key, x.value);
      })
      ctx.UserData.StudentData = (
        await StudentModel.findOneAndUpdate(
          { _id: ctx.UserData.StudentData._id },
          { $set: ctx.UserData.StudentData },
          { upsert: true, returnDocument: "after" }
        )
      ).value;
      await UserModel.updateOne(
        { _id: ctx.UserData._id },
        { $set: ctx.UserData },
        { upsert: true }
      );
      await ctx.replyWithHTML("<b>✅Ma'lumotlar saqlandi!</b>", {
        reply_markup: HomeMarkup,
      });
      await ctx.scene.leave();
    })
    .on("callback_query", async (ctx) => {
      let step = Steps.find((x) => x.paramName == ctx.callbackQuery.data);
      if (!step) {
        ctx.replyWithHTML("<b>❌Noma'lum xatolik</b>");
        ctx.scene.leave();
        return;
      }
      // await ctx.editMessageReplyMarkup({ inline_keyboard: new Array() });
      ctx.scene.session.currentStep = step;
      await ctx
        .replyWithHTML(
          `<b> ${step.message(ctx.UserData.StudentData[step.paramName])}</b>`,
          {
            reply_markup: Markup.keyboard([
              step.replyMarkup ?? [],
              ["❌Bekor qilish"],
            ]).resize(true).oneTime(true).reply_markup,
          }
        );
      ctx.wizard.next();
    })
    .on("message", async (ctx) => {
      await ctx.replyWithHTML(`<b>Noto'g'ri ma'lumot yubordingiz!</b>`);
    }),

  new Composer<MyWizardContext>()
    .hears("❌Bekor qilish", async (ctx) => {
      ctx.replyWithHTML("<b>Bekor qilindi!</b>", {
        reply_markup: HomeMarkup,
      });
      ctx.scene.leave();
    })
    .on(["text"], async (ctx) => {
      let step = ctx.scene.session.currentStep;
      if (!step) ctx.scene.leave();
      if (step.checkMethod)
        if (!step.checkMethod(ctx.message.text)) {
          ctx
            .replyWithHTML("<b>⚠️Noto'g'ri formatda ma'lumot yubordingiz</b>")
            .catch()
            .then((res) =>
              setTimeout(() => {
                ctx.deleteMessage(res.message_id).catch();
              }, 3000)
            );
          return;
        }
      ctx.scene.session.changes.push({ key: step.paramName, value: ctx.message.text });
      await ctx.replyWithHTML("<b>✅Ma'lumot qabul qilindi</b>", {
        reply_markup: Markup.inlineKeyboard([{ callback_data: "save", text: "✅Saqlash va chiqish" }]).reply_markup
      });
      await ctx.wizard.back();
    })
    .on("contact", async (ctx) => {
      let step = ctx.scene.session.currentStep;
      if (!step) ctx.scene.leave();

      ctx.scene.session.changes.push({ key: step.paramName, value: ctx.message.contact });
      await ctx.replyWithHTML("<b>✅Ma'lumot qabul qilindi</b>", {
        reply_markup: Markup.inlineKeyboard([{ callback_data: "save", text: "Saqlash va chiqish" }]).reply_markup
      });
      await ctx.wizard.back();
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
  ctx.scene.session.changes = [];
  let keyboard: InlineKeyboardButton[] = Steps.map((x) => {
    return {
      text: "✏️" + x.name,
      callback_data: x.paramName,
    };
  });
  keyboard.push({ text: "✅Saqlash va chiqish", callback_data: "save" });
  ctx
    .editMessageReplyMarkup({
      inline_keyboard: ArrayChunk(keyboard, 3),
    })
    .catch();
  await ctx.replyWithHTML(`<b>Ma'lumotlarni tahrirlab bo'lib saqlash va chiqish tugmasini bosing</b>`,
    {
      reply_markup: Markup.removeKeyboard().reply_markup
    });
});

scene.use(
  Composer.catch(async (err, ctx) => {
    logger.LogError(<Error>err);
    await ctx.scene.leave();
    ctx.replyWithHTML(`<b>❌Xatolik: ${(<Error>err).message}</b>`, {
      reply_markup: HomeMarkup,
    });
  })
);

export default scene;
