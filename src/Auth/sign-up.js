import bcrypt from "bcrypt";
import db from "../database.js"
import joi from "joi";
import { USERS } from "../CONSTANTS.js";

export default async function SignUp(req, res) {
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