import { IUser } from "../Models/UserModel";
import https from "https";
import Axios, { AxiosDefaults, AxiosError, AxiosResponse } from "axios";
import { parse as HTMLParser, HTMLElement } from "node-html-parser";
import FormData from "form-data";
import Cookie from "cookie";
import CookieParser from "set-cookie-parser";
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
  private CSRFToken: { token: string; param: string };
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

  private GetCsrfTokenAndParam(
    path: string = "/dashboard/login"
  ): Promise<{ token: string; param: string; setCookie?: string[] }> {
    return new Promise(async (res, rej) => {
      const response1: AxiosResponse = await axios.get(path);
      const parsedData = HTMLParser(response1.data);
      const token = parsedData
        .querySelector("meta[name='csrf-token']")
        ?.getAttribute("content");
      const param = parsedData
        .querySelector("meta[name='csrf-param']")
        ?.getAttribute("content");
      if (!param || !token)
        rej(new Error("HEMIS tizimi ishlamayotgan bo'lishi mumkin!"));
      this.CSRFToken = {
        param: param,
        token: token,
      };
      res({
        token: token,
        param: param,
        setCookie: response1.headers["set-cookie"],
      });
    });
  }

  private GetStudentFrontEndCookie(
    login: string,
    password: string
  ): Promise<string[]> {
    return new Promise(async (res, rej) => {
      try {
        const { param, token, setCookie } = await this.GetCsrfTokenAndParam(
          "/dashboard/login"
        );
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
              Cookie: setCookie,
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
        const result = await axios.get("/student/reference/?get=1", {
          headers: {
            Cookie: this.cookie,
          },
        });
        const parsedData = HTMLParser(result.data);
        if (!parsedData)
          rej(
            new Error(
              "Noma'lum xatolik! Balki HEMIS tizimidagi parolingiz yetarlicha xavfsiz emas! Agar shunday bo'lsa parolingizni almashtiring."
            )
          );
        const table = parsedData.querySelector("table");
        if (!table)
          rej(
            new Error(
              "Noma'lum xatolik! Balki HEMIS tizimidagi parolingiz yetarlicha xavfsiz emas! Agar shunday bo'lsa parolingizni almashtiring."
            )
          );
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

  public ChangePassword(newPassword: string): Promise<boolean> {
    return new Promise(async (res, rej) => {
      await this.GetCookies();
      const { param, token, setCookie } = await this.GetCsrfTokenAndParam(
        "/dashboard/profile"
      );
      const formData = new FormData();
      formData.append("FormStudentProfile[change_password]", 1);
      formData.append("FormStudentProfile[password]", newPassword);
      formData.append("FormStudentProfile[confirmation]", newPassword);
      formData.append(
        this.CSRFToken.param ? this.CSRFToken.param : "",
        this.CSRFToken.token
      );
      setCookie.push(this.cookie.find((x) => x.indexOf("_frontendUser") != -1));
      const response = await axios.post("/dashboard/profile/", formData, {
        headers: {
          Cookie: setCookie,
        },
        maxRedirects: 0,
      });
      if (response.status == 302) {
        res(true);
      } else
        rej(new Error("Parolni almashtirib bo'lmadi. " + response.statusText));
    });
  }
}
