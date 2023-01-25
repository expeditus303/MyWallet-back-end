import { SignIn, SignUp } from "./controller/Auth.js";
import { Router } from "express";

const authRouter = Router()

authRouter.post("/sign-in", SignIn);

authRouter.post("/sign-up", SignUp)

export default authRouter