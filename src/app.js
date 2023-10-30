import cors from "cors";
import express from "express";
import authRouter from "./routes/AuthRoutes.js";
import transactionRouter from "./routes/TransactionRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`);
});

app.use([ authRouter, transactionRouter ])

