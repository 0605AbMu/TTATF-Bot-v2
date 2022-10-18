import { Scenes } from "telegraf";
const Student = new Scenes.WizardScene<Scenes.WizardContext>("Student", (ctx) => {
  console.log("Stacene 1");
});

Student.enter((ctx) => {
  ctx.reply("Student Scene");
});

export default Student;
