import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

const mongoClient = new MongoClient(DATABASE_URL);
let db;

try {
  await mongoClient.connect();
  db = mongoClient.db("MyWallet");
  console.log('Connected to database!');

} catch (error) {
  console.log("Can't connect to database");
}

export default db