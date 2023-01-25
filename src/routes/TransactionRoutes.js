import { DeleteTrasaction, GetTransactions, NewTransaction } from "./controller/Transactions.js";
import { Router } from "express";

const transactionRouter = Router()

transactionRouter.get("/registry", GetTransactions);

transactionRouter.post("/new-transaction", NewTransaction)

transactionRouter.delete("/delete/:id", DeleteTrasaction);

export default transactionRouter