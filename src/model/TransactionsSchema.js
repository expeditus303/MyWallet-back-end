import joi from "joi";


const newTransactionSchema = joi.object({
  description: joi.string().min(2).required(),
  value: joi.number().required(),
  type: joi.string().valid("income", "expense").required(),
});


export {newTransactionSchema}
