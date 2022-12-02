import client from "../../DataBase/DBConnector";
import { Collection, ObjectId, Document } from "mongodb";
import { IUser } from "./UserModel";

export class HemisData {
  _id: ObjectId;
  student_id_number: string;
  full_name: string;
  short_name: string;
  image: string;
  avg_gpa: number;
  total_credit: number;
  address: string;
  birth_date?: number;
  gender?: {
    code: number;
    name: string;
  };
  jshshir?: number | string;
  seria?: number | string;
  province: {
    code: string;
    name: string;
  };
  district: {
    code: string;
    name: string;
  };
  studentStatus: {
    code: string;
    name: string;
  };
  level: {
    code: string;
    name: string;
  };
  group: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
  updated_at: number;
  // .....
}

const HemisDataModel: Collection<HemisData> = client
  .db("TTATF")
  .collection("Hemis-Students-Data");

export default HemisDataModel;
