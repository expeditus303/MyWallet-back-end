import bcrypt from "bcrypt";
import db from "../config/database.js";
import { SESSIONS, USERS } from "../CONSTANTS.js";
import { v4 as uuid } from "uuid";


export async function SignUp(req, res) {
  const { name, email } = req.body;
  const { password } = req.headers;

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
}

export async function SignIn(req, res) {
  const { email } = req.body;
  const { password } = req.headers;

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

    await db
      .collection(SESSIONS)
      .insertOne({ user_id: emailExists._id, name: emailExists.name, token });

    return res.status(200).send({ token });
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
}
