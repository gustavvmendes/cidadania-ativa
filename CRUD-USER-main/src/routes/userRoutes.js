const express = require("express");
const UserController = require("../controllers/userController");
const { catchAsync } = require("../utils/errors");
const { validate, validateIdParam } = require("../utils/validator");
const Joi = require("joi");
const {
  validateCreateUser,
  validateUpdateUser,
  validateQueryParams,
} = require("../validators/userValidator");

const router = express.Router();

// Validação específica para parâmetro tipo
const validateTipoParam = validate(
  Joi.object({
    tipo: Joi.string()
      .valid("prefeitura", "produtor", "cliente")
      .required()
      .messages({
        "any.only": "Tipo deve ser: prefeitura, produtor ou cliente",
        "any.required": "Tipo é obrigatório",
      }),
  }),
  "params"
);

// Rotas principais do CRUD
router
  .route("/")
  .get(validateQueryParams, catchAsync(UserController.findAll))
  .post(validateCreateUser, catchAsync(UserController.create));

// Rota para estatísticas
router.get("/stats", catchAsync(UserController.getStats));

// Rota para buscar usuários por tipo
router.get(
  "/tipo/:tipo",
  validateTipoParam,
  validateQueryParams,
  catchAsync(UserController.findByType)
);

// Rotas específicas por ID
router
  .route("/:id")
  .get(validateIdParam, catchAsync(UserController.findById))
  .put(validateIdParam, validateUpdateUser, catchAsync(UserController.update))
  .delete(validateIdParam, catchAsync(UserController.delete));

// Rota para soft delete (desativar)
router.patch(
  "/:id/desativar",
  validateIdParam,
  catchAsync(UserController.softDelete)
);

// Rota para reativar usuário
router.patch(
  "/:id/reativar",
  validateIdParam,
  catchAsync(UserController.reactivate)
);

module.exports = router;


