const Joi = require('joi');
const { validate } = require('../utils/validator'); // Assumindo que você tem um utilitário de validação

const TIPOS_ANUNCIO = ['produto', 'evento'];
const STATUS_ANUNCIO = ['pendente', 'aprovado', 'rejeitado'];

// Schema para criação de anúncio
const createAnuncioSchema = Joi.object({
  // id_usuario virá do usuário autenticado, não do corpo da requisição
  titulo: Joi.string()
    .min(5)
    .max(150)
    .trim()
    .required()
    .messages({
      'string.empty': 'Título é obrigatório',
      'string.min': 'Título deve ter pelo menos 5 caracteres',
      'string.max': 'Título deve ter no máximo 150 caracteres',
      'any.required': 'Título é obrigatório'
    }),
  
  descricao: Joi.string()
    .min(10)
    .max(2000)
    .trim()
    .required()
    .messages({
      'string.empty': 'Descrição é obrigatória',
      'string.min': 'Descrição deve ter pelo menos 10 caracteres',
      'string.max': 'Descrição deve ter no máximo 2000 caracteres',
      'any.required': 'Descrição é obrigatória'
    }),
  
  // O campo imagem_url é opcional e deve ser uma URI válida se presente.
  // Ele será preenchido no controller após o upload da imagem.
  imagem_url: Joi.string()
    .uri() // Valida se a string é uma URL válida
    .optional() // O campo é opcional
    .allow('') // Permite que o campo seja uma string vazia (caso a imagem seja removida ou não definida)
    .messages({
      'string.uri': 'URL da imagem é inválida'
    }),

  tipo_anuncio: Joi.string()
    .valid(...TIPOS_ANUNCIO)
    .required()
    .messages({
      'any.only': `Tipo de anúncio deve ser um dos seguintes: ${TIPOS_ANUNCIO.join(', ')}`,
      'any.required': 'Tipo de anúncio é obrigatório'
    }),

  preco: Joi.number()
    .precision(2)
    .optional()
    .messages({
      'number.base': 'Preço deve ser um número'
    }),

  data_evento: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Data do evento deve estar no formato ISO (YYYY-MM-DDTHH:MM:SS)'
    }),

  local_evento: Joi.string()
    .max(255)
    .trim()
    .optional()
    .allow(''),
  
  // Campos que podem vir do frontend mas não são validados diretamente aqui
  // (serão tratados no controller ou preenchidos automaticamente)
  id_usuario: Joi.number().integer().positive().optional(),
  id_cidade: Joi.number().integer().positive().optional(),
  status: Joi.string().valid(...STATUS_ANUNCIO).optional(),
  data_validade: Joi.date().iso().optional().allow(null), // Para produtos, se houver vigência
  
  // O campo 'imagem' (o arquivo em si) não é validado aqui, pois o Multer já faz isso.
  // Ele é marcado como 'unknown(true)' para permitir campos não definidos no schema.

}).unknown(true).when(Joi.object({ tipo_anuncio: Joi.string().valid('produto') }).unknown(), { then: Joi.object({
    preco: Joi.required().messages({ 'any.required': 'Preço é obrigatório para anúncios do tipo "produto"' })
  })
});

// Schema para atualização de anúncio
const updateAnuncioSchema = Joi.object({
  titulo: Joi.string().min(5).max(150).trim().optional(),
  descricao: Joi.string().min(10).max(2000).trim().optional(),
  
  // imagem_url na atualização também é opcional e deve ser uma URI válida se presente.
  // Pode ser usada para remover a imagem (enviando string vazia) ou atualizar.
  imagem_url: Joi.string().uri().optional().allow(''), 
  
  preco: Joi.number().positive().precision(2).optional(),
  data_evento: Joi.date().iso().optional().allow(null),
  local_evento: Joi.string().max(255).trim().optional().allow(''),
  
  // Apenas um admin ou o sistema deveria poder mudar o status
  status: Joi.string().valid(...STATUS_ANUNCIO).optional(),
  
  id_usuario: Joi.number().integer().positive().optional(),
  id_cidade: Joi.number().integer().positive().optional(),
  data_validade: Joi.date().iso().optional().allow(null),
  
  // O campo 'imagem' (o arquivo em si) não é validado aqui, pois o Multer já faz isso.
  // Ele é marcado como 'unknown(true)' para permitir campos não definidos no schema.
}).min(1).unknown(true).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});


// Schema para parâmetros de consulta (filtros)
const queryParamsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).trim().optional(),
  orderBy: Joi.string().valid('id_anuncio', 'titulo', 'tipo_anuncio', 'status', 'data_criacao').default('data_criacao'),
  orderDirection: Joi.string().valid('ASC', 'DESC').default('DESC'),
  // Filtros específicos de anúncio
  tipo_anuncio: Joi.string().valid(...TIPOS_ANUNCIO).optional(),
  status: Joi.string().valid(...STATUS_ANUNCIO).optional()
});


module.exports = {
  validateCreateAnuncio: validate(createAnuncioSchema),
  validateUpdateAnuncio: validate(updateAnuncioSchema),
  validateQueryParams: validate(queryParamsSchema, 'query'),
};
