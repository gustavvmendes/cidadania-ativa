const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');

// Chave secreta para assinar os tokens (em produção, use variáveis de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

/**
 * Middleware de Autenticação com JWT.
 * Verifica o token de autenticação no header 'Authorization'.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token de autenticação não fornecido ou inválido', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    // Decodifica o token e anexa os dados do usuário ao objeto 'req'
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id_usuario: decoded.id_usuario,
      tipo_usuario: decoded.tipo_usuario,
    };
    next();
  } catch (err) {
    return next(new AppError('Token de autenticação inválido ou expirado', 401));
  }
};

/**
 * Middleware de Autorização por Tipo de Usuário (Role).
 * Verifica se o tipo do usuário logado está na lista de tipos permitidos.
 * @param {...string} allowedTypes - Uma lista de tipos de usuário permitidos (ex: 'prefeitura', 'produtor').
 */
const authorize = (...allowedTypes) => {
  return (req, res, next) => {
    const { user } = req;

    if (!user || !allowedTypes.includes(user.tipo_usuario)) {
      return next(new AppError('Você não tem permissão para realizar esta ação.', 403)); // 403 Forbidden
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorize,
};