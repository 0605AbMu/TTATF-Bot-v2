import IConfig from "./IConfig";
import DefaultConfig from "./data/default.json";
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
  config = null;
else if (process.env.NODE_ENV === "development")
  // config will be development data
  config = null;
else config = DefaultConfig;

console.info(`Config Type: ${config ? config.type : "Default"}`);
export default config;
