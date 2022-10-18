import winston, { loggers } from "winston";
import Config from "../config/Config";
import { TelegramError } from "telegraf";
import { MongoAPIError } from "mongodb";

class Logger {
  private LogPath: string = Config.LOG_PATH;
  private logger: winston.Logger;
  constructor(logFileName?: string) {
    if (logFileName) this.LogPath += logFileName;
    else this.LogPath += "default.log";

    this.logger = winston.createLogger({
      // format: winston.format.colorize().,
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.cli(),
            winston.format.colorize()
          ),
        }),
        new winston.transports.File({
          filename: this.LogPath,
          silent: true,
          format: winston.format.combine(
            winston.format.simple(),
            winston.format.colorize()
          ),
        }),
      ],
    });
  }

  // Log Any Error
  public LogError(error: Error) {
    this.logger.error(`\n${error.name}\n${error.message}\n${error.stack}`);
  }

  public LogTelegramError(error: TelegramError): void {
    this.logger.error(`
Code: ${error.response.error_code};
Description: ${error.response.description};
Method: ${error.on["method"]};
Payload: ${JSON.stringify(error.on["payload"])};
Stack: ${error.stack};`);
  }
  // Log Any Messages
  public LogMessage(message: string) {
    this.logger.info(message);
  }

  // Singleton
  public static instance: Logger | null = null;
  public static CreateInstance(): Logger {
    if (this.instance == null) this.instance = new Logger();
    return this.instance;
  }
}

Logger.CreateInstance();

export default Logger.instance;
