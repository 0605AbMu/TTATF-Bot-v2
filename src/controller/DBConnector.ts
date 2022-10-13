import { MongoClient } from "mongodb";
import Config from "../config/Config";
import logger from "../logger/logger";

const client = new MongoClient(Config.MONGO_URL);

export default client;
