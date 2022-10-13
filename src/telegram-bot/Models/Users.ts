import { User as TelegramUser } from "telegraf/typings/core/types/typegram";
import Users from "../../controller/Users";
import { Roles } from "../constants/roles";
import IUserData from "../interfaces/IUserData";
import { ObjectId } from "mongodb";

export class User implements IUserData {
  constructor(telegramData: TelegramUser) {
    this.telegramData = telegramData;
    this.registretedDate = new Date();
  }
  _id: ObjectId;
  telegramData: TelegramUser | null;
  registretedDate: Date;
  hemisData?: any;
  role: Roles = Roles.User;
}

export default Users;
