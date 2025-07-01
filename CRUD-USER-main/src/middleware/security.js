const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting para prevenir ataques de força bruta
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
      });
    }
  });
};

// Rate limit geral para todas as rotas
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  100, // máximo 100 requests por IP
  'Muitas tentativas. Tente novamente em 15 minutos.'
);

// Rate limit específico para criação de usuários
const createUserLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hora
  5, // máximo 5 criações por IP por hora
  'Muitas tentativas de criação de usuário. Tente novamente em 1 hora.'
);

// Rate limit para tentativas de login (se implementado futuramente)
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  5, // máximo 5 tentativas por IP
  'Muitas tentativas de login. Tente novamente em 15 minutos.'
);

// Configuração do Helmet para segurança
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Middleware para sanitização de dados de entrada
const sanitizeInput = (req, res, next) => {
  // Remover campos potencialmente perigosos
  const dangerousFields = ['__proto__', 'constructor', 'prototype'];
  
  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key of dangerousFields) {
        delete obj[key];
      }
      
      // Recursivamente sanitizar objetos aninhados
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop) && typeof obj[prop] === 'object') {
          sanitizeObject(obj[prop]);
        }
      }
    }
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);

  next();
};

// Middleware para log de requisições suspeitas
const logSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /vbscript/i,
    /onload/i,
    /onerror/i,
    /eval/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /\.\.\//,
    /\/etc\/passwd/,
    /cmd\.exe/,
    /powershell/i
  ];

  const checkSuspicious = (obj) => {
    if (typeof obj === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(obj));
    }
    
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (checkSuspicious(obj[key])) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  const isSuspicious = checkSuspicious(req.body) || 
                      checkSuspicious(req.query) || 
                      checkSuspicious(req.params);

  if (isSuspicious) {
    console.warn('🚨 Atividade suspeita detectada:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

module.exports = {
  generalLimiter,
  createUserLimiter,
  authLimiter,
  helmetConfig,
  sanitizeInput,
  logSuspiciousActivity
}; 