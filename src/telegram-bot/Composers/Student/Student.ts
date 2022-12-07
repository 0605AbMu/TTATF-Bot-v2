import { Composer, Markup, Scenes, session } from "telegraf";
import MyContext from "../../Interfaces/MyContext";
import UserModel from "../../Models/UserModel";
import * as MStudent from "../../Models/StudentModel";
import AggrementFilesBucket from "../../Models/AggrementFilesBucket";
import logger from "../../../logger/logger";
import ScheduleListModel from "../../Models/ScheduleListModel";
import { Telegram } from "telegraf";

//Middlewares
import { CheckStudentLoginAndPasswordForExists } from "./Middlewares/CheckHemisDataOfStudent";

// Markups
import { HomeMarkup, UpdateStudentDataMarkup } from "./Constants/Markups";

// Buttons
import { Home } from "./Constants/Buttons";

// Services
import AggrementMaker from "../../Services/Aggrement Maker Service/service";

// Scenes
import GetReferenceScene from "./Scenes/GetReferenceScene";
import ChangePassword from "./Scenes/ChangeStudentPasswordScene";
import UpdateStudentDataScene from "./Scenes/UpdateStudentDataScene";
import ScheduleListScene from "./Scenes/ScheduleListScene";
import { InlineKeyboardButton, InlineQueryResultArticle, InlineQueryResultPhoto } from "telegraf/types";
import { isNumberObject } from "util/types";
import EmployeeModel from "../../Models/EmployeeModel";
import { ObjectDeepParserForValues } from "../../Utils/NestedObjectParser";
const Student = new Composer<MyContext>();

Student.use(session());
Student.use(
  new Scenes.Stage([
    GetReferenceScene,
    ChangePassword,
    // GetAggrementDocumentScene,
    ScheduleListScene,
    UpdateStudentDataScene,
  ]).middleware()
);

// Parol va logini mavjud ekanligini tekshiradi!
Student.use(CheckStudentLoginAndPasswordForExists);

Student.start(async (ctx) => {
  ctx.replyWithHTML(
    `<b>👋Assalomu alaykum ${ctx.UserData.StudentData.HemisData.short_name}. Xush kelibsiz!</b>`,
    {
      reply_markup: HomeMarkup,
    }
  );
});

Student.hears(Home.Reference, async (ctx) => {
  try {
    await ctx.scene.enter("GetReferenceScene");
  } catch (error) {
    await ctx.replyWithHTML(`<b>❌Xatolik: ${error.message}</b>`);
    logger.LogError(error);
  }
});

Student.hears(Home.Contact, async (ctx) => {
  await ctx.replyWithHTML(`<b>${"☎️Telefon:".padEnd(15)} +998....;
${"📩E-mail:".padEnd(15)} ....@...uz;
${"🌐Web-sayt:".padEnd(15)} www.ttatf.uz</b>;`);
});

