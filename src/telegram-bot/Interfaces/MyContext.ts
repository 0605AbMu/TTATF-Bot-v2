import { Scenes } from "telegraf";
import { IUser } from "../Models/UserModel";

interface MyContext extends Scenes.WizardContext {
  UserData: IUser;
}

export default MyContext;
