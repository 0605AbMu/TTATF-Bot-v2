import { Context, Scenes } from "telegraf";
import MySessionData from "./ContextData";

export default interface MyContext extends Context {
  data: MySessionData;
  scene: Scenes.SceneContextScene<MyContext, Scenes.SceneSessionData>;
}
