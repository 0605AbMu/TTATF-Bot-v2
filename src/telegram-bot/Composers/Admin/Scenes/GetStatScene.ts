import { Composer, Markup, Scenes, Telegraf, TelegramError } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { HomeMarkup, StatMarkup } from "../Constants/Markups";
import { StatButton } from "../Constants/Buttons";
import NodeXlsx, { BuildOptions } from "node-xlsx";
import { ObjectDeepParserForKeys, ObjectDeepParserForValues } from "../../../Utils/NestedObjectParser";
import _ from "lodash";

import StudentPassportDataModel, {
  StudentPassportData,
} from "../../../Models/StudentPasportModel";
import StudentModel from "../../../Models/StudentModel";
import HemisDataModel from "../../../Models/HemisDataModel";
import logger from "../../../../logger/logger";
import UserModel from "../../../Models/UserModel";
import EmployeeModel from "../../../Models/EmployeeModel";
import ScheduleListModel from "../../../Models/ScheduleListModel";

interface MySessionData extends Scenes.WizardSessionData {
  //   allHemisData: IHemisData[];
}

interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "GetStat",
  new Composer<MyWizardContext>()
    // Hemis ma'lumotlari
    .hears(StatButton.HemisDatas, async ctx => {
      await ctx.replyWithHTML(`<b>⏳Biroz kuting. Ma'lumotlar tayyorlanyapdi...</b>`);
      let headers = ObjectDeepParserForKeys(await HemisDataModel.findOne());
      let datas = await HemisDataModel.find().map(x => ObjectDeepParserForValues(x)).toArray();
      await ctx.replyWithDocument(
        {
          source: NodeXlsx.build([{ name: "Hemis Datas", data: [headers, ...datas], options: { "!cols": headers.map(x => ({ wch: x.length * 2 })) } }]),
          filename: "Hemis Datas.xlsx"
        }
      )
      await ctx.scene.leave();
    })
    // Bot a'zolari
    .hears(StatButton.BotMembers, async ctx => {
      await ctx.replyWithHTML(`<b>⏳Biroz kuting. Ma'lumotlar tayyorlanyapdi...</b>`);
      let headers = ["_Id", "Role", "Telegram Name", "Telegram @username", "Talaba Id si", "Botga qo'shilgan sanasi"];
      let datas = await UserModel.find().map(x => [x._id, x.role, x.telegamUser.first_name, x.telegamUser.username, x.StudentData?.login, x.registratedDate.toLocaleDateString()]).toArray();
      await ctx.replyWithDocument(
        {
          source: NodeXlsx.build([{ name: "Bot Members Datas", data: [headers, ...datas], options: { "!cols": headers.map(x => ({ wch: x.length + 10 })) } }]),
          filename: "Bot Members Datas.xlsx"
        }
      )
      await ctx.scene.leave();
    })

    // Active student datas
    .hears(StatButton.ActiveStudents, async ctx => {
      await ctx.replyWithHTML(`<b>⏳Biroz kuting. Ma'lumotlar tayyorlanyapdi...</b>`);
      let headers = ["_Id", "Role", "Telegram Name", "Telegram @username", "Talaba Id si", "Botga qo'shilgan sanasi"];
      let datas = await UserModel.find({ role: "Student" }).map(x => [x._id, x.role, x.telegamUser.first_name, x.telegamUser.username, x.StudentData?.login, x.registratedDate.toLocaleDateString()]).toArray();
      await ctx.replyWithDocument(
        {
          source: NodeXlsx.build([{ name: "Active student Datas", data: [headers, ...datas], options: { "!cols": headers.map(x => ({ wch: x.length + 10 })) } }]),
          filename: "Active student Datas.xlsx"
        }
      )
      await ctx.scene.leave();
    })
    // Xodimlar ma'lumotlari
    .hears(StatButton.EmployeeData, async ctx => {
      await ctx.replyWithHTML(`<b>⏳Biroz kuting. Ma'lumotlar tayyorlanyapdi...</b>`);
      let headers = ObjectDeepParserForKeys(await EmployeeModel.findOne());
      let datas = await EmployeeModel.find().map(x => ObjectDeepParserForValues(x)).toArray();
      await ctx.replyWithDocument(
        {
          source: NodeXlsx.build([{ name: "Employee Datas", data: [headers, ...datas], options: { "!cols": headers.map(x => ({ wch: x.length * 2 })) } }]),
          filename: "Employee Datas.xlsx"
        }
      )
      await ctx.scene.leave();
    })
    // Dars jadvali ma'lumotlari
    .hears(StatButton.ThisWeekScheduleList, async ctx => {
      await ctx.replyWithHTML(`<b>⏳Biroz kuting. Ma'lumotlar tayyorlanyapdi...</b>`);
      let headers = ObjectDeepParserForKeys(await ScheduleListModel.findOne());
      let datas = await ScheduleListModel.find().map(x => ObjectDeepParserForValues(x)).toArray();
      await ctx.replyWithDocument(
        {
          source: NodeXlsx.build([{ name: "Schedule List Datas", data: [headers, ...datas], options: { "!cols": headers.map(x => ({ wch: x.length * 2 })) } }]),
          filename: "Schedule List Datas.xlsx"
        }
      )
      await ctx.scene.leave();
    })
    // Writable Stat
    .hears(StatButton.Stat, async ctx => {
      await ctx.replyWithHTML(`Bugungu sana: ${new Date().toDateString()}<code>
Botdagi jami a'zolar soni: ${await UserModel.countDocuments()};
Botdagi jami talabalar soni: ${await UserModel.countDocuments({ role: "Student" })};
Hemis ma'lumotlari soni: ${await HemisDataModel.countDocuments()};
Jami dars jadval ma'lumotlari soni: ${await ScheduleListModel.countDocuments()};
Xodimlar ma'lumotlari soni: ${await EmployeeModel.countDocuments()};
Jami o'qituvchi ma'lumotlari soni: ${await EmployeeModel.countDocuments({ "employeeType.code": "12" })};
</code>`);
      await ctx.scene.leave();
    })
    .hears(StatButton.Back, async ctx => {
      await ctx.scene.leave();
    })
    .on("message", async ctx => {
      throw new Error("Noto'g'ri tanlov");
    })
);

scene.enter(async (ctx) => {
  await ctx.replyWithHTML(`<b>Ma'lumotlar turini tanlang:</b>`,
    {
      reply_markup: StatMarkup.resize(true).oneTime(true).reply_markup
    })
});

scene.leave(ctx => {
  ctx.replyWithHTML(`<b>Bosh menyu</b>`, { reply_markup: HomeMarkup.resize(true).reply_markup });
})

scene.use(
  Composer.catch((err, ctx) => {
    ctx.scene.leave();
    ctx.replyWithHTML(`<b>❌Xatolik:\n${(<TelegramError>err).message}</b>`, {
      reply_markup: HomeMarkup.resize().reply_markup,
    });
    logger.LogError(<Error>err);
  })
);

export default scene;
