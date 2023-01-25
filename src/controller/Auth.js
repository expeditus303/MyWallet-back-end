import bcrypt from "bcrypt";
import db from "../database.js"
import { SESSIONS, USERS } from "../CONSTANTS.js";
import { v4 as uuid } from "uuid";
import { signInSchema, signUpSchema } from "../model/AuthSchema.js";


export async function SignUp(req, res) {
    const { name, email } = req.body;
  const { password, confirmpassword } = req.headers;


  const validation = signUpSchema.validate({
    name,
    email,
    password,
    confirmpassword,
  });

  if (validation.error)
    return res.status(400).send(validation.error.details[0].message);

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
    
    const validation = signInSchema.validate({ email, password });
    
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
    
      await db
        .collection(SESSIONS)
        .insertOne({ user_id: emailExists._id, name: emailExists.name, token });
    
      return res.status(200).send({ token });
    } catch (error) {}

}

