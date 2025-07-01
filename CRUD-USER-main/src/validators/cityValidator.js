const Joi = require('joi');
const { validate } = require('../utils/validator');

// Lista dos estados brasileiros válidos
const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Schema para criação de cidade
const createCitySchema = Joi.object({
  nome: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),

  estado: Joi.string()
    .length(2)
    .uppercase()
    .valid(...ESTADOS_BRASIL)
    .required()
    .messages({
      'string.empty': 'Estado é obrigatório',
      'string.length': 'Estado deve ter exatamente 2 caracteres',
      'any.only': 'Estado deve ser uma sigla válida (ex: SP, RJ, MG)',
      'any.required': 'Estado é obrigatório'
    }),

  codigo_ibge: Joi.string()
    .max(20)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'Código IBGE deve ter no máximo 20 caracteres'
    })
});

// Schema para atualização de cidade
const updateCitySchema = Joi.object({
  nome: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.empty': 'Nome não pode ser vazio',
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),

  estado: Joi.string()
    .length(2)
    .uppercase()
    .valid(...ESTADOS_BRASIL)
    .optional()
    .messages({
      'string.empty': 'Estado não pode ser vazio',
      'string.length': 'Estado deve ter exatamente 2 caracteres',
      'any.only': 'Estado deve ser uma sigla válida (ex: SP, RJ, MG)'
    }),

  codigo_ibge: Joi.string()
    .max(20)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'Código IBGE deve ter no máximo 20 caracteres'
    })
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

// Schema para parâmetros de consulta
const queryParamsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Página deve ser um número',
      'number.integer': 'Página deve ser um número inteiro',
      'number.min': 'Página deve ser maior que 0'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limite deve ser um número',
      'number.integer': 'Limite deve ser um número inteiro',
      'number.min': 'Limite deve ser maior que 0',
      'number.max': 'Limite deve ser no máximo 100'
    }),

  estado: Joi.string()
    .length(2)
    .uppercase()
    .valid(...ESTADOS_BRASIL)
    .optional()
    .messages({
      'string.length': 'Estado deve ter exatamente 2 caracteres',
      'any.only': 'Estado deve ser uma sigla válida (ex: SP, RJ, MG)'
    }),

  search: Joi.string()
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.max': 'Busca deve ter no máximo 100 caracteres'
    }),

  orderBy: Joi.string()
    .valid('id_cidade', 'nome', 'estado', 'codigo_ibge')
    .default('nome')
    .messages({
      'any.only': 'Campo de ordenação deve ser: id_cidade, nome, estado ou codigo_ibge'
    }),

  orderDirection: Joi.string()
    .valid('ASC', 'DESC')
    .default('ASC')
    .messages({
      'any.only': 'Direção da ordenação deve ser: ASC ou DESC'
    })
});

// Schema para validação de ID
const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID deve ser um número',
      'number.integer': 'ID deve ser um número inteiro',
      'number.positive': 'ID deve ser um número positivo',
      'any.required': 'ID é obrigatório'
    })
});

// Schema para validação de estado
const estadoParamSchema = Joi.object({
  estado: Joi.string()
    .length(2)
    .uppercase()
    .valid(...ESTADOS_BRASIL)
    .required()
    .messages({
      'string.length': 'Estado deve ter exatamente 2 caracteres',
      'any.only': 'Estado deve ser uma sigla válida (ex: SP, RJ, MG)',
      'any.required': 'Estado é obrigatório'
    })
});

module.exports = {
  createCitySchema,
  updateCitySchema,
  queryParamsSchema,
  idParamSchema,
  estadoParamSchema,
  validateCreateCity: validate(createCitySchema),
  validateUpdateCity: validate(updateCitySchema),
  validateQueryParams: validate(queryParamsSchema, 'query'),
  validateIdParam: validate(idParamSchema, 'params'),
  validateEstadoParam: validate(estadoParamSchema, 'params'),
  ESTADOS_BRASIL
}; 