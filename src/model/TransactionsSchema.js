import joi from "joi";

const getTransactionSchema = joi.object({
  token: joi.string().required(),
});

const newTransactionSchema = joi.object({
  description: joi.string().min(2).required(),
  value: joi.number().required(),
  type: joi.string().valid("income", "expense").required(),
  token: joi.string().required(),
});

const deleteTransactionSchema = joi.object({
  id: joi.string().required(),
  token: joi.string().required(),
});

export {getTransactionSchema, newTransactionSchema, deleteTransactionSchema}
