export function authValidateSchema(schema) {
  return (req, res, next) => {
    const { name, email } = req.body;
    const { password, confirmpassword } = req.headers;

    let body;
    if (!name && !confirmpassword) {
      body = { email, password };
    } else {
      body = { name, email, password, confirmpassword };
    }

    const { error } = schema.validate(body);

    if (error) return res.status(422).send(error.details[0].message);

    next();
  };
}
