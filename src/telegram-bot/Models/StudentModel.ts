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
  birthDate?: string | Date;
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

export class Student {
  login?: string = null;
  password?: string = null;
  HemisData?: IHemisData = null;
  phone?: string = null;
  tgPhone?: Contact = null;
  email?: string = null;
  birthDate?: string;
  gender?: "Erkak" | "Ayol" = "Erkak";
  stir?: number = null;
  jshshir?: number | string = null;
  rent?: {
    location: {
      city?: string;
      street?: string;
      address?: string;
      geo: Location.CommonLocation;
    };
    amount: number | string;
  } = null;
  _id: ObjectId = null;
}

const StudentModel: Collection<Student> = client
  .db("TTATF")
  .collection("Students");

export default StudentModel;
