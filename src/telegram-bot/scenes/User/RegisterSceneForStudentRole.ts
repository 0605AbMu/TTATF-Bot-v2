import { Scenes, Telegraf } from "telegraf";
import ContextData from "../../interfaces/ContextData";
import Users from "../../Models/Users";
import { Roles } from "../../constants/roles";

interface MyContext extends Scenes.WizardContext {
  registrationData: {
    login: string;
    password: string;
  };
  data: ContextData;
  scene: Scenes.SceneContextScene<MyContext, Scenes.WizardSessionData>;
  wizard: Scenes.WizardContextWizard<MyContext>;
}

const Register = new Scenes.WizardScene<MyContext>(
  "REGISTER_FOR_STUDENT_ROLE",
  Telegraf.on(["text"], async (ctx) => {
    ctx.registrationData.login = ctx.message.text;
    await ctx.replyWithHTML("<b>Parolingizni yuboring: </b>");
    await ctx.wizard.next();
  }),
  Telegraf.on("text", async (ctx) => {
    ctx.registrationData.password = ctx.message.text;
    await ctx.replyWithHTML(
      "<b>Ma'lumotlaringiz tekshirilyapdi. Biroz kuting...</b>"
    );
    //Bu yerda HEMIS tizimi bilan talaba login va paroli tekshirib olinadi
    // va bu userning roli talabaga almashtiriladi
    await Users.updateOne(
      { _id: ctx.data.user._id },
      { $set: { role: Roles.Student } }
    );
    await ctx.replyWithHTML("<b>Qaytadan /start buyrug'ini yuboring.</b>");
    ctx.scene.leave();
  })
);

Register.enter(async (ctx) => {
    console.log(ctx.wizard);
  ctx.registrationData = { login: "", password: "" };
  await ctx.replyWithHTML("<b>Hemis tizimidagi loginingizni yuboring: </b>");
//   await ctx.wizard.selectStep(1);
});
export default Register;
