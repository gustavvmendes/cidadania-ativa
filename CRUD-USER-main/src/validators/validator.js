const Joi = require('joi');

/**
 * Middleware genérico de validação usando Joi.
 * @param {Joi.Schema} schema - O schema Joi para validar.
 * @param {string} source - A fonte dos dados na requisição ('body', 'query', ou 'params').
 * @returns Um middleware Express.
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : 
                 source === 'params' ? req.params : req.body;

    const { error, value } = schema.validate(data, {
      abortEarly: false, // Retorna todos os erros
      allowUnknown: false, // Não permite campos desconhecidos
      stripUnknown: true // Remove campos desconhecidos
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errorDetails
      });
    }

    // Atualiza os dados da requisição com os valores validados e limpos
    if (source === 'query') {
      req.query = value;
    } else if (source === 'params') {
      req.params = value;
    } else {
      req.body = value;
    }

    next();
  };
};

module.exports = { validate };
