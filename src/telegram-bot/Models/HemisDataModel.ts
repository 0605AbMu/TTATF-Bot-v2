import client from "../../DataBase/DBConnector";
import { Collection, ObjectId, Document } from "mongodb";
import { IUser } from "./UserModel";

export interface IHemisData extends Document {
  _id: ObjectId;
  student_id_number: number;
  full_name: string;
  short_name: string;
  // .....
}

const HemisDataModel: Collection<IHemisData> = client
  .db("TTATF")
  .collection("Hemis-Students-Data");

export default HemisDataModel;
