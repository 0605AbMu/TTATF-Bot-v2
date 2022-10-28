import { Composer, Markup, Scenes, session } from "telegraf";
import MyContext from "../../Interfaces/MyContext";
import UserModel from "../../Models/UserModel";

//Middlewares
import {
  CheckHemisDataOfStudent,
  CheckStudentLoginAndPasswordForExists,
} from "./Middlewares/CheckHemisDataOfStudent";

// Markups
import { HomeMarkup } from "./Constants/Markups";

// Buttons
import { Home } from "./Constants/Buttons";

// Scenes
import GetReferenceScene from "./Scenes/GetReferenceScene";
import logger from "../../../logger/logger";

const Student = new Composer<MyContext>();

Student.use(session());
Student.use(new Scenes.Stage([GetReferenceScene]).middleware());

// Parol va logini mavjud ekanligini tekshiradi!
Student.use(CheckStudentLoginAndPasswordForExists);
// Talabaning meta ma'lumotlarini db dan olin UserData ga birlashtiradi
Student.use(CheckHemisDataOfStudent);

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
    await ctx.replyWithHTML(`<b>Xatolik:${error.message}</b>`);
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

Student.use(Composer.catch((err, ctx) => {}));

export default Student;
