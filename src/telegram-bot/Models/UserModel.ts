import { Collection, Document, ObjectId } from "mongodb";
import { User } from "telegraf/types";
import client from "../../DataBase/DBConnector";
import { HemisData } from "./HemisDataModel";
export type UserRole = "Admin" | "Student" | "User";

export interface IUser extends Document {
  telegamUser: User;
  registratedDate: Date;
  role: UserRole;
  ///HemisData
  _id?: ObjectId;
  StudentData?: {
    login: string;
    password: string;
    HemisData?: HemisData;
  };
  // HemisData?: Hemis/DataType;
}

const UserModel: Collection<IUser> = client
  .db("TTATF")
  .collection("Telegram-Users");

export default UserModel;
