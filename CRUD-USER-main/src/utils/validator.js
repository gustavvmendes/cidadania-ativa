const { AppError } = require("./errors");

const validate = (schema, property = "body") => (req, res, next) => {
  const { error } = schema.validate(req[property], { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => err.message);
    next(new AppError(errors.join(", "), 400));
  } else {
    next();
  }
};

const validateIdParam = (paramName = "id") => (req, res, next) => {
  if (!req.params || !req.params[paramName]) {
    return next(new AppError(`Parâmetro ${paramName} não fornecido.`, 400));
  }
  const schema = Joi.number().integer().positive().required();
  const { error } = schema.validate(req.params[paramName]);
  if (error) {
    next(new AppError("ID inválido fornecido.", 400));
  } else {
    next();
  }
};

module.exports = {
  validate,
  validateIdParam,
};


const Joi = require('joi');
