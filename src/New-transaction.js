import db from "./database.js";
import dayjs from "dayjs";
import joi from "joi";
import { ObjectId } from "mongodb";
import { REGISTRY, SESSIONS, SUBTOTAL } from "./CONSTANTS.js";

export default async function NewTransaction(req, res) {

    let { description, value, type } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    value = Number(value)
  
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
      token,
    });
  
    if (validation.error) return res.status(400).send(validation.error.message);
  
    console.log(value)
    console.log(typeof(value))

    try {
      const tokenExists = await db.collection(SESSIONS).findOne({ token });
  
      if (!tokenExists) return res.sendStatus(401);
  
      const today = dayjs().format("DD-MM");
  
      let newTransaction;
  
      if (type === "income") {
        newTransaction = {
          userId: tokenExists.user_id,
          date: today,
          description: description,
          value: value,
          type: type,
  
          //BREAK
        };
      } else if (type === "expense") {
        newTransaction = {
          userId: tokenExists.user_id,
          date: today,
          description: description,
          value: (value * -1),
          type: type,
        };
      }
  
      const userRegistry = await db
        .collection(REGISTRY)
        .find({ userId: tokenExists.user_id })
        .toArray();
  
      const subtotal = {
        userId: tokenExists.user_id,
        subtotal: Number((newTransaction.value)),
      };
  
      if (userRegistry.length === 0) {
        await db.collection(SUBTOTAL).insertOne(subtotal);
      }
  
      if (userRegistry.length > 0) {
        const userSubtotal = await db
          .collection(SUBTOTAL)
          .findOne({ userId: tokenExists.user_id });
  
        await db
          .collection(SUBTOTAL)
          .updateOne(
            { _id: ObjectId(userSubtotal._id) },
            { $inc: { subtotal: Number(newTransaction.value) } }
          );
      }
  
      await db.collection(REGISTRY).insertOne(newTransaction);
  
      return res.sendStatus(200);
    } catch (error) {
      res.sendStatus(500);
      console.log(error);
    }
  }