import { DeleteTrasaction, GetTransactions, NewTransaction } from "../controller/Transactions.js";
import { Router } from "express";
import tokenValidation from "../middleware/tokenValidateSchema.js";
import { transactionValidateSchema } from "../middleware/transactionValidateSchema.js";
import { newTransactionSchema } from "../model/TransactionsSchema.js";

const transactionRouter = Router()

transactionRouter.use(tokenValidation)

transactionRouter.get("/registry", GetTransactions);

transactionRouter.post("/new-transaction", transactionValidateSchema(newTransactionSchema), NewTransaction)

// transactionRouter.put("/update/:id", UpdateTransaction);

transactionRouter.delete("/delete/:id", DeleteTrasaction);

export default transactionRouter