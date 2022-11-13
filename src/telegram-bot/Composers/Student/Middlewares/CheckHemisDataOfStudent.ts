import MyContext from "../../../Interfaces/MyContext";
import UserModel from "../../../Models/UserModel";
import HemisDataModel from "../../../Models/HemisDataModel";
import { Markup } from "telegraf";
import StudentModel from "../../../Models/StudentModel";

export async function CheckStudentLoginAndPasswordForExists(
  ctx: MyContext,
  next
) {
  if (ctx.UserData.StudentData === null) {
    await UserModel.updateOne(
      { _id: ctx.UserData._id },
      { $set: { StudentData: null, role: "User" } }
    );
    await ctx.replyWithHTML(
      "<b>Ma'lumotlaringizda xatolik mavjud!\n/start buyrug'ini yuboring!</b>",
      Markup.removeKeyboard()
    );
    return;
  }
  next(); 
}
