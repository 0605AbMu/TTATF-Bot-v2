import { Employee } from "../Models/EmployeeModel";
import axios from "../Constants/Axios";

function GetPages(type: string): Promise<{
  /**
   *Jami ma'lumotlar soni
   */
  totalCount: number;
  /**
   * Bitta sahifadagi ma'lumotlar soni
   */
  pageSize: number;
  /**
   * Sahifalar soni
   */
  pageCount: number;
  /**
   * Hozirgi sahifa tartib raqami
   */
  currentPage: number;
}> {
  return new Promise(async (res, rej) => {
    try {
      const result = await axios.get("/data/employee-list?limit=200" + `&type=${type}`);
      if (result.data.code == 200 && result.data.data)
        res(result.data.data.pagination);
      else rej(new Error(result.data.error));
      return result.data.data.pagination;
    } catch (error) {
      rej(error);
    }
  });
}

function GetOnePageData(pageIndex, type: string): Promise<Employee[]> {
  return new Promise(async (res, rej) => {
    try {
      const result = await axios.get(
        "data/employee-list?limit=200&page=" + pageIndex + `&type=${type}`,
        {}
      );
      if (result.data.code == 200) res(result.data.data.items);
      else rej(new Error("Bu sahifa ma'lumotlari topilmadi."));
    } catch (error) {
      rej(error);
    }
  });
}

export default function GetAllDataFromHemis(): Promise<Employee[]> {
  return new Promise(async (res, rej) => {
    try {

      // Data retreiving for teachers
      let pages = await GetPages("teacher");
      let result: Employee[] = [];
      for (let index = 1; index <= pages.pageCount; index++) {
        try {
          let list = await GetOnePageData(index, "teacher");
          result = result.concat(list)
        } catch (error) { }
      }

      // Data retreiving for Employee
      pages = await GetPages("employee");
      for (let index = 1; index <= pages.pageCount; index++) {
        try {
          let list = await GetOnePageData(index, "employee");
          result = result.concat(list)
        } catch (error) { }
      }

      res(result);
    } catch (error) {
      rej(error);
    }
  });
}
