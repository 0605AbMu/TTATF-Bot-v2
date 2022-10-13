import { Scenes } from "telegraf";
import MyContext from "../interfaces/MyContext";

const admin = new Scenes.BaseScene<MyContext>("ADMIN_SCENE");

export default admin;
