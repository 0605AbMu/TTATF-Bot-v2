import { Composer, Markup, Scenes, Telegraf, TelegramError } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { HomeMarkup } from "../Constants/Markups";
import NodeXlsx from "node-xlsx";
import axios from "axios";

import StudentPassportDataModel, {
  StudentPassportData,
} from "../../../Models/StudentPasportModel";
import StudentModel from "../../../Models/StudentModel";
import HemisDataModel from "../../../Models/HemisDataModel";

interface MySessionData extends Scenes.WizardSessionData {
  //   allHemisData: IHemisData[];
}

interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "UpdateStudentLocationData",
  new Composer<MyWizardContext>()
    .on("document", async (ctx) => {
      if (
        ctx.message.document.mime_type !=
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        throw new Error("Noto'g'ri fayl yuborildi");
      }
      //Biroz kuting ma'lumotlar olinyapdi
      await ctx.replyWithHTML("<b>⏳Biroz kuting. Ma'lumotlar qo'shilyapdi.</b>");
      // Downloading file
      try {
        let link = await ctx.telegram.getFileLink(ctx.message.document.file_id);
        let result = NodeXlsx.parse(
          await (
            await axios.get(link.href, { responseType: "arraybuffer" })
          ).data
        );
        if (result.length < 1) throw new Error("Noto'g'ri formatdagi fayl!");
        if (result[0].data.length == 0 || (<[]>result[0].data[0]).length < 2)
          throw new Error("Fayldagi ma'lumotlar formati to'g'ri emas!");
        let data = result[0].data;
        data.splice(0, 1);

        let count = 0;
        for (const x of data) {
          await HemisDataModel.updateOne({ student_id_number: String(x[0]) }, { $set: { locationType: String(x[2]) } }).catch().then(x => count++);
        }
        let ids = await StudentModel.find({}, { projection: { _id: 1, HemisData: 1 } }).toArray();
        for (const id of ids) {
          if (id.HemisData == null)
            continue;
          await StudentModel.updateOne({ _id: id._id }, { $set: { HemisData: await HemisDataModel.findOne({ student_id_number: id.HemisData.student_id_number }) } });
        }
        ctx.scene.leave();
        await ctx.replyWithHTML(
          `<b>✅${count} ta ma'lumot o'qib olindi!</b>`,
          {
            reply_markup: HomeMarkup.resize().reply_markup,
          }
        );
      } catch (error) {
        throw error;
      }
    })
    .on("message", async (ctx) => {
      ctx.scene.leave();
      await ctx.replyWithHTML("<b>❌Bekor qilindi!</b>", {
        reply_markup: HomeMarkup.resize().reply_markup,
      });
    })
);

scene.enter(async (ctx) => {
  // Ma'lumotlarni shunchaki bo'sh excel fayl bilan emas balki oldingi ma'lumotlari bilan birga yuboradi
  await ctx.replyWithHTML(`<b>⏳Biroz kuting. Ma'lumotlar tayyorlanyapdi...</b>`);
  let sheetData = (await HemisDataModel.find().toArray()).map(x => [x.student_id_number, x.full_name, x.locationType]);

  await ctx.replyWithDocument(
    {
      source: NodeXlsx.build([{ name: "student location types", data: [["Talaba id si", "F.I.O", "Turar joy turi"], ...sheetData], options: { "!cols": [{ width: 20 }, { width: 45 }, {wch: 20}] } }]),
      filename: "old data and example.xlsx"
    },
    {
      caption: "<b>Talabalar turar joy ma'lumotlarini excel fayl ko'rinishida yuboring. Example ni yuqoridan yuklab olishingiz mumkin</b>",
      parse_mode: "HTML",
      reply_markup: Markup.keyboard(["❌Bekor qilish"]).resize(true)
        .reply_markup,
    }
  );
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
