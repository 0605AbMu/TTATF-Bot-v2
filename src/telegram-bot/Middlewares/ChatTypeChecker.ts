import MyContext from "../Interfaces/MyContext";

async function ChatTypeChecker(ctx: MyContext, next) {
  if (ctx.chat?.type !== "private") {
    await ctx.replyWithHTML("<b>Bot faqat shaxsiy yozishmalarda ishlaydi</b>");
    return;
  }
  next();
}

export default ChatTypeChecker;
