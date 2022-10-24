import MyContext from "../../../Interfaces/MyContext";
import UserModel, { HemisDataType } from "../../../Models/UserModel";
import GetHemisData from "../../User/other/GetStudentDataFromHemis";
import {
  IncorrectLoginAndPassword,
  StudentNotFoundError,
} from "../../User/Errors/Errors";
import axios, { Axios } from "axios";

let StudentListOfHemis = {
  lastUpdatedDate: (Date = null),
  list: Array<any>,
};

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

async function UpdateHemisData() {
  console.log("Updating...");
  const axios = new Axios({
    baseURL: "https://student.ttatf.uz/rest/",
    headers: {
      Authorization: "Bearer 702M2NPGcATxMoiPDkoF2xOAvP2fSve",
    },
  });

  const result = await axios.get("/v1/data/student-list");
  console.log(result);
}

UpdateHemisData();

export default CheckHemisData;
