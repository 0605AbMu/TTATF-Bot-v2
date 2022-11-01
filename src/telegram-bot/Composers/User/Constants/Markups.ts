import { Markup } from "telegraf";
import * as buttons from "./Keyboards";

export const HomeKeyboardMarkup = Markup.keyboard(
  Object.values(buttons.Home).map((x) => x.replace("/", "")),
  {
    columns: 2,
  }
).resize(true).reply_markup;
