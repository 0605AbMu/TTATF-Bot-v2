import client from "../../DataBase/DBConnector";
import { Collection, ObjectId, Document } from "mongodb";
import { IUser } from "./UserModel";

export interface IHemisData extends Document {
  _id: ObjectId;
  student_id_number: number;
  full_name: string;
  short_name: string;
  image: string;
  avg_gpa: number;
  total_credit: number;
  address: string;
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
  updated_at: number;
  // .....
}

const HemisDataModel: Collection<IHemisData> = client
  .db("TTATF")
  .collection("Hemis-Students-Data");

export default HemisDataModel;