Student.hears(Home.Exit, async (ctx) => {
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

Student.hears(Home.AboutMySelf, async (ctx, next) => {
  const data = ctx.UserData.StudentData.HemisData;
  const privateData = ctx.UserData.StudentData;
  const s = `<b>F.I.O: ${data.full_name};
Login: <code>${data.student_id_number}</code>;
🔵-- <code>Shaxsiy Ma'lumotlar</code> --
Tug'ulgan sanasi: ${privateData.HemisData?.birth_date == null ? "❌noma'lum" : (new Date(privateData.HemisData.birth_date * 1000).toLocaleDateString())};
Jinsi: ${privateData.HemisData?.gender?.name ?? "❌noma'lum"};
Ijaradagi uy shahri: ${privateData.rent?.location?.city ?? "❌noma'lum"};
Ijaradagi uy manzili: ${privateData.rent?.location?.address ?? "❌noma'lum"};
Ijaradagi uy narxi: ${privateData.rent?.amount ?? "❌noma'lum"};
JSHSHIR: ${privateData.HemisData?.jshshir ?? "❌noma'lum"};
Pasport seria: ${privateData.HemisData?.seria ?? "❌noma'lum"};
E-mail: <code>${privateData.email ?? "❌noma'lum"};</code>
Telefon: <code>${privateData.phone ?? "❌noma'lum"};</code>
Telegram raqami: <code>${privateData.tgPhone?.phone_number ?? "❌noma'lum"
    };</code>
🟢-- <code>Hemis Ma'lumotlari</code> --
O'rtacha GPA: ${data.avg_gpa};
Kredit: ${data.total_credit};
Kurs: ${data.level?.name};
Guruh: ${data.group?.name};
Manzil: ${data.address};
Tuman: ${data.district?.name};
Viloyat: ${data.province?.name};
Holati: ${data.studentStatus?.name};

<code>⚠️Eslatma: Ma'lumotlar bilan bog'liq barcha jarayonlardagi xabarlar(ko'rish, yangilash)
10 daqiqadan kam bo'lmagan vaqtda o'chirib yuboriladi!</code>
</b>`;

  try {
    if (ctx.UserData.StudentData.HemisData.image != "")
      await ctx
        .replyWithPhoto(
          {
            url: ctx.UserData.StudentData.HemisData.image,
            filename: ctx.UserData.StudentData.HemisData.short_name,
          },
          {
            caption: s,
            parse_mode: "HTML",
            reply_to_message_id: ctx.message.message_id,
            reply_markup: UpdateStudentDataMarkup.reply_markup,
          }
        )
        .then((x) => {
          setTimeout(() => {
            ctx.deleteMessage(x.message_id).catch();
          }, 10 * 60 * 1000);
        })
        .catch(async (e) => {
          await ctx
            .replyWithHTML(s, {
              reply_markup: UpdateStudentDataMarkup.reply_markup,
            })
            .then((x) => {
              setTimeout(() => {
                ctx.deleteMessage(x.message_id).catch();
              }, 10 * 60 * 1000);
            });
        });
    else
      await ctx
        .replyWithHTML(s, {
          reply_markup: UpdateStudentDataMarkup.reply_markup,
        })
        .then((x) => {
          setTimeout(() => {
            ctx.deleteMessage(x.message_id).catch();
          }, 10 * 60 * 1000);
        });
  } catch (error) {
    throw error;
  }
});

Student.hears(Home.Shartnoma, async (ctx) => {
  let date = new Date(Date.now());
  let experiedAt = new Date(date);
  experiedAt.setDate(10);
  experiedAt.setUTCHours(0, 0, 0);
  let startAt = new Date(experiedAt);
  startAt.setDate(1);
  startAt.setUTCHours(0, 0, 0);

  let file = await (
    await AggrementFilesBucket.find({
      uploadDate: { $gte: startAt, $lte: experiedAt },
      "metadata.studentId": ctx.UserData.StudentData.login,
    }).toArray()
  ).at(0);

  if (file) {
    await ctx.replyWithDocument(
      {
        source: AggrementFilesBucket.openDownloadStream(file._id),
        filename: `Ijara shartnoma arizasi-${ctx.UserData.StudentData?.HemisData?.short_name ?? "unknown"
          }${file.metadata.extension}`,
      },
      {
        caption: `<b>📄${ctx.UserData.StudentData.HemisData.short_name
          } | Ijara shartnoma arizasi.\nBerilgan sana: ${file.uploadDate.toLocaleDateString()}</b>`,
        parse_mode: "HTML",
      }
    );
    return;
  }

  // Check period for service
  if (experiedAt < date) {
    await ctx.replyWithHTML(
      "<b>Ijara shartnoma xizmati har oyning 7-sanasiga qadar ish faoliyatida bo'ladi</b>"
    );
    return;
  }
  // check for all needed data
  if (!checkNeededData(ctx.UserData.StudentData)) {
    await ctx.replyWithHTML(
      `<b>Sizda ma'lumotlar yetarli emas!. Ma'lumotlar bo'limiga kirib o'zingiz haqingizdagi ma'lumotlarni yangilang!</b>`
    );
    return;
  }

  if (ctx.UserData.StudentData.HemisData.locationType == undefined || ctx.UserData.StudentData.HemisData.locationType.toLowerCase() != "ijaradagi uyda") {
    await ctx.replyWithHTML(`<b>Siz ijaradagi uyda istiqomat qilmaysiz. Agar da bu ma'lumot noto'g'ri bo'ladigan bo'lsa Tutoringiz bilan bog'laning</b>`);
    return;
  }

  await ctx.replyWithHTML("<b>⏳Biroz kuting ma'lumotlar tayyorlanyapdi</b>");
  try {
    let fileId = await AggrementMaker.CreateDocumentAsync(
      ctx.UserData.StudentData
    );

    file = await (
      await AggrementFilesBucket.find({ _id: fileId }).toArray()
    ).at(0);
    if (file == null) {
      throw new Error("Ariza hujjatingiz topilmadi!");
    }
    await ctx.replyWithDocument(
      {
        source: AggrementFilesBucket.openDownloadStream(fileId),
        filename: `Ijara shartnoma arizasi-${ctx.UserData.StudentData?.HemisData?.short_name ?? "unknown"
          }${file.metadata.extension}`,
      },
      {
        caption: `<b>📄${ctx.UserData.StudentData.HemisData.short_name
          } | Ijara shartnoma arizasi.\nBerilgan sana: ${file.uploadDate.toLocaleDateString()}</b>`,
        parse_mode: "HTML",
      }
    );
  } catch (error) {
    await ctx.replyWithHTML(`<b>❌Xatolik:\n${error.message}</b>`);
    logger.LogError(error);
  }
});

Student.hears(Home.ChangePassword, async (ctx) => {
  try {
    await ctx.scene.enter("ChangePassword");
  } catch (error) {
    ctx.replyWithHTML(`❌Xatolik:\n${error.message}`);
    logger.LogError(error);
  }
});

Student.hears(Home.GetScheduleList, async (ctx) => {
  ctx.scene.enter("ScheduleList");
});

Student.hears(Home.GetScheduleListForWeek, async (ctx) => {
  let buttons: InlineKeyboardButton[] = [1, 2, 3, 4, 5, 6].map((x) => ({
    text: GetDayNameInTheWeek(x),
    callback_data: "lessonAt#" + x,
  }));
  ctx.replyWithHTML(`<b>Hafta kunini tanlang: </b>`, {
    reply_markup: Markup.inlineKeyboard(buttons, { columns: 2 }).reply_markup,
  });
});

Student.hears(Home.EmployeeData, async ctx => {
  await ctx.replyWithHTML(`<b>Xodimlar haqidagi ma'lumotlarni quyidagi tugmani bosish orqali qidirishingiz mumkin</b>`,
    {
      reply_markup: Markup.inlineKeyboard([{ text: "Qidirish", switch_inline_query_current_chat: "" }]).reply_markup
    });
})

Student.action("updateMyData", async (ctx) => {
  await ctx.scene.enter("UpdateStudentData", ctx);
});

// Lessons by date
Student.on("callback_query", async (ctx, next) => {
  let [ind, day] = ctx.callbackQuery.data.split("#");
  if (ind != "lessonAt") return next();
  let dayOfWeek = new Date();
  let diff = parseInt(day) - dayOfWeek.getDay();
  dayOfWeek.setUTCDate(dayOfWeek.getDate() + diff);
  dayOfWeek.setUTCHours(0, 0, 0, 0);
  let list = await ScheduleListModel.find({
    "faculty.id": ctx.UserData.StudentData.HemisData.department.id,
    "group.id": ctx.UserData.StudentData.HemisData.group.id,
    lesson_date: dayOfWeek.getTime() / 1000,
  }).toArray();
  if (list.length == 0) {
    await ctx.replyWithHTML(`<b>Bu kun bo'yicha ma'lumotlar mavjud emas</b>`);
    return;
  }

  let s =
    GetDayNameInTheWeek(parseInt(day)).toUpperCase() + " - kuni dars jadvali:" +
    "\n" +
    list
      .map(
        (x, index) => `
<code>#${index + 1}</code>
Fan: ${x.subject?.name};
O'qituvchi: ${x.employee?.name};
Xona: <code>${x.auditorium?.name}</code>;
Boshlanish vaqti: <code>${x.lessonPair.start_time}</code>;
Tugash vaqti: <code>${x.lessonPair.end_time}</code>;`
      )
      .join("\n".padEnd(35, "-"));

  try {
    ctx.editMessageText(`<b>${s}</b>`, { parse_mode: "HTML" });
  } catch (error) {
    ctx.replyWithHTML(`<b>${s}</b>`);
  }
});

// Student.inlineQuery(new Trigger)

Student.on("inline_query", async ctx => {
  let employees = (await EmployeeModel.find().map(x => { if ([x.full_name, x.department.name, x.academicDegree.name, x.staffPosition.name, x.telefon, x.telegram, x.employeeType.name, x.staffPosition.name, x.academicRank.name].join(" ").toLocaleLowerCase().indexOf(ctx.inlineQuery.query.toLowerCase()) !== -1) return x; else return null; }).limit(20).toArray()).filter(x => x != null);
  let result: InlineQueryResultArticle[] = employees.map((x, index) => ({
    type: "article",
    id: index.toString(),
    title: x.full_name,
    thumb_url: x.image,
    description: `${x.department?.name ?? "❌Noma'lum"}\n${x.staffPosition?.name ?? "❌Noma'lum"}`,
    input_message_content: {
      parse_mode: "HTML",
      message_text: `<b>F.I.O: ${x.full_name ?? "❌Noma'lum"};
Xodim turi: ${x.employeeType?.name ?? "❌Noma'lum"};
Darajasi: ${x.academicDegree?.name ?? "❌Noma'lum"};
Kafedra: ${x.department?.name ?? "❌Noma'lum"};
Pozitsiyasi: ${x.staffPosition?.name ?? "❌Noma'lum"};
Telefon: ${x.telefon ?? "❌Noma'lum"};
Telefon: ${x.telegram ?? "❌Noma'lum"};
E-mail: ${x.email ?? "❌Noma'lum"};</b>`,
      photo_url: x.image
    }
  }));
  await ctx.answerInlineQuery(result, {
    is_personal: true,
    cache_time: 10,
  }
  )
})

export default Student;

//where data need to aggrement document, it checks it
function checkNeededData(data: MStudent.Student): boolean {
  if (data == null) return false;
  if (data.HemisData == null) return false;
  if (data.HemisData?.birth_date == null) return false;
  if (data.email == null) return false;
  if (data.HemisData?.gender == null) return false;
  if (data.HemisData?.jshshir == null) return false;
  if (data.phone == null) return false;
  if (data.rent == null) return false;
  if (data.rent.amount == null) return false;
  if (data.rent.location == null) return false;
  if (data.rent.location.address == null) return false;
  if (data.rent.location.city == null) return false;
  if (data.tgPhone == null) return false;
  return true;
}



function GetDayNameInTheWeek(day: number): string {
  switch (day) {
    case 1:
      return "Dushanba";
    case 2:
      return "Seshanba";
    case 3:
      return "Chorshanba";
    case 4:
      return "Payshanba";
    case 5:
      return "Juma";
    case 6:
      return "Shanba";
    default:
      return "Dushanba";
  }
}

export function RoutinCheckerForScheduleList(Telegram: Telegram) {

  setInterval(async () => {
    if (new Date().getHours() != 7)
      return;

    let users = await UserModel.find({ role: "Student" }).toArray();
    for (const user of users) {
      let list = await ScheduleListModel.find({
        "faculty.id": user.StudentData.HemisData.department.id,
        "group.id": user.StudentData.HemisData.group.id,
        lesson_date: new Date().getTime() / 1000,
      }).toArray();


      let s =
        GetDayNameInTheWeek(new Date().getDay()).toUpperCase() + " - kuni dars jadvali:" +
        "\n" +
        list
          .map(
            (x, index) => `
<code>#${index + 1}</code>
Fan: ${x.subject?.name};
O'qituvchi: ${x.employee?.name};
Xona: <code>${x.auditorium?.name}</code>;
Boshlanish vaqti: <code>${x.lessonPair.start_time}</code>;
Tugash vaqti: <code>${x.lessonPair.end_time}</code>;`
          )
          .join("\n".padEnd(35, "-"));

      await Telegram.sendMessage(user.telegamUser.id, s, { parse_mode: "HTML" }).catch(e => { });
    }

  }, 60 * 60 * 1000);

}