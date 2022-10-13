import { Context } from "telegraf";
import Session from "./session";

export default interface MyContext extends Context {
  session: Session;
}
