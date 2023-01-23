import cors from "cors";
import express from "express";
import { getRegistry } from "./Registry.js";
import SignIn from "./Auth/sign-in.js";
import SignUp from "./Auth/sign-up.js";
import NewTransaction from "./New-transaction.js";
import DeleteIt from "./Delete-transaction.js";


const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});

app.get("/registry", getRegistry);

app.post("/sign-in", SignIn);

app.post("/sign-up", SignUp)

app.post("/new-transaction", NewTransaction)

app.delete("/delete/:id", DeleteIt);
