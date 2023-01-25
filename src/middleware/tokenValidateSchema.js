import db from "../config/database.js";
import { SESSIONS } from "../CONSTANTS.js";

export default async function tokenValidation(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.sendStatus(401);

  try {
    const tokenExists = await db.collection(SESSIONS).findOne({ token });

    if (!tokenExists) return res.sendStatus(401);

    res.locals.session = tokenExists
    console.log(res.locals.session)

    next()
  } catch (error) {
    res.sendStatus(500)
    console.log(error)
  }
}