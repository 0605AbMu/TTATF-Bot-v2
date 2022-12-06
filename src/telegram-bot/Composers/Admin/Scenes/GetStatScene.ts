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
      ctx.scene.leave();
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
