import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import joi from "joi"
import { MongoClient, ObjectId } from "mongodb"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`)
})

const mongoClient = new MongoClient(DATABASE_URL)
let db

try {
    await mongoClient.connect()
    db = mongoClient.db()
    console.log("Data base is connected")
} catch (error) {
    console.log("Can't connect to data base")
}