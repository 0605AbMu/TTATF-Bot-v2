import logger from "../../logger/logger";
import MyContext from "../Interfaces/MyContext";

async function ChatTypeChecker(ctx: MyContext, next) {
  try {
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
