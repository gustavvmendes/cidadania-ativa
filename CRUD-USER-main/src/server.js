const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const path = require('path'); 

const db = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const cityRoutes = require('./routes/cityRoutes');
const anuncioRoutes = require('./routes/anuncioRoutes'); // Usando a versão corrigida
const { router: comentarioRoutes, comentarioRouter } = require('./routes/comentarioRoutes');
const configuracaoRoutes = require('./routes/configuracaoRoutes');
const authRoutes = require('./routes/authRoutes');

const { globalErrorHandler, notFoundHandler } = require('./utils/errors');
const { 
  generalLimiter, 
  createUserLimiter, 
  helmetConfig, 
  sanitizeInput, 
  logSuspiciousActivity 
} = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Trust proxy para obter IP real em produção
app.set('trust proxy', 1);

// Middlewares de segurança
app.use(helmetConfig);
app.use(generalLimiter);
app.use(sanitizeInput);
app.use(logSuspiciousActivity);

// CORS configurado para permitir acesso de qualquer origem (para desenvolvimento)
app.use(cors({
  origin: true, // Permite qualquer origem
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parsing JSON com limite de tamanho aumentado para imagens
app.use(express.json({ 
  limit: '50mb',
  strict: true
}));

// Parsing URL encoded com limite aumentado
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb' 
}));

// Logging de requisições
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../package.json').version,
    uploads_path: path.join(__dirname, '..', 'uploads')
  });
});

// Rota da API principal
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Multi CRUD',
    version: '1.0.0',
    documentation: '/api/docs',
    entities: {
      users: '/api/users',
      cities: '/api/cities',
      anuncios: '/api/anuncios',
      auth: '/api/auth'
    },
    health: '/health',
    uploads: '/uploads'
  });
});

// Rota simples de documentação
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Documentação da API Multi CRUD',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    entities: {
      users: {
        endpoints: {
          'GET /users': 'Listar usuários com paginação e filtros',
          'POST /users': 'Criar novo usuário',
          'GET /users/:id': 'Buscar usuário por ID',
          'PUT /users/:id': 'Atualizar usuário',
          'DELETE /users/:id': 'Remover usuário permanentemente',
          'PATCH /users/:id/desativar': 'Desativar usuário (soft delete)',
          'PATCH /users/:id/reativar': 'Reativar usuário',
          'GET /users/tipo/:tipo': 'Buscar usuários por tipo',
          'GET /users/stats': 'Estatísticas dos usuários'
        },
        schema: {
          id_usuario: 'number (auto)',
          nome: 'string (required, 2-100 chars)',
          email: 'string (required, unique, valid email)',
          senha: 'string (required, min 8 chars, strong password)',
          tipo_usuario: 'enum (required, values: prefeitura, produtor, cliente)',
          id_cidade: 'number (optional, FK)',
          endereco: 'string (optional, max 500 chars)',
          ativo: 'boolean (default: true)',
          data_criacao: 'datetime (auto)'
        }
      },
      cities: {
        endpoints: {
          'GET /cities': 'Listar cidades com paginação e filtros',
          'POST /cities': 'Criar nova cidade',
          'GET /cities/:id': 'Buscar cidade por ID',
          'PUT /cities/:id': 'Atualizar cidade',
          'DELETE /cities/:id': 'Remover cidade permanentemente',
          'GET /cities/estado/:estado': 'Buscar cidades por estado',
          'GET /cities/ibge/:codigo': 'Buscar cidade por código IBGE',
          'GET /cities/stats': 'Estatísticas das cidades'
        },
        schema: {
          id_cidade: 'number (auto)',
          nome: 'string (required, 2-100 chars)',
          estado: 'string (required, 2 chars, UF válida)',
          codigo_ibge: 'string (required, 7 digits, unique)'
        }
      },
      anuncios: {
        endpoints: {
          'GET /anuncios': 'Listar anúncios com paginação e filtros',
          'POST /anuncios': 'Criar novo anúncio (requer autenticação) - Suporta upload de imagem via FormData',
          'GET /anuncios/:id': 'Buscar anúncio por ID',
          'PUT /anuncios/:id': 'Atualizar anúncio (requer autenticação e permissão) - Suporta upload de imagem via FormData',
          'DELETE /anuncios/:id': 'Remover anúncio (requer autenticação e permissão)'
        },
        schema: {
          id_anuncio: 'number (auto)',
          id_usuario: 'number (auto, FK)',
          titulo: 'string (required, 5-150 chars)',
          descricao: 'string (required, 10-2000 chars)',
          imagem_url: 'string (uri, auto-generated from uploaded file)',
          tipo_anuncio: "enum (required, values: 'produto', 'evento')",
          preco: 'decimal (required if tipo_anuncio is "produto")',
          data_evento: 'datetime (optional, for events)',
          local_evento: 'string (optional, for events)',
          status: "enum (default: 'pendente', values: 'pendente', 'aprovado', 'rejeitado')",
          data_criacao: 'datetime (auto)'
        },
        upload: {
          field_name: 'imagem',
          supported_formats: ['JPEG', 'PNG', 'GIF', 'WebP'],
          max_size: '10MB',
          note: 'Use FormData para enviar arquivos. O campo deve ser nomeado como "imagem".'
        },
        filters: 'page, limit, search, orderBy, orderDirection, tipo_anuncio, status'
      },
      comentarios: {
        endpoints: {
          'GET /anuncios/:id_anuncio/comentarios': 'Listar comentários de um anúncio específico.',
          'POST /anuncios/:id_anuncio/comentarios': 'Criar novo comentário em um anúncio (requer autenticação).',
          'PUT /comentarios/:id': 'Atualizar um comentário (requer autenticação e permissão).',
          'DELETE /comentarios/:id': 'Remover um comentário (requer autenticação e permissão).'
        },
        schema: {
          id_comentario: 'number (auto)',
          id_anuncio: 'number (from URL)',
          id_usuario: 'number (auto, FK from auth)',
          texto: 'string (required, 1-1000 chars)',
          id_comentario_pai: 'number (optional, FK, for replies)',
          data_criacao: 'datetime (auto)'
        },
        filters: 'page, limit, orderBy (data_criacao), orderDirection'
      },
      configuracoes: {
        endpoints: {
          'GET /configuracoes': 'Lista todas as configurações do sistema.',
          'GET /configuracoes/:chave': 'Busca uma configuração específica pela sua chave.',
          'PUT /configuracoes/:chave': 'Cria ou atualiza uma configuração. (Requer permissão de admin)'
        },
        schema: {
          chave: 'string (PK, required, snake_case)',
          valor: 'string (required)',
          descricao: 'string (optional)',
          data_modificacao: 'datetime (auto)'
        }
      },
      auth: {
        endpoints: {
          'POST /auth/login': 'Realizar login e obter dados do usuário',
          'POST /auth/validate': 'Validar credenciais (retorna apenas true/false)',
          'GET /auth/check-email/:email': 'Verificar se email existe no sistema'
        },
        schema: {
          login: {
            email: 'string (required, valid email)',
            senha: 'string (required)'
          },
          response: {
            success: 'boolean',
            message: 'string',
            data: 'object (user data or validation result)'
          }
        }
      }
    },
    queryParams: {
      page: 'Número da página (padrão: 1)',
      limit: 'Itens por página (padrão: 10, máx: 100)',
      search: 'Busca por nome/email (users) ou nome/código IBGE (cities)',
      orderBy: 'Campo para ordenação',
      orderDirection: 'Direção: ASC, DESC'
    },
  });
});

