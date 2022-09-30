import { TelegramError, Context } from "telegraf";
import { MaybePromise } from "telegraf/typings/composer";
import logger from "../../components/logger";

export default function ErrorHandler(
  error: TelegramError | any,
  ctx: Context
): MaybePromise<void> {
  logger({
    date: new Date(Date.now()),
    level: "error",
    message: error.message + error.description,
    property: {
      code: error.code,
    },
  });
}
