import { LogCodes } from "../Constants/LogCodes";

export default interface ILog extends Error {
  message: string;
  statusCode?: LogCodes;
}
