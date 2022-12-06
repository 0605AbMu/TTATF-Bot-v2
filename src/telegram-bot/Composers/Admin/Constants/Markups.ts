import { Markup } from "telegraf";
import { Home, StatButton } from "./Buttons";

export const HomeMarkup = Markup.keyboard(Object.values(Home), {
  columns: 2,
}).resize(true);

export const StatMarkup = Markup.keyboard(Object.values(StatButton), {
  columns: 2,
}).resize(true);
