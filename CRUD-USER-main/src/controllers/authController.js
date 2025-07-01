const User = require("../models/User");
const { ValidationError, NotFoundError} = require("../utils/errors");
const jwt = require("jsonwebtoken");

class AuthController {
  // Login do usuário
  static async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      // Validação básica
      if (!email || !senha) {
        throw new ValidationError("Email e senha são obrigatórios");
      }

      // Buscar usuário por email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error("Credenciais inválidas");
      }

      // Verificar se o usuário está ativo
      if (!user.ativo) {
        throw new Error("Usuário desativado. Entre em contato com o administrador.");
      }

      // Verificar senha
      const isPasswordValid = await user.checkPassword(senha);
      if (!isPasswordValid) {
        throw new Error("Credenciais inválidas");
      }

      // Gerar Token JWT
      const token = jwt.sign(
        {
          id_usuario: user.id_usuario,
          email: user.email,
          tipo_usuario: user.tipo_usuario,
        },
        process.env.JWT_SECRET || "supersecret", // Use uma variável de ambiente para o segredo
        { expiresIn: "24h" } // Token expira em 1 hora
      );

      // Retornar dados do usuário (sem a senha) e o token
      const userData = {
        id_usuario: user.id_usuario,
        nome: user.nome,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        id_cidade: user.id_cidade,
        endereco: user.endereco,
        ativo: user.ativo,
        data_criacao: user.data_criacao,
      };

      res.status(200).json({
        success: true,
        message: "Login realizado com sucesso",
        data: {
          user: userData,
          token: token, // Incluir o token na resposta
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Verificar se usuário existe por email (útil para validações no frontend)
  static async checkUserExists(req, res, next) {
    try {
      const { email } = req.params;

      if (!email) {
        throw new ValidationError("Email é obrigatório");
      }

      const userExists = await User.emailExists(email);

      res.status(200).json({
        success: true,
        data: {
          exists: userExists,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Validar credenciais (endpoint mais simples que retorna apenas true/false)
  static async validateCredentials(req, res, next) {
    try {
      const { email, senha } = req.body;

      // Validação básica
      if (!email || !senha) {
        return res.status(200).json({
          success: true,
          data: {
            valid: false,
            message: "Email e senha são obrigatórios",
          },
        });
      }

      // Buscar usuário por email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(200).json({
          success: true,
          data: {
            valid: false,
            message: "Credenciais inválidas",
          },
        });
      }

      // Verificar se o usuário está ativo
      if (!user.ativo) {
        return res.status(200).json({
          success: true,
          data: {
            valid: false,
            message: "Usuário desativado",
          },
        });
      }

      // Verificar senha
      const isPasswordValid = await user.checkPassword(senha);
      if (!isPasswordValid) {
        return res.status(200).json({
          success: true,
          data: {
            valid: false,
            message: "Credenciais inválidas",
          },
        });
      }

      // Credenciais válidas
      res.status(200).json({
        success: true,
        data: {
          valid: true,
          message: "Credenciais válidas",
          user_id: user.id_usuario,
          user_type: user.tipo_usuario,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;


