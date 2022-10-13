import { User as TelegramUser } from "telegraf/src/core/types/typegram";
import { Roles } from "../constants/roles";

export default interface IUserData {
  telegramData: TelegramUser | null;
  registretedDate: Date;
  role: Roles;
}
