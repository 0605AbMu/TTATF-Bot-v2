import { Collection } from "mongodb";
import client from "../../DataBase/DBConnector";

export type StructureType = {
  code: string;
  name: string;
};

export class Employee {
  public id: number;
  public full_name: string;
  public short_name: string;
  public first_name: string;
  public second_name: string;
  public third_name: string;
  public image: string;
  public year_of_enter: string;
  public employee_id_number: string;
  public gender: {
    code: string;
    name: string;
  };
  public department: {
    id: number;
    name: string;
    code: string;
    parent: number;
    structureType: StructureType
  };
  public academicDegree: {
    code: string;
    name: string;
  };
  public academicRank: {
    code: string;
    name: string;
  };
  public employmentForm: {
    code: string;
    name: string;
  };
  public employmentStaff: {
    code: string;
    name: string;
  };
  public staffPosition: {
    code: string;
    name: string;
  };
  public employeeStatus: {
    code: string;
    name: string;
  };
  public employeeType: {
    code: string;
    name: string;
  };
  public email: string;
  public telefon: string;
  public telegram: string;
  public contract_number: string;
  public decree_number: string;
  public contract_date: number;
  public decree_date: number;
  public created_at: number;
  public update_at: number;
  public hash: string;
}
const EmployeeModel: Collection<Employee> = client
  .db("TTATF")
  .collection("Employee-Data");

export default EmployeeModel;
