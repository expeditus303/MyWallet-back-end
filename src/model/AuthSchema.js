import joi from "joi";

const signUpSchema = joi.object({
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

const signInSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export {signUpSchema, signInSchema}
