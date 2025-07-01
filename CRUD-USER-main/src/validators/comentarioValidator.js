const Joi = require("joi");
const { validate, validateIdParam } = require("../utils/validator"); 

// Schema para criação de comentário
const createComentarioSchema = Joi.object({
  texto: Joi.string()
    .min(1)
    .max(1000)
    .trim()
    .required()
    .messages({
      "string.empty": "O texto do comentário não pode ser vazio.",
      "string.min": "O comentário deve ter pelo menos 1 caractere.",
      "string.max": "O comentário deve ter no máximo 1000 caracteres.",
      "any.required": "O texto do comentário é obrigatório."
    }),
  
  id_comentario_pai: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      "number.base": "O ID do comentário pai deve ser um número.",
      "number.integer": "O ID do comentário pai deve ser um número inteiro.",
      "number.positive": "O ID do comentário pai deve ser um número positivo."
    })
}).unknown(true);

// Schema para atualização de comentário
const updateComentarioSchema = Joi.object({
  texto: Joi.string()
    .min(1)
    .max(1000)
    .trim()
    .required()
    .messages({
      "string.empty": "O texto do comentário não pode ser vazio.",
      "string.min": "O comentário deve ter pelo menos 1 caractere.",
      "string.max": "O comentário deve ter no máximo 1000 caracteres.",
      "any.required": "O texto do comentário é obrigatório."
    })
});

// Schema para parâmetros de consulta (listagem de comentários)
const queryParamsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  orderBy: Joi.string().valid("id_comentario", "data_criacao").default("data_criacao"),
  orderDirection: Joi.string().valid("ASC", "DESC").default("ASC")
});

module.exports = {
  validateCreateComentario: validate(createComentarioSchema),
  validateUpdateComentario: validate(updateComentarioSchema),
  validateQueryParams: validate(queryParamsSchema, "query"),
};
