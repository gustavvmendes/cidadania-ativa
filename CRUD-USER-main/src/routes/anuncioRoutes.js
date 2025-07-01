const express = require('express');
const AnuncioController = require('../controllers/anuncioController');
const { 
  validateCreateAnuncio, 
  validateUpdateAnuncio, 
  validateQueryParams 
} = require('../validators/anuncioValidator');
const { validateIdParam } = require('../utils/validator');
const { catchAsync } = require('../utils/errors');
const { authenticateToken, authorize } = require('../middleware/auth'); 

const router = express.Router();

// Importar multer e path
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Configuração de Armazenamento do Multer ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Caminho corrigido para a pasta uploads/images
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'images');
    
    // Verificar se a pasta existe, se não, criar
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    console.log('Multer: Salvando arquivo em:', uploadPath);
    cb(null, uploadPath); 
  },
  filename: function (req, file, cb) {
    // Gera um nome de arquivo único para evitar colisões
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log('Multer: Nome do arquivo gerado:', filename);
    cb(null, filename);
  }
});

// --- Filtro de Arquivos para o Multer ---
const fileFilter = (req, file, cb) => {
  // Define os tipos MIME permitidos para upload de imagens
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  console.log('Multer: Verificando tipo de arquivo:', file.mimetype);
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo inválido. Apenas imagens (JPEG, PNG, GIF, WebP) são permitidas.'), false); 
  }
};

// --- Inicialização do Multer ---
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de tamanho do arquivo: 10 MB
  }
});

// --- Middleware para tratamento de erros do Multer ---
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. O tamanho máximo permitido é 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erro no upload: ${error.message}`
    });
  }
  
  if (error.message.includes('Tipo de arquivo inválido')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// --- Definição das Rotas ---

// Rota para listagem de anúncios (pública)
router.get('/', validateQueryParams, catchAsync(AnuncioController.findAll));

// Rota para buscar anúncio por ID (pública)
router.get('/:id', validateIdParam, catchAsync(AnuncioController.findById));

// Rota para criar um novo anúncio
router.post(
  '/', 
  authenticateToken, 
  upload.single('imagem'),
  handleMulterError,
  validateCreateAnuncio, 
  catchAsync(AnuncioController.create)
);

// Rota para atualizar um anúncio existente
router.put(
  '/:id', 
  authenticateToken, 
  validateIdParam, 
  upload.single('imagem'),
  handleMulterError,
  validateUpdateAnuncio, 
  catchAsync(AnuncioController.update)
);

// Rota para deletar um anúncio
router.delete(
  '/:id', 
  authenticateToken, 
  validateIdParam, 
  catchAsync(AnuncioController.delete)
);

// Rota para aprovar/rejeitar um anúncio (apenas prefeitura)
router.patch(
  '/:id/status',
  authenticateToken,
  authorize('prefeitura'),
  validateIdParam,
  catchAsync(AnuncioController.updateStatus)
);

module.exports = router;

