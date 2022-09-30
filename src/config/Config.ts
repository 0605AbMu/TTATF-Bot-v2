// import modules
import Dotenv from "dotenv";
import IConfig from "../interfaces/IConfig";

// import configurations
import DefaultConfig from "./default.json";
import DevelopmentConfig from "./development.json";
import ProductionConfig from "./production.json";

// Setting Environment variables
Dotenv.config({ path: ".env" });

let config: IConfig = DefaultConfig;

if (process.env.NODE_ENV === "development") config = DevelopmentConfig;
else config = ProductionConfig;

console.log(config.MONGO.DBNAME);
console.log("config.MONGO.DBNAME");
