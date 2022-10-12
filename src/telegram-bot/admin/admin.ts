import { Scenes, Context } from "telegraf";

interface sessionData {
  isAdmin: boolean;
}

interface MyContext extends Context {
  session: sessionData;
}

const scene = new Scenes.BaseScene<MyContext>("adminScene");
