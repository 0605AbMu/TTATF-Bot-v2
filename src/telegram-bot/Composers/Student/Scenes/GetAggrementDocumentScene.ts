import { Composer, Markup, Scenes, Telegraf } from "telegraf";
import MyContext from "../../../Interfaces/MyContext";
import { ReferenceProvider } from "../../../Services/ReferenceProvider";
import PasswordChecker from "../../../Services/PasswordChecker";
import UserModel from "../../../Models/UserModel";
import { Student } from "../../../Models/StudentModel";

import AggMakerService from "../../../Services/Aggrement Maker Service/service";
import AggFileBucket from "../../../Models/AggrementFilesBucket";

interface MySessionData extends Scenes.WizardSessionData {
  // password: string;
  // provider: ReferenceProvider;
}
interface MyWizardContext extends MyContext {
  session: Scenes.WizardSession<MySessionData>;
  scene: Scenes.SceneContextScene<MyWizardContext, MySessionData>;
  wizard: Scenes.WizardContextWizard<MyWizardContext>;
}

const scene = new Scenes.WizardScene<MyWizardContext>(
  "GetAggrementDocument",
  async (ctx) => {
    // AggMakerService.CreateDocumentAsync();
  }
);

scene.use(
  Telegraf.hears(/\/\w*/gm, (ctx, next) => {
    ctx.scene.leave();
  })
);

scene.enter(async (ctx) => {

});



scene.use(
  Composer.catch(async (err, ctx) => {
    await ctx.scene.leave();
    throw err;
  })
);

export default scene;
