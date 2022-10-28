import { Axios, AxiosResponseTransformer } from "axios";
import https from "https";
import Config from "../../config/Config";
import HemisDataModel, { IHemisData } from "../Models/HemisDataModel";
const axios = new Axios({
  baseURL: Config.HEMIS_API_URL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  headers: {
    Authorization: "Bearer " + Config.BEARER_TOKEN_FOR_HEMIS,
  },
  responseType: "json",
  transformResponse: (data) => {
    return JSON.parse(data);
  },
});

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
      const result = await axios.get("/data/student-list");

      if (result.data.code == 200 && result.data.data)
        res(result.data.data.pagination);
      else rej(new Error(result.data.error));
      return result.data.data.pagination;
    } catch (error) {
      rej(error);
    }
  });
}

function GetOnePageData(pageIndex): Promise<IHemisData> {
  return new Promise(async (res, rej) => {
    try {
      const result = await axios.get("/data/student-list?page=" + pageIndex);
      if (result.data.code == 200) res(result.data.data.items);
      else rej(new Error("Bu sahifa ma'lumotlari topilmadi."));
    } catch (error) {
      rej(error);
    }
  });
}

export default function GetAllDataFromHemis(): Promise<IHemisData[]> {
  return new Promise(async (res, rej) => {
    try {
      const pages = await GetPages();
      const allPromise = [];
      for (let index = 1; index <= pages.pageCount; index++) {
        allPromise.push(GetOnePageData(index));
      }
      const result: IHemisData[] = await (
        await Promise.all(allPromise)
      ).flat(Infinity);
      if (pages.totalCount != result.length)
        rej(
          new Error(
            "Barcha talabalarning ma'lumotlarini olishning iloji bo'lmadi."
          )
        );
      else res(result);
    } catch (error) {
      rej(error);
    }
  });
}
