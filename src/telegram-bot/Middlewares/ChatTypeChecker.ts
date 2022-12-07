import logger from "../../logger/logger";
import MyContext from "../Interfaces/MyContext";

async function ChatTypeChecker(ctx: MyContext, next) {
  try {
    if (ctx.updateType === "chosen_inline_result")
      return next();
    if (ctx.updateType === "inline_query")
      if (ctx.inlineQuery.chat_type === "private" || ctx.inlineQuery.chat_type === "sender")
        return next();
      else
        return;
    if (ctx.chat?.type !== "private") {
      await ctx.replyWithHTML(
        "<b>Bot faqat shaxsiy yozishmalarda ishlaydi</b>"
      );
      return;
    }
    next();
  } catch (error) {
    logger.LogError(error);
  }
}

export default ChatTypeChecker;
