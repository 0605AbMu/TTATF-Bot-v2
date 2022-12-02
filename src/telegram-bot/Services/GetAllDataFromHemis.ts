import { AxiosResponseTransformer } from "axios";
import https from "https";
import Config from "../../config/Config";
import { HemisData } from "../Models/HemisDataModel";
import axios from "../Constants/Axios";
function GetPages(): Promise<{
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
      const result = await axios.get("/data/student-list?limit=200");

      if (result.data.code == 200 && result.data.data)
        res(result.data.data.pagination);
      else rej(new Error(result.data.error));
      return result.data.data.pagination;
    } catch (error) {
      rej(error);
    }
  });
}

function GetOnePageData(pageIndex): Promise<HemisData[]> {
  return new Promise(async (res, rej) => {
    try {
      const result = await axios.get("/data/student-list?limit=200&page=" + pageIndex);
      if (result.data.code == 200) res(result.data.data.items);
      else rej(new Error("Bu sahifa ma'lumotlari topilmadi."));
    } catch (error) {
      rej(error);
    }
  });
}

export default function GetAllDataFromHemis(): Promise<HemisData[]> {
  return new Promise(async (res, rej) => {
    try {
      const pages = await GetPages();
      console.log(pages);
      const allPromise = [];
      let result: HemisData[] = [];
      for (let index = 1; index <= pages.pageCount; index++) {
        let data = await GetOnePageData(index);
        result = [...result, ...data]
      }
      // result = result.flat(Infinity);
      // if (pages.totalCount != result.length)
      //   rej(
      //     new Error(
      //       "Barcha talabalarning ma'lumotlarini olishning iloji bo'lmadi."
      //     )
      //   );
      // else 
      res(result);
    } catch (error) {
      rej(error);
    }
  });
}
