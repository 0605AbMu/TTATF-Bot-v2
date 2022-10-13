import { MongoClient, Db } from "mongodb";
import client from "./DBConnector";

const Users = client.db("TTATF").collection("Telegram-Bot-Users");

export default Users;
