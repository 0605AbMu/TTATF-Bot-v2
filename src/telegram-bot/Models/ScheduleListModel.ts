import { Collection } from "mongodb";
import client from "../../DataBase/DBConnector";

export type StructureType = {
  code: string;
  name: string;
};

export class ScheduleListData {
  public Id: number;
  public subject: {
    id: number;
    name: string;
  };
  faculty: {
    id: number;
    name: string;
    code: string;
    structureType: StructureType;
  };
  department: {
    id: number;
    name: string;
    code: string;
    structureType: StructureType;
  };
  educationYear: {
    code: string;
    name: string;
    current: boolean;
  };
  semester: {
    code: string;
    name: string;
  };
  group: {
    id: number;
    name: string;
  };
  auditorium: {
    code: string;
    name: string;
  };
  trainingType: {
    code: string;
    name: string;
  };
  lessonPair: {
    code: string;
    name: string;
    start_time: string;
    end_time: string;
  };
  employee: {
    id: number;
    name: string;
  };
  lesson_date: number;
  _week: number;
  weekStartTime: number;
  weekEndTime: number;
}
const ScheduleListModel: Collection<ScheduleListData> = client
  .db("TTATF")
  .collection("Schedule-List-Data");

export default ScheduleListModel;
