import { Composer, Markup, Scenes, session } from "telegraf";
import MyContext from "../../Interfaces/MyContext";
// Models
import HemisDataModel from "../../Models/HemisDataModel";

// Services
import GetAllDataFromHemis from "../../Services/GetAllDataFromHemis";

// Scenes
import Reg from "./Scenes/Reg";
import UpdateAllHemisDataScene from "./Scenes/UpdateAllHemisDataScene";

// Contants
import { Home } from "./Constants/Buttons";
import { HomeMarkup } from "./Constants/Markups";

// Utils
import { TryCatch } from "../../Services/Util";
import UserModel from "../../Models/UserModel";

const Admin = new Composer<MyContext>();
Admin.use(session());
Admin.use(new Scenes.Stage([Reg, UpdateAllHemisDataScene]));

Admin.start(async (ctx) => {
  await ctx.replyWithHTML(
    "<b>Assalomu alaykum. Admin panelga xush kelibsiz!</b>",
    HomeMarkup
  );
});

Admin.hears(Home.UpdateStudentData, async (ctx) => {
  try {
    await ctx.scene.enter("UpdateAllHemisData");
  } catch (error) {
    ctx.replyWithHTML(`<b>❌Xatolik:\n${error.message}</b>`);
  }
});

Admin.hears(Home.Exit, async (ctx) => {
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

export default Admin;
