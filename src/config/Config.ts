import IConfig from "../interfaces/IConfig";
import DefaultConfig from "./data/default.json";
import DevelopmentConfig from "./data/development.json";
import ProductionConfig from "./data/production.json";
import DotEnv from "dotenv";

class Config implements IConfig {
  type: string;
  APP_HOST: string;
  APP_PORT: number;
  TELEGRAM_BOT_TOKEN: string;
  LOG_PATH: string;
  MONGO_URL: string;
  MONGO_DB_NAME: string;
  HEMIS_API_URL: string;
  BEARER_TOKEN_FOR_HEMIS: string;
  LAST_AGGREMENT_FILE_ORDER: number;
  GLOBAL_APP_HOST: string;
  GLOBAL_APP_PORT: number;

  constructor() {
    // Detect ENV type?
    this.InitalizeENV();
    // Assign ENV parameters
    this.AssignConfigData();
    console.info("Config Initialized. Config type: " + this.type);
  }

  // Detecting ENV type. ENV type detected from process.env else [Default]
  private InitalizeENV() {
    DotEnv.config();
    if (process.env.NODE_ENV) {
      this.type = process.env.NODE_ENV;
    } else this.type = "Default";
  }

  private AssignConfigData() {
    let configData: IConfig;
    if (this.type.toLowerCase() === "development")
      configData = <IConfig>DevelopmentConfig;
    else if (this.type.toString() === "production")
      configData = <IConfig>ProductionConfig;
    else configData = <IConfig>DefaultConfig;
    Object.keys(configData).forEach((x) => {
      this[x] = configData[x];
    });
  }
}

export default new Config();
