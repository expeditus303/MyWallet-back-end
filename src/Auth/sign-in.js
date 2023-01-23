import bcrypt from "bcrypt";
import db from "../database.js"
import joi from "joi";
import { SESSIONS, USERS } from "../CONSTANTS.js";
import { v4 as uuid } from "uuid";

export default async function SignIn(req, res) {
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
    
      await db
        .collection(SESSIONS)
        .insertOne({ user_id: emailExists._id, name: emailExists.name, token });
    
      return res.status(200).send({ token });
    } catch (error) {}

}