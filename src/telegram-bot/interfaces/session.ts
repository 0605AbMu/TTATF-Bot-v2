import {Scenes} from "telegraf";
export default interface MySessionData extends Scenes.SceneSessionData{
  admin?: any;
  student?: any;
  user?: any;
}
