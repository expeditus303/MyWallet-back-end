import db from "../config/database.js";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import { REGISTRY, SESSIONS, SUBTOTAL } from "../CONSTANTS.js";

export async function GetTransactions(req, res) {

  const tokenExists = res.locals.session
  
  try {

    const userRegistry = await db
      .collection(REGISTRY)
      .find({ userId: tokenExists.user_id })
      .toArray();

    if (userRegistry.length === 0)
      return res.send([tokenExists.name]).status(200);

    const userSubtotal = await db
      .collection("subtotal")
      .findOne({ userId: tokenExists.user_id });

    const userData = [[tokenExists.name], [...userRegistry], [userSubtotal]];

    res.status(200).send(userData);
  } catch (error) {
    res.send(error);
  }
}

export async function NewTransaction(req, res) {
  let { description, value, type } = req.body;
  
  const tokenExists = res.locals.session

  value = Number(value);


  try {

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
        value: value * -1,
        type: type,
      };
    }

    const userRegistry = await db
      .collection(REGISTRY)
      .find({ userId: tokenExists.user_id })
      .toArray();

    const subtotal = {
      userId: tokenExists.user_id,
      subtotal: Number(newTransaction.value),
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

export async function DeleteTrasaction(req, res) {
  const { id } = req.params;

  const token =  res.locals.session.token

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
}
