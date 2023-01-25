import { Router } from "express";
import { SignIn, SignUp } from "../controller/Auth.js";
import { authValidateSchema } from "../middleware/authValidateSchema.js";
import { signInSchema, signUpSchema } from "../model/AuthSchema.js";

const authRouter = Router()

authRouter

authRouter.post("/sign-in", authValidateSchema(signInSchema), SignIn);

authRouter.post("/sign-up", authValidateSchema(signUpSchema), SignUp)

export default authRouter