import MyContext from "../../../Interfaces/MyContext";
import UserModel from "../../../Models/UserModel";
import axios, { Axios } from "axios";

const axios = new Axios({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  baseURL: Config.HEMIS_API_URL,
  headers: {
    Authorization: "Bearer " + Config.BEARER_TOKEN_FOR_HEMIS,
  },
  transformResponse: [
    (data, header, status) => {
      return JSON.parse(data);
    },
  ],
});



async function CheckHemisData(ctx: MyContext, next) {
  if (!ctx.UserData.HemisData) {
    UserModel.updateOne({ _id: ctx.UserData._id }, { $set: { role: "User" } });
    await ctx.replyWithHTML(
      "<b>HEMIS tizimidagi ma'lumotlaringizni olish bo'yicha muammo yuzaga keldi. Iltimos /start buyrug'i orqali tizimga qaytadan kiring!</b>"
    );
    return;
  }
  next();
}

async function GetHemisData() {
  console.log("Updating...");
  const axios = new Axios({
    baseURL: "https://student.ttatf.uz/rest/",
    headers: {
      Authorization: "Bearer 702M2NPGcATxMoiPDkoF2xOAvP2fSve",
    },
  });


}


export default CheckHemisData;
