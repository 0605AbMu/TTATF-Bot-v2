import { Markup, Scenes, Telegraf } from "telegraf";
import { InlineKeyboardButton } from "telegraf/types";
import MyContext from "../../../Interfaces/MyContext";
import { ReferenceProvider } from "../../../Services/ReferenceProvider";

interface MySessionData extends Scenes.WizardSessionData {
  provider: ReferenceProvider;
}

interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "GetReferenceScene",
  Telegraf.on("callback_query", async (ctx, next) => {
    ctx.answerCbQuery("Ma'lumotlar tayyorlanyapdi. Kuting...");
    const result = await ctx.scene.session.provider.GetRerefenceFileById(
      ctx.callbackQuery.data
    );
    await ctx.replyWithDocument({
      source: Buffer.from(result),
      filename: `${ctx.UserData.telegamUser.first_name} - Malumotnoma.pdf`,
    });
    delete ctx.scene.session.provider;
    ctx.scene.leave();
  })
);

scene.enter(async (ctx) => {
  await ctx.replyWithHTML("<b>Iltimos kuting. Ma'lumotlaringiz yuklanyapdi...</b>");

  ctx.scene.session.provider = new ReferenceProvider(ctx.UserData);
//   try {
    await ctx.scene.session.provider.GetCookies();
    let FileList = await ctx.scene.session.provider.GetReferenceFilesList();
    let Buttons: InlineKeyboardButton[] = [];
    FileList.forEach((x) => {
      Buttons.push({
        text: x.getElementsByTagName("td")[5].text,
        callback_data: x.attrs["data-key"],
      });
    });

    await ctx.replyWithHTML("<b>Semestrni Tanlang: </b>", {
      reply_markup: Markup.inlineKeyboard(Buttons).reply_markup,
    });
//   } catch (error) {
//     throw
//   }
});

export default scene;
