import { Collection, Document, ObjectId } from "mongodb";
import { User } from "telegraf/types";
import client from "../../DataBase/DBConnector";
import { HemisData } from "./HemisDataModel";
import { Location, Contact } from "telegraf/typings/core/types/typegram";

export interface IStudent {
  login?: string;
  password?: string;
  HemisData?: HemisData;
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
  HemisData?: HemisData = null;
  phone?: string = null;
  tgPhone?: Contact = null;
  email?: string = null;
  stir?: number = null;
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
