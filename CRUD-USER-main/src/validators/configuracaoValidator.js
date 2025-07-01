const Joi = require('joi');
const { validate } = require('../utils/validator');

// Schema para o corpo da requisição (PUT)
const upsertConfiguracaoSchema = Joi.object({
  valor: Joi.string()
    .max(500)
    .required()
    .messages({
      'string.empty': 'O campo "valor" não pode ser vazio.',
      'string.max': 'O valor deve ter no máximo 500 caracteres.',
      'any.required': 'O campo "valor" é obrigatório.'
    }),
  
  descricao: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'A descrição deve ter no máximo 1000 caracteres.'
    })
});

// Schema para o parâmetro :chave na URL
const chaveParamSchema = Joi.object({
  chave: Joi.string()
    .regex(/^[a-z0-9_]+$/)
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'A chave deve conter apenas letras minúsculas, números e sublinhados (_).',
      'string.empty': 'A chave é obrigatória.',
      'string.min': 'A chave deve ter pelo menos 3 caracteres.',
      'string.max': 'A chave deve ter no máximo 100 caracteres.',
      'any.required': 'A chave é obrigatória.'
    })
});

module.exports = {
  validateUpsertConfiguracao: validate(upsertConfiguracaoSchema),
  validateChaveParam: validate(chaveParamSchema, 'params'),
};
