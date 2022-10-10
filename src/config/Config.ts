import IConfig from "./IConfig";
import DefaultConfig from "./data/default.json";

let config: IConfig | null = null;

if (process.env.NODE_ENV === "production")
  // config will be production data
  config = null;
else if (process.env.NODE_ENV === "development")
  // config will be development data
  config = null;
else config = DefaultConfig;

console.info(`Config Type: ${config.type}`);
export default config;
