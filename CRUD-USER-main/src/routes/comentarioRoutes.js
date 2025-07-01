const express = require("express");
const ComentarioController = require("../controllers/comentarioController");
const {
  validateCreateComentario,
  validateUpdateComentario,
  validateQueryParams
} = require("../validators/comentarioValidator");
const { validateIdParam } = require("../utils/validator");
const { catchAsync } = require("../utils/errors");
const { authenticateToken } = require("../middleware/auth");

// Roteador para rotas de update e delete de comentários (não aninhadas)
const comentarioRouter = express.Router();

// Roteador para rotas aninhadas em /api/anuncios/:id_anuncio/comentarios
const router = express.Router({ mergeParams: true });

router.use(authenticateToken);

router
  .route("/")
  .post(
    validateIdParam("id_anuncio"), // Valida o :id_anuncio
    validateCreateComentario,
    catchAsync(ComentarioController.create)
  )
  .get(
    validateIdParam("id_anuncio"),
    validateQueryParams,
    catchAsync(ComentarioController.findAllByAnuncio)
  );

comentarioRouter.use(authenticateToken);

comentarioRouter
  .route("/:id")
  .put(
    validateIdParam(),
    validateUpdateComentario,
    catchAsync(ComentarioController.update)
  )
  .delete(
    validateIdParam(),
    catchAsync(ComentarioController.delete)
  );

module.exports = { router, comentarioRouter, validateIdParam};


