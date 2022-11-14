import { Composer, Markup, Scenes, Telegraf, TelegramError } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { HomeMarkup } from "../Constants/Markups";
import NodeXlsx from "node-xlsx";
import axios from "axios";

import StudentPassportDataModel, {
  StudentPassportData,
} from "../../../Models/StudentPasportModel";

interface MySessionData extends Scenes.WizardSessionData {
  //   allHemisData: IHemisData[];
}

interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "UpdateStudentPasportData",
  new Composer<MyWizardContext>()
    .on("document", async (ctx) => {
      if (
        ctx.message.document.mime_type !=
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        throw new Error("Noto'g'ri fayl yuborildi");
      }
      //Biroz kuting ma'lumotlar olinyapdi
      // Downloading file
      try {
        let link = await ctx.telegram.getFileLink(ctx.message.document.file_id);
        let result = NodeXlsx.parse(
          await (
            await axios.get(link.href, { responseType: "arraybuffer" })
          ).data
        );
        if (result.length < 1) throw new Error("Noto'g'ri formatdagi fayl!");
        if (result[0].data.length == 0 || (<[]>result[0].data[0]).length < 4)
          throw new Error("Fayldagi ma'lumotlar formati to'g'ri emas!");
        let data = result[0].data;
        try {
          await StudentPassportDataModel.drop({});
        } catch (error) {}
        data.splice(0, 1);
        const inserted = await StudentPassportDataModel.insertMany(
          data.map((x) => {
            return new StudentPassportData(x[0], x[1], x[2], x[3]);
          })
        );

        ctx.scene.leave();
        await ctx.replyWithHTML(
          `<b>✅${inserted.insertedCount} ta ma'lumot o'qib olindi!</b>`,
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
  await ctx.replyWithHTML(
    "<b>Talabalarning pasport ma'lumotlarini excel fayl ko'rinishida yuboring</b>",
    {
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
