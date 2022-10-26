import { StudentMeta, IUser } from "../Models/UserModel";
import { Axios } from "axios";
import https from "https";
import Config from "../../config/Config";
import { ReferenceProvider } from "./ReferenceProvider";
const axios = new Axios({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  baseURL: Config.HEMIS_API_URL,
  headers: {
    Authorization: "Bearer " + Config.BEARER_TOKEN_FOR_HEMIS,
  },
});

export async function GetStudentMeta(user: IUser): Promise<StudentMeta | null> {
  const res = await axios.get(
    "/data/student-list?search=" + user.HemisData?.login
  );
  if (res.status == 200 && res.data.success && res.data.items) {
    return res.data.items[0];
  }
  return null;
}

export async function CheckStudentFully(user: IUser): Promise<boolean> {
  try {
    const cookie = new ReferenceProvider(user).GetCookies();
    console.log(cookie);
    return true;
  } catch (err) {
    return false;
  }
}
