import { Collection, Document, ObjectId } from "mongodb";
import { User } from "telegraf/types";
import client from "../../DataBase/DBConnector";
import { HemisData } from "./HemisDataModel";
import { Location, Contact } from "telegraf/typings/core/types/typegram";
import { Student } from "./StudentModel";
export type UserRole = "Admin" | "Student" | "User";

export interface IUser extends Document {
  telegamUser: User;
  registratedDate: Date;
  role: UserRole;
  _id?: ObjectId;
  StudentData?: Student;
}

const UserModel: Collection<IUser> = client
  .db("TTATF")
  .collection("Telegram-Users");

export default UserModel;
