import MyContext from "../Interfaces/MyContext";

function ChatTypeChecker(ctx: MyContext, next) {
  if (ctx.chat?.type !== "private") {
    ctx.replyWithHTML("<b>Bot faqat shaxsiy yozishmalarda ishlaydi</b>");
    return;
  }
  next();
}

export default ChatTypeChecker;
