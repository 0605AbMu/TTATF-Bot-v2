import { GridFSBucket, GridFSFile } from "mongodb";
import client from "../../DataBase/DBConnector";
const db = client.db("TTATF");

const bucket = new GridFSBucket(db, { bucketName: "Aggrement_Bucket" });

export default bucket;
