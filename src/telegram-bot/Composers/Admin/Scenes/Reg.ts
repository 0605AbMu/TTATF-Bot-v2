import { Context, Scenes } from "telegraf";
const Reg = new Scenes.WizardScene<Scenes.WizardContext>("Reg", (ctx) => {
  ctx.reply("Scene1 in Admin");
});
Reg.enter((ctx) => {
  ctx.reply("Admin Reg entered");
});
export default Reg;
