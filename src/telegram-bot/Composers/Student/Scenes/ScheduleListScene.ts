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
    .on("text", async (ctx) => {
      if (ctx.message.text == "Orqaga") {
        await ctx.scene.leave();
        ctx.replyWithHTML(`<b>Bosh menyu</b>`, { reply_markup: HomeMarkup });
        return;
      }
      let [startTime, endTime] = ctx.message.text.split("-");
      let lesson = ctx.scene.session.Lessons.find(
        (x) =>
          x.lessonPair.start_time == startTime &&
          x.lessonPair.end_time == endTime
      );
      if (!lesson) throw new Error("Noto'g'ri tanlov");
      ctx.scene.leave();
      await ctx.replyWithHTML(
        `<b>Fan: ${lesson?.subject?.name ?? "Noma'lum"};
O'qituvchi: ${lesson?.employee?.name ?? "Noma'lum"};
Fakultet: ${lesson?.faculty?.name ?? "Noma'lum"};
Guruh: ${lesson?.group?.name ?? "Noma'lum"};
Mashg'ulot turi: ${lesson?.trainingType?.name ?? "Noma'lum"};
Xona: <code>${lesson?.auditorium?.name ?? "Noma'lum"}</code>;
Boshlanish vaqti: <code>${lesson?.lessonPair?.start_time ?? "Noma'lum"}</code>
Tugash vaqti: <code>${lesson?.lessonPair?.end_time ?? "Noma'lum"}</code>
Semestr: ${lesson?.semester?.name ?? "Noma'lum"};</b>`,
        { reply_markup: HomeMarkup }
      );
    })
    .on("message", async (ctx) => {})
);

scene.enter(async (ctx) => {
  let startOfWeek = new Date();
  if (startOfWeek.getDay() != 1)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  startOfWeek.setUTCHours(0, 0, 0, 0);
  let list = await ScheduleListModel.find({
    "group.id": ctx.UserData.StudentData.HemisData.group.id,
    weekStartTime: startOfWeek.getTime() / 1000,
  }).toArray();
  list = list.filter(
    (x) => new Date(x.lesson_date * 1000).getDay() === new Date().getDay()
  );

  if (list.length == 0) {
    await ctx.replyWithHTML(
      `<b>Sizda bu hafta uchun dars jadvali to'g'risidagi ma'lumotlar mavjud emas!</b>`
    );
    ctx.scene.leave();
    return;
  }
  ctx.scene.session.Lessons = list;
  let listOfLessonsAt: KeyboardButton[] = list.map((x) => {
    return `${x.lessonPair.start_time}-${x.lessonPair.end_time}`;
  });
  listOfLessonsAt.push("Orqaga");
  await ctx.replyWithHTML(`<b>📆Vaqtni tanlang:</b>`, {
    reply_markup: Markup.keyboard(listOfLessonsAt, { columns: 3 }).resize(true)
      .reply_markup,
  });
});

scene.use(
  Composer.catch((err, ctx) => {
    ctx.scene.leave();
    ctx.replyWithHTML(`<b>❌Xatolik: ${(<Error>err).message}</b>`, {
      reply_markup: HomeMarkup,
    });
  })
);

export default scene;
