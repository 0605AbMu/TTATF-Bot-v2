import { Composer, Markup, Scenes, session } from "telegraf";
import MyContext from "../../Interfaces/MyContext";
import UserModel from "../../Models/UserModel";

//Middlewares
import { CheckStudentLoginAndPasswordForExists } from "./Middlewares/CheckHemisDataOfStudent";

// Markups
import { HomeMarkup, UpdateStudentDataMarkup } from "./Constants/Markups";

// Buttons
import { Home } from "./Constants/Buttons";

// Scenes
import GetReferenceScene from "./Scenes/GetReferenceScene";
import ChangePassword from "./Scenes/ChangeStudentPasswordScene";
import GetAggrementDocumentScene from "./Scenes/GetAggrementDocumentScene";
import UpdateStudentDataScene from "./Scenes/UpdateStudentDataScene";

import logger from "../../../logger/logger";

const Student = new Composer<MyContext>();

Student.use(session());
Student.use(
  new Scenes.Stage([
    GetReferenceScene,
    ChangePassword,
    GetAggrementDocumentScene,
    UpdateStudentDataScene,
  ]).middleware()
);

// Parol va logini mavjud ekanligini tekshiradi!
Student.use(CheckStudentLoginAndPasswordForExists);

Student.start(async (ctx) => {
  ctx.replyWithHTML(
    `<b>👋Assalomu alaykum ${ctx.UserData.StudentData.HemisData.short_name}. Xush kelibsiz!</b>`,
    {
      reply_markup: HomeMarkup,
    }
  );
});

Student.hears(Home.Reference, async (ctx) => {
  try {
    await ctx.scene.enter("GetReferenceScene");
  } catch (error) {
    await ctx.replyWithHTML(`<b>❌Xatolik: ${error.message}</b>`);
    logger.LogError(error);
  }
});

Student.hears(Home.Contact, async (ctx) => {
  await ctx.replyWithHTML(`<b>${"☎️Telefon:".padEnd(15)} +998....;
${"📩E-mail:".padEnd(15)} ....@...uz;
${"🌐Web-sayt:".padEnd(15)} www.ttatf.uz</b>;`);
});

Student.hears(Home.Exit, async (ctx) => {
  await UserModel.updateOne(
    { _id: ctx.UserData._id },
    {
      $set: { StudentData: null, role: "User" },
    }
  );
  await ctx.replyWithHTML(
    `<b>Tizimdan chiqildi!\n/start buyrug'ini yuboring</b>`,
    Markup.removeKeyboard()
  );
});

Student.hears(Home.AboutMySelf, async (ctx, next) => {
  const data = ctx.UserData.StudentData.HemisData;
  const privateData = ctx.UserData.StudentData;
  const s = `<b>F.I.O: ${data.full_name};
Login: <code>${data.student_id_number}</code>;
🔵-- <code>Shaxsiy Ma'lumotlar</code> --
Tug'ulgan sanasi: ${privateData.birthDate?.toDateString() ?? "❌noma'lum"};
Jinsi: ${privateData.gender ?? "❌noma'lum"};
Ijaradagi uy joylashuvi: ${
    privateData.rent
      ? `${privateData.rent?.location?.city ?? "❌noma'lum"}, ${
          privateData.rent?.location?.street ?? "❌noma'lum"
        }`
      : "❌noma'lum"
  };
Ijaradagi uy narxi: ${privateData.rent?.amount ?? "❌noma'lum"};
STIR: ${privateData.stir ?? "❌noma'lum"};
JSHSHIR: ${privateData.jshshir ?? "❌noma'lum"};
E-mail: <code>${privateData.email ?? "❌noma'lum"};</code>
Telefon: <code>${privateData.phone ?? "❌noma'lum"};</code>
Telegram raqami: <code>${
    privateData.tgPhone?.phone_number ?? "❌noma'lum"
  };</code>
🟢-- <code>Hemis Ma'lumotlari</code> --
O'rtacha GPA: ${data.avg_gpa};
Kredit: ${data.total_credit};
Kurs: ${data.level.name};
Manzil: ${data.address};
Tuman: ${data.district.name};
Viloyat: ${data.province.name};
Holati: ${data.studentStatus.name};
</b>`;

  try {
    if (ctx.UserData.StudentData.HemisData.image != "")
      await ctx.replyWithPhoto(
        {
          url: ctx.UserData.StudentData.HemisData.image,
          filename: ctx.UserData.StudentData.HemisData.short_name,
        },
        {
          caption: s,
          parse_mode: "HTML",
          reply_to_message_id: ctx.message.message_id,
          reply_markup: UpdateStudentDataMarkup.reply_markup,
        }
      );
    else
      await ctx.replyWithHTML(s, {
        reply_markup: UpdateStudentDataMarkup.reply_markup,
      });
  } catch (error) {
    throw error;
  }
});

Student.hears(Home.Shartnoma, async (ctx) => {
  await ctx.scene.enter("GetAggrementDocument", { paramName: "ctx" });
});

Student.action("updateMyData", async (ctx) => {
  await ctx.scene.enter("UpdateStudentData", ctx);
});

export default Student;
