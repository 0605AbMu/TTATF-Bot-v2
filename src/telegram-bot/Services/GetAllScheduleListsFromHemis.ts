import { ScheduleListData } from "../Models/ScheduleListModel";
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
      const result = await axios.get("/data/schedule-list?limit=200");
      if (result.data.code == 200 && result.data.data)
        res(result.data.data.pagination);
      else rej(new Error(result.data.error));
      return result.data.data.pagination;
    } catch (error) {
      rej(error);
    }
  });
}

function GetOnePageData(pageIndex): Promise<ScheduleListData[]> {
  return new Promise(async (res, rej) => {
    try {
      const result = await axios.get(
        "data/schedule-list?limit=200&page=" + pageIndex,
        {}
      );
      if (result.data.code == 200) res(result.data.data.items);
      else rej(new Error("Bu sahifa ma'lumotlari topilmadi."));
    } catch (error) {
      rej(error);
    }
  });
}

export default function GetAllDataFromHemis(): Promise<ScheduleListData[]> {
  return new Promise(async (res, rej) => {
    try {
      const pages = await GetPages();
      const allPromise: Promise<ScheduleListData[]>[] = [];
      let result: ScheduleListData[] = [];
      for (let index = 1; index <= pages.pageCount; index++) {
        try {
          let list = await GetOnePageData(index);
          list.map((x) => result.push(x));
        } catch (error) {}
      }
      res(result);
    } catch (error) {
      rej(error);
    }
  });
}
