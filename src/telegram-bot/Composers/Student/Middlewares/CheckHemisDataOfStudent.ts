import MyContext from "../../../Interfaces/MyContext";
import UserModel from "../../../Models/UserModel";
import HemisDataModel from "../../../Models/HemisDataModel";
import { Markup } from "telegraf";

export async function CheckHemisDataOfStudent(ctx: MyContext, next) {
  const result = await HemisDataModel.findOne({
    student_id_number: ctx.UserData.StudentData.login,
  });
  if (result != null)
    UserModel.updateOne(
      { _id: ctx.UserData._id },
      {
        $set: {
          StudentData: {
            HemisData: result,
            login: ctx.UserData.StudentData.login,
            password: ctx.UserData.StudentData.password,
          },
        },
      }
    );
  else {
    await ctx.replyWithHTML(
      "<b>Sizning ma'lumotlaringiz topilmadi!</b>",
      Markup.removeKeyboard()
    );
    return;
  }
  next();
}

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
  }
  next();
}
