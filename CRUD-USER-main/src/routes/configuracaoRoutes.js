const express = require('express');
const ConfiguracaoController = require('../controllers/configuracaoController');
const { 
  validateUpsertConfiguracao,
  validateChaveParam
} = require('../validators/configuracaoValidator');
const { catchAsync } = require('../utils/errors');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken, authorize('prefeitura'));

router
  .route('/')
  .get(catchAsync(ConfiguracaoController.findAll));

router
  .route('/:chave')
  .get(
    validateChaveParam,
    catchAsync(ConfiguracaoController.findByChave)
  )
  .put(
    validateChaveParam,
    validateUpsertConfiguracao,
    catchAsync(ConfiguracaoController.upsert)
  );

module.exports = router;
