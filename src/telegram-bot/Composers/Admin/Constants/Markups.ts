import { Markup } from "telegraf";
import { Home } from "./Buttons";

export const HomeMarkup = Markup.keyboard(Object.values(Home), {
  columns: 2,
}).resize(true);
