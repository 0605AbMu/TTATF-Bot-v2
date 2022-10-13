import { Context, Scenes } from "telegraf";
import MySessionData from "./session";

export default interface MyContext extends Context {
  data: MySessionData;
  scene: Scenes.SceneContextScene<MyContext, MySessionData>;
}
