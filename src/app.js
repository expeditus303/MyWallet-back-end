import bcrypt from "bcrypt";
import cors from "cors";
import dayjs from "dayjs";
import dotenv from "dotenv";
import express from "express";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
import { v4 as uuid } from "uuid";

const USERS = "users";
const REGISTRY = "registry";
const SESSIONS = "sessions";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
});

const mongoClient = new MongoClient(DATABASE_URL);
let db;

try {
    await mongoClient.connect();
    db = mongoClient.db();
    console.log("Data base is connected");
} catch (error) {
    console.log("Can't connect to data base");
}

app.get("/registry", async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if (!token) return res.sendStatus(401);

    const registrySchema = joi.object({
        token: joi.string().required(),
    });

    const validation = registrySchema.validate({token});

    if (validation.error) return res.status(400).send(validation.error.message);

    try {
        const tokenExists = await db.collection(SESSIONS).findOne({ token });

        if (!tokenExists) return res.sendStatus(401);

        const userRegistry = await db.collection(REGISTRY).find({ userId: tokenExists.user_id }).toArray()

        res.status(200).send(userRegistry)

    } catch (error) {
        res.send(error)
    }

})

app.post("/sign-in", async (req, res) => {
    const { email } = req.body;
    const { password } = req.headers;

    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required(),
    });

    const validation = userSchema.validate({ email, password });

    if (validation.error) return res.sendStatus(400);

    try {
        const emailExists = await db.collection(USERS).findOne({ email });

        if (!emailExists)
            return res
                .status(400)
                .send("You have entered an invalid username or password");

        const hashPassword = bcrypt.compareSync(password, emailExists.password);

        if (!hashPassword)
            return res
                .status(400)
                .send("You have entered an invalid username or password");

        const token = uuid();

        await db.collection(SESSIONS).insertOne({ user_id: emailExists._id, token });

        return res.status(200).send(token);
    } catch (error) { }
});

app.post("/sign-up", async (req, res) => {
    const { name, email } = req.body;
    const { password, confirmpassword } = req.headers;

    const userSchema = joi.object({
        name: joi.string().min(2).required(),
        email: joi.string().email().required(),
        password: joi
            .string()
            .min(8)
            .regex(/^(?=.*[A-Z])(?=.*[a-z])/)
            .required()
            .messages({
                "string.pattern.base":
                    "password must have at least one uppercase and one lowercase letter",
            }),
        confirmpassword: joi
            .string()
            .valid(joi.ref("password"))
            .required()
            .messages({ "any.only": "passwords do not match" }),
    });

    const validation = userSchema.validate({
        name,
        email,
        password,
        confirmpassword,
    });

    if (validation.error) return res.sendStatus(400);

    const passwordHashed = bcrypt.hashSync(password, 10);

    try {
        const emailExists = await db.collection(USERS).findOne({ email });

        if (emailExists) return res.status(409).send("email is already in use");

        await db
            .collection(USERS)
            .insertOne({ name, email, password: passwordHashed });

        return res.send("ok");
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post("/new-transaction", async (req, res) => {
    const { description, value, type } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if (!token) return res.sendStatus(401);

    const newTransactionSchema = joi.object({
        description: joi.string().min(2).required(),
        value: joi.number().required(),
        type: joi.string().valid("income", "expense").required(),
        token: joi.string().required(),
    });

    const validation = newTransactionSchema.validate({
        description,
        value,
        type,
        token
    });

    if (validation.error) return res.status(400).send(validation.error.message);

    try {
        const tokenExists = await db.collection(SESSIONS).findOne({ token });

        if (!tokenExists) return res.sendStatus(401);

        const lastSubtotal = await db.collection(REGISTRY).find({ userId: tokenExists.user_id }).sort({ $natural: -1 }).limit(1).toArray()

        const today = dayjs().format("DD-MM");

        let newTransaction

        if (type === "income") {
            newTransaction = {
                userId: tokenExists.user_id,
                date: today,
                description: description,
                value: Number(value),
                type: type,
                subtotal: Number(lastSubtotal.length > 0 ? (Number(lastSubtotal[0].subtotal) + Number(value)).toFixed(2) : 0 + Number(value).toFixed(2))
            };
        } else if (type === "expense") {
            newTransaction = {
                userId: tokenExists.user_id,
                date: today,
                description: description,
                value: Number(value),
                type: type,
                subtotal: Number(lastSubtotal.length > 0 ? (Number(lastSubtotal[0].subtotal) - Number(value)).toFixed(2) : 0 - Number(value).toFixed(2))
            };
        }

        await db.collection(REGISTRY).insertOne(newTransaction);

        return res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        console.log(error)
    }
});
