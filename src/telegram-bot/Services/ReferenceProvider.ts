import { IUser } from "../Models/UserModel";
import https from "https";
import Axios, { AxiosDefaults, AxiosError, AxiosResponse } from "axios";
import { parse as HTMLParser, HTMLElement } from "node-html-parser";
import FormData from "form-data";
const axios = new Axios.Axios({
  baseURL: "https://student.ttatf.uz",
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

export enum Status {
  "Pending",
  "Finished",
  "NotStarted",
}
export class ReferenceProvider {
  public Status: Status = Status.NotStarted;
  private cookie: string[] = null;
  private User: IUser = null;
  constructor(user: IUser) {
    this.Status = Status.NotStarted;
    this.User = user;
  }
  public async GetCookies() {
    try {
      const result = await this.GetStudentFrontEndCookie(
        this.User.StudentData.login,
        this.User.StudentData.password
        // "368221100658",
        // "159357Dax"
      );
      this.cookie = result;
      return result;
    } catch (error) {
      throw error;
    }
  }

  private GetStudentFrontEndCookie(
    login: string,
    password: string
  ): Promise<string[]> {
    return new Promise(async (res, rej) => {
      try {
        const response1: AxiosResponse = await axios.get("/dashboard/login");
        const parsedData = HTMLParser(response1.data);
        const token = parsedData
          .querySelector("meta[name='csrf-token']")
          ?.getAttribute("content");
        const param = parsedData
          .querySelector("meta[name='csrf-param']")
          ?.getAttribute("content");
        if (!param || !token)
          rej(new Error("HEMIS tizimi ishlamayotgan bo'lishi mumkin!"));
        const RequestData = new FormData();
        RequestData.append("FormStudentLogin[login]", login);
        RequestData.append("FormStudentLogin[password]", password);
        RequestData.append(param ? param : "", token);
        const response2: AxiosResponse = await axios.post(
          "/dashboard/login",
          RequestData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Cookie: response1.headers["set-cookie"],
            },
            maxRedirects: 0,
          }
        );
        if (response2.headers["set-cookie"] === undefined) {
          rej(new Error("Bunday login yoki parolga ega talaba topilmadi!"));
          return;
        }
        this.cookie = response2.headers["set-cookie"];
        res(response2.headers["set-cookie"]);
      } catch (err) {
        rej(err);
      }
    });
  }

  public GetReferenceFilesList(): Promise<HTMLElement[]> {
    return new Promise(async (res, rej) => {
      this.Status = Status.Pending;
      if (!this.cookie) await this.GetCookies();
      try {
        const result = await axios.get("/student/reference", {
          headers: {
            Cookie: this.cookie,
          },
        });
        const parsedData = HTMLParser(result.data);
        if (!parsedData) rej(new Error("Noma'lum xatolik!"));
        const table = parsedData.querySelector("table");
        if (!table) rej(new Error("Noma'lum xatolik!"));
        const nodes = table
          .getElementsByTagName("tbody")[0]
          .getElementsByTagName("tr");
        res(nodes);
        return;
      } catch (error) {
        rej(error);
      }
    });
  }

  public GetRerefenceFileById(fileId: string): Promise<ArrayBuffer> {
    return new Promise(async (res, rej) => {
      const result = await axios.get("/student/reference?file=" + fileId, {
        headers: {
          Cookie: this.cookie,
        },
        responseType: "arraybuffer",
      });
      if (result.status != 200) rej(new Error("Bu fayl topilmadi"));
      this.Status = Status.Finished;
      res(result.data);
    });
  }
}
