import { Composer, Scenes, session } from "telegraf";

import Reg from "./Scenes/Reg";

const Admin = new Composer<Scenes.WizardContext>();
Admin.use(session());
Admin.use(new Scenes.Stage([Reg]));

Admin.start((ctx) => {
  ctx.reply("ADmin start");
  ctx.scene.enter("Reg");
});

export default Admin;
