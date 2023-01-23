import joi from "joi";
import { ObjectId } from "mongodb";
import { REGISTRY, SESSIONS, SUBTOTAL } from "./CONSTANTS.js";
import db from "./database.js";


export default async function DeleteIt(req, res) {
    const { id } = req.params;
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
  
    if (!token) return res.sendStatus(401);
  
    const newTransactionSchema = joi.object({
      id: joi.string().required(),
      token: joi.string().required(),
    });
  
    const validation = newTransactionSchema.validate({
      id,
      token,
    });
  
    if (validation.error) return res.status(400).send(validation.error.message);
  
    try {
      const tokenExists = await db.collection(SESSIONS).findOne({ token });
  
      if (!tokenExists) return res.sendStatus(401);
  
      const deletedTransaction = await db
        .collection(REGISTRY)
        .findOne({ _id: ObjectId(id) });
  
      const deletedValue = Number(deletedTransaction.value) * -1;
  
      await db.collection(REGISTRY).deleteOne({ _id: ObjectId(id) });
  
      await db
        .collection(SUBTOTAL)
        .updateOne(
          { userId: ObjectId(tokenExists.user_id) },
          { $inc: { subtotal: Number(deletedValue) } }
        );
  
      const userRegistry = await db
        .collection(REGISTRY)
        .find({ userId: tokenExists.user_id })
        .toArray();
  
      if (userRegistry.length === 0) return res.send([]).status(200);
  
      const userSubtotal = await db
        .collection(SUBTOTAL)
        .findOne({ userId: tokenExists.user_id });
  
      const userData = [[tokenExists.name], [...userRegistry], [userSubtotal]];
  
      res.status(200).send(userData);

    } catch (error) {
      res.sendStatus(500);
      console.log(error);
    }
  };