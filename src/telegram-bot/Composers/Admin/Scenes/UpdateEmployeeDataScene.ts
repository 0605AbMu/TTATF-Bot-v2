import { Composer, Markup, Scenes, Telegraf, TelegramError } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { HomeMarkup } from "../Constants/Markups";
import NodeXlsx from "node-xlsx";
import axios from "axios";

import EmployeeModel, { Employee } from "../../../Models/EmployeeModel";

// Services
import GetAllEmployeeData from "../../../Services/GetAllEmployeeData";

interface MySessionData extends Scenes.WizardSessionData {
  employeesData: Employee[]
}

interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "UpdateEmployeeData",
  new Composer<MyWizardContext>()
    .on("text", async (ctx, next) => {
      if (ctx.message.text != "❌Bekor qilish")
        return next();
      await ctx.scene.leave();
      await ctx.replyWithHTML(`<b>Bekor qilindi!</b>`,
        {
          reply_markup: HomeMarkup.resize(true).reply_markup
        })
    })
    .on("document", async ctx => {
      if (
        ctx.message.document.mime_type !=
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        throw new Error("Noto'g'ri fayl yuborildi");
      }
      try {
        await ctx.replyWithHTML(`<b>⏳Biroz kuting. Ma'lumotlar yuklab olinyapdi...</b>`);
        let link = await ctx.telegram.getFileLink(ctx.message.document.file_id);
        let result = NodeXlsx.parse(
          await (
            await axios.get(link.href, { responseType: "arraybuffer" })
          ).data
        );
        if (result.length < 1) throw new Error("Noto'g'ri formatdagi fayl!");
        if (result[0].data.length == 0 || (<[]>result[0].data[0]).length < 7)
          throw new Error("Fayldagi ma'lumotlar formati to'g'ri emas!");
        let data = result[0].data;
        data.splice(0, 1);
        await ctx.replyWithHTML(`<b>⏳Biroz kuting. Ma'lumotlar yangilanyapdi...</b>`);
        let count = 0;
        for (const x of data) {
          await EmployeeModel.updateOne({ employee_id_number: String(x[0]) }, { $set: { telefon: String(x[4]) == "" ? null : String(x[4]), email: String(x[5]) == "" ? null : String(x[5]), telegram: String(x[6]) == "" ? null : String(x[6]) } }).catch().then(x => count++);
        }
        ctx.scene.leave();
        await ctx.replyWithHTML(
          `<b>✅${count} ta ma'lumot o'qib olindi!</b>`,
          {
            reply_markup: HomeMarkup.resize(true).reply_markup,
          }
        );
      } catch (error) {
        throw error;
      }

    })
    .on("message", async ctx => {
      await ctx.scene.leave();
      await ctx.replyWithHTML(`<b>Noto'g'ri ma'lumot yuborildi!</b>`,
        {
          reply_markup: HomeMarkup.resize(true).reply_markup
        })
    })
);

scene.enter(async (ctx) => {
  await ctx.replyWithHTML(`<b>⏳Biroz kuting. Ma'lumotlar HEMIS tizimidan olinyapdi...</b>`);
  let data = await GetAllEmployeeData();

  // Update for others
  for (let employee of data.filter(x => x.employeeType.code != "12")) {
    await EmployeeModel.updateOne({ employee_id_number: employee.employee_id_number }, { $set: employee }, { upsert: true });
  }

  // Update for teachers
  for (let employee of data.filter(x => x.employeeType.code == "12")) {
    await EmployeeModel.updateOne({ employee_id_number: employee.employee_id_number }, { $set: employee }, { upsert: true });
  }

  data = await EmployeeModel.find({}).toArray();

  let cellData = data.map(x => { return [x.employee_id_number, x.full_name, x.employeeType.name, x.staffPosition.name, x.telefon, x.email, x.telegram] })

  let contactData = NodeXlsx.build([{
    name: "Employee contact", data: [["ID", "F.I.O", "Lavozim turi", "Lavozimi", "Telefon", "E-mail", "Telegram kontakt"], ...cellData],
    options: { "!cols": [{ wch: 10 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }] }
  }])
  await ctx.replyWithDocument({
    source: contactData,
    filename: "Contacts.xlsx"
  },
    {
      caption: `<b>${data.length} ta xodim ma'lumoti o'qib olindi. Ularning contact ma'lumotlarini excel fayl ko'rinishida yuklang.\n<i>⚠️Shunchaki bekor qilsangiz oldingi kontakt ma'lumotlarida saqlanib qoladi.</i></b>`,
      parse_mode: "HTML",
      reply_markup: Markup.keyboard(["❌Bekor qilish"]).resize(true).oneTime(true).reply_markup
    })
});

scene.use(
  Composer.catch((err, ctx) => {
    ctx.scene.leave();
    ctx.replyWithHTML(`<b>❌Xatolik:\n${(<TelegramError>err).message}</b>`, {
      reply_markup: HomeMarkup.resize().reply_markup,
    });
  })
);

export default scene;
