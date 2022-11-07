import { Collection, Document, ObjectId } from "mongodb";
import { User } from "telegraf/types";
import client from "../../DataBase/DBConnector";
import { IHemisData } from "./HemisDataModel";
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
    HemisData?: IHemisData;
    RentData?: {
      liveLocation?: {
        googleLocation?: string;
        address: string;
      };
      StirNumber: number;
      RentAmount: number;
    };
    phone?: string;
    email?: string;
  };
}

const UserModel: Collection<IUser> = client
  .db("TTATF")
  .collection("Telegram-Users");

export default UserModel;
