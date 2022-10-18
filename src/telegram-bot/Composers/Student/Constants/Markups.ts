import { Markup } from "telegraf";

import { Home } from "./Buttons";

export let HomeMarkup = Markup.keyboard(Object.values(Home), { columns: 2 }).resize(
  true
).reply_markup;
