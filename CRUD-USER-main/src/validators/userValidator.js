const Joi = require("joi");
const { validate, validateIdParam } = require("../utils/validator");

// Schema para criação de usuário
const createUserSchema = Joi.object({
  nome: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      "string.empty": "Nome é obrigatório",
      "string.min": "Nome deve ter pelo menos 2 caracteres",
      "string.max": "Nome deve ter no máximo 100 caracteres",
      "any.required": "Nome é obrigatório"
    }),

  email: Joi.string()
    .email()
    .max(255)
    .trim()
    .lowercase()
    .required()
    .messages({
      "string.email": "Email deve ter um formato válido",
      "string.empty": "Email é obrigatório",
      "string.max": "Email deve ter no máximo 255 caracteres",
      "any.required": "Email é obrigatório"
    }),

  senha: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.empty": "Senha é obrigatória",
      "string.min": "Senha deve ter pelo menos 8 caracteres",
      "string.max": "Senha deve ter no máximo 128 caracteres",
      "string.pattern.base": "Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial",
      "any.required": "Senha é obrigatório"
    }),

  tipo_usuario: Joi.string()
    .valid("prefeitura", "produtor", "cliente")
    .required()
    .messages({
      "any.only": "Tipo de usuário deve ser: prefeitura, produtor ou cliente",
      "any.required": "Tipo de usuário é obrigatório"
    }),

  id_cidade: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      "number.base": "ID da cidade deve ser um número",
      "number.integer": "ID da cidade deve ser um número inteiro",
      "number.positive": "ID da cidade deve ser um número positivo"
    }),

  endereco: Joi.string()
    .max(500)
    .trim()
    .optional()
    .allow(null, "")
    .messages({
      "string.max": "Endereço deve ter no máximo 500 caracteres"
    }),

  ativo: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      "boolean.base": "Campo ativo deve ser verdadeiro ou falso"
    })
});

// Schema para atualização de usuário
const updateUserSchema = Joi.object({
  nome: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .optional()
    .messages({
      "string.empty": "Nome não pode ser vazio",
      "string.min": "Nome deve ter pelo menos 2 caracteres",
      "string.max": "Nome deve ter no máximo 100 caracteres"
    }),

  email: Joi.string()
    .email()
    .max(255)
    .trim()
    .lowercase()
    .optional()
    .messages({
      "string.email": "Email deve ter um formato válido",
      "string.empty": "Email não pode ser vazio",
      "string.max": "Email deve ter no máximo 255 caracteres"
    }),

  senha: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .optional()
    .messages({
      "string.empty": "Senha não pode ser vazia",
      "string.min": "Senha deve ter pelo menos 8 caracteres",
      "string.max": "Senha deve ter no máximo 128 caracteres",
      "string.pattern.base": "Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial"
    }),

  tipo_usuario: Joi.string()
    .valid("prefeitura", "produtor", "cliente")
    .optional()
    .messages({
      "any.only": "Tipo de usuário deve ser: prefeitura, produtor ou cliente"
    }),

  id_cidade: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      "number.base": "ID da cidade deve ser um número",
      "number.integer": "ID da cidade deve ser um número inteiro",
      "number.positive": "ID da cidade deve ser um número positivo"
    }),

  endereco: Joi.string()
    .max(500)
    .trim()
    .optional()
    .allow(null, "")
    .messages({
      "string.max": "Endereço deve ter no máximo 500 caracteres"
    }),

  ativo: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": "Campo ativo deve ser verdadeiro ou falso"
    })
}).min(1).messages({
  "object.min": "Pelo menos um campo deve ser fornecido para atualização"
});

// Schema para parâmetros de consulta
const queryParamsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      "number.base": "Página deve ser um número",
      "number.integer": "Página deve ser um número inteiro",
      "number.min": "Página deve ser maior que 0"
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      "number.base": "Limite deve ser um número",
      "number.integer": "Limite deve ser um número inteiro",
      "number.min": "Limite deve ser maior que 0",
      "number.max": "Limite deve ser no máximo 100"
    }),

  tipo_usuario: Joi.string()
    .valid("prefeitura", "produtor", "cliente")
    .optional()
    .messages({
      "any.only": "Tipo de usuário deve ser: prefeitura, produtor ou cliente"
    }),

  ativo: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": "Campo ativo deve ser verdadeiro ou falso"
    }),

  search: Joi.string()
    .max(100)
    .trim()
    .optional()
    .messages({
      "string.max": "Busca deve ter no máximo 100 caracteres"
    }),

  orderBy: Joi.string()
    .valid("id_usuario", "nome", "email", "tipo_usuario", "data_criacao")
    .default("data_criacao")
    .messages({
      "any.only": "Campo de ordenação deve ser: id_usuario, nome, email, tipo_usuario ou data_criacao"
    }),

  orderDirection: Joi.string()
    .valid("ASC", "DESC")
    .default("DESC")
    .messages({
      "any.only": "Direção da ordenação deve ser: ASC ou DESC"
    })
});

// Schema para validação de ID
const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "ID deve ser um número",
      "number.integer": "ID deve ser um número inteiro",
      "number.positive": "ID deve ser um número positivo",
      "any.required": "ID é obrigatório"
    })
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  queryParamsSchema,
  idParamSchema,
  validateCreateUser: validate(createUserSchema),
  validateUpdateUser: validate(updateUserSchema),
  validateQueryParams: validate(queryParamsSchema, "query"),
  validateIdParam: validate(idParamSchema, "params")
};


