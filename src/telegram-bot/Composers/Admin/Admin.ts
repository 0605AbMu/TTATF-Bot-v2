import { Composer, Markup, Scenes, session } from "telegraf";
import MyContext from "../../Interfaces/MyContext";
// Models
import HemisDataModel from "../../Models/HemisDataModel";

// Services
import GetAllDataFromHemis from "../../Services/GetAllDataFromHemis";
import GetAllScheduleListData from "../../Services/GetAllScheduleListsFromHemis";
// Scenes
import Reg from "./Scenes/Reg";
import UpdateAllHemisDataScene from "./Scenes/UpdateAllHemisDataScene";
import UpdateStudentPasportData from "./Scenes/UpdateStudentPasportDataScene";
import SendMessageToAll from "./Scenes/SendMessageToAllScene";
import UpdateStudentLocationData from "./Scenes/UpdateStudentLocationDataScene";
// Contants
import { Home } from "./Constants/Buttons";
import { HomeMarkup } from "./Constants/Markups";

// Utils
import { TryCatch } from "../../Services/Util";
import UserModel from "../../Models/UserModel";
import ScheduleListModel from "../../Models/ScheduleListModel";
import logger from "../../../logger/logger";

const Admin = new Composer<MyContext>();
Admin.use(session());
Admin.use(
  new Scenes.Stage([
    Reg,
    UpdateAllHemisDataScene,
    UpdateStudentPasportData,
    SendMessageToAll,
    UpdateStudentLocationData
  ])
);

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

Admin.hears(Home.Stat, async (ctx) => {
  await ctx.replyWithHTML(`<b>📆Bugungi sana: ${new Date(
    Date.now()
  ).toLocaleDateString()};
📈Jami a'zolar soni: ${await UserModel.countDocuments()} ta;
👨‍🎓Talabalar soni: ${await UserModel.count({ role: "Student" })} ta;</b>`);
});

Admin.hears(Home.UpdateStudentPasportData, async (ctx) => {
  await ctx.scene.enter("UpdateStudentPasportData");
});

Admin.hears(Home.MessageToAll, async (ctx) => {
  await ctx.scene.enter("SendMessageToAll");
});

Admin.hears(Home.UpdateScheduleListData, async (ctx) => {
  try {
    ctx.replyWithHTML(`<b>⏳Biroz kuting...</b>`);
    let data = await GetAllScheduleListData();
    try {
      await ScheduleListModel.deleteMany({});
    } catch (error) { }
    await ScheduleListModel.insertMany(data);
    ctx.replyWithHTML(`<b>✅Ma'lumotlar muvoffaqiyatli yangilandi!</b>`);
  } catch (err) {
    logger.LogError(<Error>err);
    ctx.replyWithHTML(`<b>❌Xatolik: ${(<Error>err).message}</b>`);
  }
});

Admin.hears(Home.UpdateStudentLocationData, async (ctx) => {
  await ctx.scene.enter("UpdateStudentLocationData");
})

Admin.use(
  Composer.catch((err, ctx) => {
    logger.LogError(<Error>err);
    ctx.replyWithHTML(`<b>❌Xatolik: ${(<Error>err).message}</b>`);
  })
);

export default Admin;