// Rate limit específico para criação de usuários
app.use('/api/users', (req, res, next) => {
  if (req.method === 'POST') {
    return createUserLimiter(req, res, next);
  }
  next();
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/anuncios', anuncioRoutes);
app.use("/api/anuncios/:id_anuncio/comentarios", comentarioRoutes);
app.use("/api/comentarios", comentarioRouter);
app.use('/api/configuracoes', configuracaoRoutes);

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware global de tratamento de erros
app.use(globalErrorHandler);

// Função para inicializar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      console.error('❌ Falha ao conectar com banco de dados');
      process.exit(1);
    }

    // Verificar se a pasta uploads existe
    const uploadsPath = path.join(__dirname, '..', 'uploads', 'images');
    const fs = require('fs');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('📁 Pasta uploads/images criada');
    }

    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🚀 Servidor iniciado com sucesso!
📍 Porta: ${PORT}
🌍 Ambiente: ${process.env.NODE_ENV || 'development'}
📡 URL: http://localhost:${PORT}
📚 Documentação: http://localhost:${PORT}/api/docs
💚 Health Check: http://localhost:${PORT}/health
📁 Uploads: http://localhost:${PORT}/uploads

🗃️  Entidades disponíveis:
   👥 Usuários: http://localhost:${PORT}/api/users
   🏙️  Cidades: http://localhost:${PORT}/api/cities
   📢 Anúncios: http://localhost:${PORT}/api/anuncios
   💬 Comentários: via /api/anuncios/:id/comentarios e /api/comentarios/:id
   ⚙️  Configurações: http://localhost:${PORT}/api/configuracoes
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️  Recebido ${signal}. Iniciando shutdown graceful...`);
      
      server.close(async () => {
        console.log('🔒 Servidor HTTP fechado');
        
        try {
          await db.close();
          console.log('🔒 Conexões com banco de dados fechadas');
          console.log('✅ Shutdown completo');
          process.exit(0);
        } catch (error) {
          console.error('❌ Erro durante shutdown:', error);
          process.exit(1);
        }
      });

      // Forçar shutdown após 10 segundos
      setTimeout(() => {
        console.error('❌ Timeout no shutdown. Forçando saída...');
        process.exit(1);
      }, 10000);
    };

    // Capturar sinais de shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Capturar erros não tratados
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor apenas se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}

module.exports = app;

