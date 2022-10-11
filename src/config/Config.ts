import IConfig from "./IConfig";
import DefaultConfig from "./data/default.json";
import DevelopmentConfig from "./data/development.json";
import ProductionConfig from "./data/production.json";
import DotEnv from "dotenv";

class Config implements IConfig {
  type: string;
  APP_HOST: string;
  APP_PORT: number;

  constructor() {
    // Detect ENV type?
    this.InitalizeENV();
    // Assign ENV parameters
    this.AssignConfigData();
    console.info("Config Initialized. Config type: " + this.type);
  }

  private InitalizeENV() {
    DotEnv.config();
    if (process.env.NODE_ENV) {
      this.type = process.env.NODE_ENV;
    } else this.type = "Default";
  }

  private AssignConfigData() {
    let configData: IConfig;
    if (this.type.toLowerCase() === "development")
      configData = DevelopmentConfig;
    else if (this.type.toString() === "production")
      configData = ProductionConfig;
    else configData = DefaultConfig;
    Object.keys(configData).forEach((x) => {
      this[x] = configData[x];
    });
  }
}

export default new Config();
