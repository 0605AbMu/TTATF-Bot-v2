import { Collection, Document, ObjectId } from "mongodb";
import { User } from "telegraf/types";
import client from "../../DataBase/DBConnector";

export type UserRole = "Admin" | "Student" | "User";
export type HemisDataType = {
  login: string;
  password: string;
  StudentMeta?: {
    full_name: string;
    short_name: string;
    student_id_number: string;
  };
};
export interface IUser extends Document {
  telegamUser: User;
  registratedDate: Date;
  role: UserRole;
  ///HemisData
  _id?: ObjectId;
  HemisData?: HemisDataType;
}

const UserModel: Collection<IUser> = client
  .db("TTATF")
  .collection("Telegram-Users");

export default UserModel;
