import joi from "joi";
import db from "./database.js"

export async function getRegistry(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.sendStatus(401);

  const registrySchema = joi.object({
    token: joi.string().required(),
  });

  const validation = registrySchema.validate({ token });

  if (validation.error) return res.status(400).send(validation.error.message);

  try {
    const tokenExists = await db.collection(SESSIONS).findOne({ token });

    if (!tokenExists) return res.sendStatus(401);

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
