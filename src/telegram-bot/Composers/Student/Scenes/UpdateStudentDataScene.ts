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
interface MySessionData extends Scenes.WizardSessionData {
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
    name: "Tug'ulgan sanangiz",
    message: (e) =>
      `Tug'ulgan sanangizni kiriting[DD.MM.YYYY](${e ?? "Noma'lum"}):`,
    paramName: "birthDate",
    checkMethod: <T extends string>(s: T): boolean => {
      let b = new RegExp(/^([0-9]{2}.[0-9]{2}.[0-9]{4})$/gm).test(s);
      if (!b) return b;
      const [d, m, y] = s.split(".").map((x) => Number.parseInt(x));
      if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1900 && y < 2100)
        return true;
      else return false;
    },
  },
  {
    name: "Jins",
    message: (e) => `Jinsingizni tanlang[Erkak | Ayol](${e ?? "Noma'lum"}):`,
    paramName: "gender",
    checkMethod: <T extends string>(s: T): boolean => {
      if (s == "Erkak" || s == "Ayol") return true;
      else return false;
    },
    replyMarkup: ["Erkak", "Ayol"],
  },
  {
    name: "JSHSHIR",
    message: (e) =>
      `JSHSHIR raqamingizni yuboring[14 ta raqam](${e ?? "Noma'lum"}):`,
    paramName: "jshshir",
    checkMethod: <T extends string>(s: T): boolean => {
      return new RegExp(/^([0-9]{14})$/gm).test(s);
    },
    
  },
  {
    name: "Ijara uy narxi",
    message: (e) =>
      `Ijarada turgan uyingizning narxini yuboring[faqat raqamlarda va so'mda](${
        e ?? "Noma'lum"
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
      return new RegExp(/^([a-zA-z0-9@#$%^&*`'"><>< ]+)$/gm).test(s);
    },
  },
  {
    name: "Ijara uy manzili",
    message: (e) =>
      `Ijarada turgan uyingizning manzilini yuboring(${e ?? "Noma'lum"}):`,
    paramName: "rent.location.address",
    checkMethod: <T extends string>(s: T): boolean => {
      return new RegExp(/^([a-zA-z0-9@#$%^&*`'"><>< ]+)$/gm).test(s);
    },
  },
  {
    name: "STIR",
    message: (e) =>
      `STIR raqamingizni yuboring[faqat raqamlarda](${e ?? "Noma'lum"}):`,
    paramName: "rent.stir",
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
      return new RegExp(/^([a-zA-z0-9@#$%^&*`'"><>< ]+@[a-zA-z0-9]+\.[a-zA-Z]+)$/gm).test(s);
    },
  },
];

const scene = new Scenes.WizardScene<MyWizardContext>(
  "UpdateStudentData",
  new Composer<MyWizardContext>()
    .on("callback_query", async (ctx) => {
      let step = Steps.find((x) => x.paramName == ctx.callbackQuery.data);
      if (!step) {
        ctx.replyWithHTML("<b>❌Noma'lum xatolik</b>");
        ctx.scene.leave();
        return;
      }
      await ctx.editMessageReplyMarkup({ inline_keyboard: new Array() });
      ctx.scene.session.currentStep = step;
      ctx
        .replyWithHTML(
          `<b> ${step.message(ctx.UserData.StudentData[step.paramName])}</b>`,
          {
            reply_markup: Markup.keyboard([
              step.replyMarkup ?? [],
              ["❌Bekor qilish"],
            ]).resize(true).reply_markup,
          }
        )
        .then((x) => {
          setTimeout(() => {
            ctx.deleteMessage(x.message_id);
            ctx.scene.leave();
          }, 60000);
        });
      ctx.wizard.next();
    })
    .on("message", async (ctx) => {
      ctx.scene.leave();
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
      ctx.UserData.StudentData = (
        await StudentModel.findOneAndUpdate(
          { _id: ctx.UserData.StudentData._id },
          { $set: { [step.paramName]: ctx.message.text } },
          { upsert: true, returnDocument: "after" }
        )
      ).value;
      await UserModel.updateOne(
        { _id: ctx.UserData._id },
        { $set: ctx.UserData },
        { upsert: true }
      );
      ctx.replyWithHTML("<b>✅Ma'lumotlaringiz saqlandi</b>", {
        reply_markup: HomeMarkup,
      });
      ctx.scene.leave();
    })
    .on("contact", async (ctx) => {
      let step = ctx.scene.session.currentStep;
      if (!step) ctx.scene.leave();
      ctx.UserData.StudentData[step.paramName] = ctx.message.contact;
      ctx.UserData.StudentData = (
        await StudentModel.findOneAndUpdate(
          { _id: ctx.UserData.StudentData._id },
          { $set: { [step.paramName]: ctx.message.contact } },
          { upsert: true, returnDocument: "after" }
        )
      ).value;
      await UserModel.updateOne(
        { _id: ctx.UserData._id },
        { $set: ctx.UserData },
        { upsert: true }
      );
      ctx.replyWithHTML("<b>✅Ma'lumotlaringiz saqlandi</b>", {
        reply_markup: HomeMarkup,
      });
      ctx.scene.leave();
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
  let keyboard: InlineKeyboardButton[] = Steps.map((x) => {
    return {
      text: "✏️" + x.name,
      callback_data: x.paramName,
    };
  });
  ctx
    .editMessageReplyMarkup({
      inline_keyboard: ArrayChunk(keyboard, 3),
    })
    .catch();
});

scene.use(
  Composer.catch(async (err, ctx) => {
    await ctx.scene.leave();
    throw err;
  })
);

export default scene;
