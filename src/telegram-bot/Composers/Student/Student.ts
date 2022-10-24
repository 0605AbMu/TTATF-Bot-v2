import { Composer, Scenes, session } from "telegraf";
import MyContext from "../../Interfaces/MyContext";
import UserModel from "../../Models/UserModel";

//Middlewares
import CheckHemisData from "./Middlewares/CheckHemisData";

// Markups
import { HomeMarkup } from "./Constants/Markups";

// Buttons
import { Home } from "./Constants/Buttons";

// Scenes
import GetReferenceScene from "./Scenes/GetReferenceScene";

const Student = new Composer<MyContext>();

Student.use(session());
Student.use(new Scenes.Stage([GetReferenceScene]));

Student.start(async (ctx) => {
  await ctx.replyWithHTML(`Assalomu alaykum. Xush kelibsiz!`, {
    reply_markup: HomeMarkup,
  });
});

Student.hears(Home.Reference, async (ctx) => {
  try {
    await ctx.scene.enter("GetReferenceScene");
  } catch (error) {
    ctx.replyWithHTML(`<b>Xatolik:\n${error.message}</b>`);
    throw error;
  }
});

export default Student;
