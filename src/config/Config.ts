import IConfig from "./IConfig";
import DefaultConfig from "./data/default.json";
import DevelopmentConfig from "./data/development.json";
import ProductionConfig from "./data/production.json";
import DotEnv from "dotenv";

DotEnv.config();
console.info(
  `Environment Type: ${
    process.env.NODE_ENV ? process.env.NODE_ENV.toString() : "Default"
  }`
);

let config: IConfig | null = null;

if (process.env.NODE_ENV === "production")
  // config will be production data
  config = ProductionConfig;
else if (process.env.NODE_ENV === "development")
  // config will be development data
  config = DevelopmentConfig;
else config = DefaultConfig;

console.info(`Config Type: ${config ? config.type : "Default"}`);
export default config;
