import { Composer, session } from "telegraf";
import MyContext from "../../Interfaces/MyContext";
import UserModel from "../../Models/UserModel";

//Middlewares
import CheckHemisData from "./Middlewares/CheckHemisData";

// Markups
import { HomeMarkup } from "./Constants/Markups";

const Student = new Composer<MyContext>();

Student.use(session());

//
// Student.use(CheckHemisData);

Student.start(async (ctx) => {
  await ctx.replyWithHTML(
    `Assalomu alaykum. Xush kelibsiz!`,
    {
      reply_markup: HomeMarkup,
    }
  );
});

export default Student;
