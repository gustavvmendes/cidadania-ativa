const express = require('express');
const CityController = require('../controllers/cityController');
const { 
  validateCreateCity, 
  validateUpdateCity, 
  validateQueryParams, 
  validateIdParam,
  validateEstadoParam
} = require('../validators/cityValidator');
const { catchAsync } = require('../utils/errors');
const Joi = require('joi');

const router = express.Router();

// Validação específica para parâmetro código IBGE
const validateCodigoParam = (req, res, next) => {
  const schema = Joi.object({
    codigo: Joi.string()
      .max(20)
      .trim()
      .required()
      .messages({
        'string.max': 'Código IBGE deve ter no máximo 20 caracteres',
        'any.required': 'Código IBGE é obrigatório'
      })
  });

  const { error, value } = schema.validate(req.params);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Código IBGE inválido',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.params = value;
  next();
};

// Rotas principais do CRUD
router
  .route('/')
  .get(
    validateQueryParams,
    catchAsync(CityController.findAll)
  )
  .post(
    validateCreateCity,
    catchAsync(CityController.create)
  );

// Rota para estatísticas
router.get('/stats', catchAsync(CityController.getStats));

// Rota para buscar cidades por estado
router.get(
  '/estado/:estado',
  validateEstadoParam,
  validateQueryParams,
  catchAsync(CityController.findByEstado)
);

// Rota para buscar cidade por código IBGE
router.get(
  '/ibge/:codigo',
  validateCodigoParam,
  catchAsync(CityController.findByCodigoIbge)
);

// Rotas específicas por ID
router
  .route('/:id')
  .get(
    validateIdParam,
    catchAsync(CityController.findById)
  )
  .put(
    validateIdParam,
    validateUpdateCity,
    catchAsync(CityController.update)
  )
  .delete(
    validateIdParam,
    catchAsync(CityController.delete)
  );

module.exports = router; 