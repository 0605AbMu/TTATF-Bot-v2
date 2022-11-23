import { Collection } from "mongodb";
import client from "../../DataBase/DBConnector";

export class StudentPassportData {
  public student_id_number: string;
  public studentName: string;
  public seria: string;
  public jshshir: string;
  constructor(
    student_id_number: string,
    studentName: string,
    seria: string,
    jshshir: string
  ) {
    this.student_id_number = student_id_number;
    this.studentName = studentName;
    this.seria = seria;
    this.jshshir = jshshir;
  }
}
const StudentPassportModel: Collection<StudentPassportData> = client
  .db("TTATF")
  .collection("Student-Pasport-Data");

export default StudentPassportModel;
