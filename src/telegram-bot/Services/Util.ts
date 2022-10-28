import MyContext from "../Interfaces/MyContext";
export async function TryCatch(
  func: Function,
  ctx: MyContext,
  ...params
) {
  try {
    await func(params);
  } catch (error) {
    ctx.replyWithHTML(`<b>Xatolik:\n${error.message}</b>`);
  }
}
