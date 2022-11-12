import { Collection, Document, ObjectId } from "mongodb";
import { User } from "telegraf/types";
import client from "../../DataBase/DBConnector";
import { IHemisData } from "./HemisDataModel";
import { Location, Contact } from "telegraf/typings/core/types/typegram";

export interface IStudent {
  login?: string;
  password?: string;
  HemisData?: IHemisData;
  phone?: string;
  tgPhone?: Contact;
  email?: string;
  birthDate?: Date;
  gender?: "Erkak" | "Ayol";
  stir?: number;
  jshshir?: number;
  rent?: {
    location: {
      city?: string;
      street?: string;
      address?: string;
      geo: Location.CommonLocation;
    };
    amount: number;
  };
  _id?: ObjectId;
}

export class Student implements IStudent {
  login?: string = null;
  password?: string = null;
  HemisData?: IHemisData = null;
  phone?: string = null;
  tgPhone?: Contact = null;
  email?: string = null;
  birthDate?: Date;
  gender?: "Erkak" | "Ayol" = "Erkak";
  stir?: number = null;
  jshshir?: number = null;
  rent?: {
    location: {
      city?: string;
      street?: string;
      address?: string;
      geo: Location.CommonLocation;
    };
    amount: number;
  } = null;
  _id: ObjectId = null;
}

const StudentModel: Collection<Student> = client
  .db("TTATF")
  .collection("Students");

export default StudentModel;
