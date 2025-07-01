const express = require("express");
const AuthController = require("../controllers/authController");
const { validate } = require("../utils/validator");
const { loginSchema, checkEmailSchema } = require("../validators/authValidator");

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Login do usuário
 * @access Public
 * @body {string} email - Email do usuário
 * @body {string} senha - Senha do usuário
 * @returns {object} Dados do usuário logado
 */
router.post("/login", validate(loginSchema), AuthController.login);

/**
 * @route POST /api/auth/validate
 * @desc Validar credenciais (retorna apenas true/false)
 * @access Public
 * @body {string} email - Email do usuário
 * @body {string} senha - Senha do usuário
 * @returns {object} Resultado da validação
 */
router.post("/validate", validate(loginSchema), AuthController.validateCredentials);

/**
 * @route GET /api/auth/check-email/:email
 * @desc Verificar se email existe no sistema
 * @access Public
 * @param {string} email - Email para verificar
 * @returns {object} Resultado da verificação
 */
router.get("/check-email/:email", AuthController.checkUserExists);

module.exports = router;


