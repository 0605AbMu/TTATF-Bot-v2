import { Markup } from "telegraf";

import { Home } from "./Buttons";

export let HomeMarkup = Markup.keyboard(Object.values(Home), {
  columns: 2,
}).resize(true).reply_markup;

export let InlineMarkupOnStudentDataUpdating = Markup.inlineKeyboard([
  {
    text: "Bekor qilish",
    callback_data: "cancel",
  },
  {
    text: "Keyingisi",
    callback_data: "next",
  },
]);

export let UpdateStudentDataMarkup = Markup.inlineKeyboard([
  {
    text: "Ma'lumotlarimni yangilash",
    callback_data: "updateMyData",
  },
]);
