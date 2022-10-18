import { HemisDataType } from "../../../Models/UserModel";

import {
  IncorrectLoginAndPassword,
  StudentNotFoundError,
} from "../Errors/Errors";

async function GetDataFromHemis(
  login: string,
  password: string
): Promise<HemisDataType> {
  return {
    login: login,
    password: password,
    StudentMeta: {
      full_name: "A. Sh. Sh",
      short_name: "A. Sh. Sh",
      student_id_number: login,
    },
  };
}

export default GetDataFromHemis;
