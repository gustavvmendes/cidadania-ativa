const Joi = require('joi');

// Validação para login
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
  senha: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.min': 'Senha é obrigatória',
      'any.required': 'Senha é obrigatória'
    })
});

// Validação para verificar se email existe
const checkEmailSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    })
});

module.exports = {
  loginSchema,
  checkEmailSchema
};

