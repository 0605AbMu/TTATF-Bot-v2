import { Scenes } from "telegraf";
const admin = new Scenes.WizardScene<Scenes.WizardContext>("Admin", (ctx) => {
  console.log("Stacene 1");
});

admin.enter((ctx) => {
  ctx.reply("Admin Scene");
});

export default admin;
