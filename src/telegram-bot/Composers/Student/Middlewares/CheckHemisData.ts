import MyContext from "../../../Interfaces/MyContext";
import UserModel, { HemisDataType } from "../../../Models/UserModel";
import GetHemisData from "../../User/other/GetStudentDataFromHemis";
import {
  IncorrectLoginAndPassword,
  StudentNotFoundError,
} from "../../User/Errors/Errors";

async function CheckHemisData(ctx: MyContext, next) {
  if (!ctx.UserData.HemisData) {
    // Bu yerda talabaning ma'lumotlari hemis tizimidan olinadi
    UserModel.updateOne({ _id: ctx.UserData._id }, { $set: { role: "User" } });
    await ctx.replyWithHTML(
      "<b>HEMIS tizimidagi ma'lumotlaringizni olish bo'yicha muammo yuzaga keldi. Iltimos /start buyrug'i orqali tizimga qaytadan kiring!</b>"
    );
    return;
  }
  next();
}

export default CheckHemisData;
