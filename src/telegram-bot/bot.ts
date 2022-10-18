import { session, Telegraf, Scenes } from "telegraf";
import Config from "../config/Config";
import Logger from "../logger/logger";
import AdminScene from "./Scenes/Admin/AdminScene";
import StudentScene from "./Scenes/Student/StudentScene";

const bot = new Telegraf<Scenes.WizardContext>(Config.TELEGRAM_BOT_TOKEN);

bot.use(session());
bot.use(new Scenes.Stage([AdminScene, StudentScene]).middleware());

let a = 0;

bot.use((ctx) => {
  if (a == 0) {
    ctx.scene.enter("Admin");
    a++;
  } else ctx.scene.enter("Student");
});

bot
  .launch()
  .then((res) => {
    Logger.LogMessage("Bot ishga tushdi.");
  })
  .catch((err) => {
    Logger.LogError(err);
  });
