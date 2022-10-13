import { Scenes } from "telegraf";
import MyContext from "../interfaces/MyContext";
const User = new Scenes.BaseScene<MyContext>("USER_SCENE");

User.enter(ctx => {
    ctx.replyWithHTML("User scene");
    ctx.replyWithHTML(JSON.stringify(ctx.data.user));
})

export default User;
