// Classe de erro personalizada para a aplicação
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Classe para erros de validação
class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
  }
}

// Classe para erros de banco de dados
class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500);
    this.originalError = originalError;
  }
}

// Função para tratar erros do PostgreSQL
const handlePostgresError = (error) => {
  switch (error.code) {
    case '23505': // Violação de unique constraint
      if (error.constraint && error.constraint.includes('email')) {
        return new AppError('Este email já está em uso', 409);
      }
      return new AppError('Violação de restrição única', 409);
    
    case '23503': // Violação de foreign key
      return new AppError('Referência inválida - registro relacionado não encontrado', 400);
    
    case '23502': // Not null violation
      const field = error.column;
      return new AppError(`Campo obrigatório não informado: ${field}`, 400);
    
    case '22001': // String data right truncation
      return new AppError('Dados muito longos para o campo', 400);
    
    case '08000': // Connection exception
    case '08003': // Connection does not exist
    case '08006': // Connection failure
      return new DatabaseError('Erro de conexão com banco de dados', error);
    
    case '42703': // Undefined column
      return new AppError('Campo inválido na consulta', 400);
    
    case '42P01': // Undefined table
      return new DatabaseError('Tabela não encontrada', error);
    
    default:
      return new DatabaseError('Erro interno do banco de dados', error);
  }
};

// Middleware global de tratamento de erros
const globalErrorHandler = (error, req, res, next) => {
  let err = { ...error };
  err.message = error.message;
  err.stack = error.stack;

  // Log do erro
  console.error('❌ Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Tratamento específico para erros do PostgreSQL
  if (error.code && typeof error.code === 'string') {
    err = handlePostgresError(error);
  }

  // Tratamento para erros de cast (ID inválido)
  if (error.name === 'CastError') {
    const message = 'ID inválido fornecido';
    err = new AppError(message, 400);
  }

  // Tratamento para erros de validação do Joi (caso não sejam tratados pelo middleware)
  if (error.name === 'ValidationError' && error.details) {
    const messages = error.details.map(detail => detail.message);
    err = new AppError(`Dados inválidos: ${messages.join(', ')}`, 400);
  }

  // Tratamento para erros de JSON inválido
  if (error.type === 'entity.parse.failed') {
    err = new AppError('JSON inválido fornecido', 400);
  }

  // Se não é um erro operacional, não expor detalhes em produção
  if (!err.isOperational && process.env.NODE_ENV === 'production') {
    err = new AppError('Algo deu errado! Tente novamente mais tarde.', 500);
  }

  // Resposta do erro
  const response = {
    success: false,
    status: err.status || 'error',
    message: err.message
  };

  // Em desenvolvimento, incluir stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    if (err.originalError) {
      response.originalError = err.originalError.message;
    }
  }

  res.status(err.statusCode || 500).json(response);
};

// Middleware para capturar erros assíncronos
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Middleware para rotas não encontradas
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Rota não encontrada: ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  AppError,
  ValidationError,
  DatabaseError,
  handlePostgresError,
  globalErrorHandler,
  catchAsync,
  notFoundHandler
}; 