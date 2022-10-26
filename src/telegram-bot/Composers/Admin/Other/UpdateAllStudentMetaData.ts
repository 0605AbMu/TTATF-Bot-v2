import { Axios, AxiosResponseTransformer } from "axios";
import Config from "../../../../config/Config";
import https from "https";

import HemisDataModel, { HemisData } from "../../../Models/HemisDataModel";
import UserModel from "../../../Models/UserModel";
import logger from "../../../../logger/logger";

const axios = new Axios({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  baseURL: Config.HEMIS_API_URL,
  headers: {
    Authorization: "Bearer " + Config.BEARER_TOKEN_FOR_HEMIS,
  },
  transformResponse: [
    (data, header, status) => {
      return JSON.parse(data);
    },
  ],
});
export type pageDataType = {
  totalCount: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
};

export async function GetPageData(): Promise<pageDataType | null> {
  try {
    const res = await axios.get("/data/student-list", { responseType: "json" });
    console.log(res.data);
    if (res.data.code == 200) {
      return res.data.pagination;
    } else throw new Error(res.data.error);
  } catch (error) {
    throw error;
  }
}

export async function GetOnePageData(pageNumber: number) {
  try {
    const res = await axios.get("/data/student-list?page=" + pageNumber);
    if (res.data.code != 200) throw new Error(res.data.error);
    else return res.data;
  } catch (error) {
    throw error;
  }
}

export async function GetAllData(): Promise<number> {
  //   let pageData: pageDataType | null;
  //   try {
  //     pageData = await GetPageData();
  //     if (pageData == null)
  //       throw new Error("Ma'lumotlarni hemisdan olishning iloji bo'lmadi.");
  //   } catch (error) {
  //     throw error;
  //   }
  let errorPageCount = 0;
  await HemisDataModel.deleteMany({});
  for (let i = 1; i <= 160; i++) {
    try {
      let data = await GetOnePageData(1);
      console.log(data.items)
      await HemisDataModel.insertMany(<HemisData[]>data.items);
    } catch (error) {
      errorPageCount++;
      //   logger?.LogError(error);
      continue;
    }
  }
  return errorPageCount;
}
