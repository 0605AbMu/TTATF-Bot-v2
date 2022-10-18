import { MongoClient } from "mongodb";
import Config from "../config/Config";
import Logger from "../logger/logger";

let client: MongoClient;
(() => {
  try {
    client = new MongoClient(Config.MONGO_URL);
  } catch (error) {
    Logger.LogError(error);
    process.exit(1);
  }
})();

export default client;
