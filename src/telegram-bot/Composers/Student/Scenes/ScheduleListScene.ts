import { Composer, Markup, Scenes, Telegraf } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { ReferenceProvider } from "../../../Services/ReferenceProvider";
import PasswordChecker from "../../../Services/PasswordChecker";
import UserModel from "../../../Models/UserModel";
import { HomeMarkup } from "../Constants/Markups";
import ScheduleListModel, {
  ScheduleListData,
} from "../../../Models/ScheduleListModel";
import { InlineKeyboardButton, KeyboardButton } from "telegraf/types";

interface MySessionData extends Scenes.WizardSessionData {
  Lessons: ScheduleListData[];
  provider: ReferenceProvider;
}
interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "ScheduleList",
  new Composer<MyWizardContext>()
    .on("callback_query", async (ctx) => {
      if (!ctx.callbackQuery.data || ctx.callbackQuery.data == "back") {
        await ctx.scene.leave();
        ctx.replyWithHTML(`<b>Bosh menyu</b>`, { reply_markup: HomeMarkup });
        return;
      }
      let lesson = ctx.scene.session.Lessons.find(
        (x) => x.id.toString() == ctx.callbackQuery.data
      );
      if (!lesson) throw new Error("Noto'g'ri tanlov");
      ctx.scene.leave();
      let s = `<b>Fan: ${lesson?.subject?.name ?? "Noma'lum"};
O'qituvchi: ${lesson?.employee?.name ?? "Noma'lum"};
Fakultet: ${lesson?.faculty?.name ?? "Noma'lum"};
Guruh: ${lesson?.group?.name ?? "Noma'lum"};
Mashg'ulot turi: ${lesson?.trainingType?.name ?? "Noma'lum"};
Xona: <code>${lesson?.auditorium?.name ?? "Noma'lum"}</code>;
Boshlanish vaqti: <code>${lesson?.lessonPair?.start_time ?? "Noma'lum"}</code>
Tugash vaqti: <code>${lesson?.lessonPair?.end_time ?? "Noma'lum"}</code>
Semestr: ${lesson?.semester?.name ?? "Noma'lum"};</b>`;
      try {
        ctx.editMessageText(s, { parse_mode: "HTML" });
      } catch (error) {
        ctx.replyWithHTML(s);
      }
      ctx.scene.leave();
    })
    .on("message", async (ctx) => {
      throw new Error("Noto'g'ri tanlov");
    })
);

scene.use(
  Telegraf.hears(/\/\w*/gm, (ctx, next) => {
    ctx.scene.leave();
  })
);

scene.enter(async (ctx) => {
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let list = await ScheduleListModel.find({
    "group.id": ctx.UserData.StudentData.HemisData.group.id,
    lesson_date: today.getTime() / 1000,
  }).toArray();
  // console.log(list);
  if (list.length == 0) {
    await ctx.replyWithHTML(
      `<b>Sizda bugun uchun dars jadvali to'g'risidagi ma'lumotlar mavjud emas!</b>`
    );
    ctx.scene.leave();
    return;
  }

  ctx.scene.session.Lessons = list;
  let listOfLessonsAt: InlineKeyboardButton[] = list.map((x) => ({
    text: `${x.lessonPair.start_time}-${x.lessonPair.end_time}`,
    callback_data: x.id.toString(),
  }));

  listOfLessonsAt.push({ callback_data: "back", text: "Orqaga" });
  await ctx.replyWithHTML(`<b>📆Vaqtni tanlang:</b>`, {
    reply_markup: Markup.inlineKeyboard(listOfLessonsAt, { columns: 3 })
      .reply_markup,
  });
});

scene.use(
  Composer.catch((err, ctx) => {
    ctx.deleteMessage().catch((e) => {});
    ctx.scene.leave();
    ctx.replyWithHTML(`<b>❌Xatolik: ${(<Error>err).message}</b>`, {
      reply_markup: HomeMarkup,
    });
  })
);

export default scene;
