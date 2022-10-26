import { Composer, Scenes, session } from "telegraf";

import Reg from "./Scenes/Reg";
import { GetAllData } from "./Other/UpdateAllStudentMetaData";

const Admin = new Composer<Scenes.WizardContext>();
Admin.use(session());
Admin.use(new Scenes.Stage([Reg]));

Admin.start((ctx) => {
  ctx.reply("Admin start");
  // ctx.scene.enter("Reg");
});

Admin.command("/update", async (ctx) => {
  try {
    console.log(await GetAllData());
  } catch (error) {
    console.log(error.message)
  }
});

export default Admin;
