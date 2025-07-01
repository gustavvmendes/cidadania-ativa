const Anuncio = require('../models/Anuncio');
const Configuracao = require('../models/Configuracao'); 
const { AppError } = require('../utils/errors');
const path = require('path');
const fs = require('fs');

class AnuncioController {
  static async create(req, res, next) {
    try {
      const { user } = req; // Usuário vem do middleware authenticateToken
      const anuncioData = req.body;

      console.log('Dados recebidos no body:', anuncioData);
      console.log('Arquivo recebido:', req.file);

      // Se um arquivo de imagem foi enviado, adicione a URL ao anuncioData
      if (req.file) {
        // Construir a URL da imagem baseada na configuração do servidor
        const baseUrl = process.env.BASE_URL || `http://${process.env.IP_ADDRESS || localhost}:${process.env.PORT || 3000}`;
        anuncioData.imagem_url = `${baseUrl}/uploads/images/${req.file.filename}`;
        console.log('URL da imagem gerada:', anuncioData.imagem_url);
      } else {
        anuncioData.imagem_url = null; 
        console.log('Nenhuma imagem foi enviada');
      }

      // REGRA DE NEGÓCIO: Quem pode publicar?
      if (anuncioData.tipo_anuncio === 'evento' && user.tipo_usuario !== 'prefeitura') {
        throw new AppError('Apenas a prefeitura pode publicar eventos.', 403);
      }

      if (anuncioData.tipo_anuncio === 'produto') {
        const clientePodePublicarConfig = await Configuracao.findByChave('liberar_publicacao_cliente');
        const clientePodePublicar = clientePodePublicarConfig && clientePodePublicarConfig.valor === 'sim';
        
        const isProdutor = user.tipo_usuario === 'produtor';
        const isClientePermitido = user.tipo_usuario === 'cliente' && clientePodePublicar;

        if (!isProdutor && !isClientePermitido) {
          throw new AppError('Você não tem permissão para publicar produtos.', 403);
        }
      }

      // REGRA DE NEGÓCIO: Aprovação manual ou automática?
      const validacaoManualConfig = await Configuracao.findByChave('validacao_manual_anuncios');
      const precisaAprovacao = validacaoManualConfig && validacaoManualConfig.valor === 'sim';

      // Prefeitura sempre publica diretamente, os outros dependem da configuração
      const status = user.tipo_usuario === 'prefeitura' ? 'aprovado' : (precisaAprovacao ? 'pendente' : 'aprovado');
      
      // Validar campos obrigatórios
      if (!anuncioData.titulo || !anuncioData.descricao) {
        throw new AppError('Título e descrição são obrigatórios.', 400);
      }

      // Para produtos, preço é obrigatório
      if (anuncioData.tipo_anuncio === 'produto' && (!anuncioData.preco || parseFloat(anuncioData.preco) <= 0)) {
        throw new AppError('Preço é obrigatório para produtos e deve ser maior que zero.', 400);
      }

      // Para eventos, data e local são obrigatórios
      if (anuncioData.tipo_anuncio === 'evento') {
        if (!anuncioData.data_evento) {
          throw new AppError('Data do evento é obrigatória.', 400);
        }
        if (!anuncioData.local_evento) {
          throw new AppError('Local do evento é obrigatório.', 400);
        }
      }

      const anuncio = await Anuncio.create({ 
        ...anuncioData, 
        id_usuario: user.id_usuario,
        status: status,
        preco: anuncioData.tipo_anuncio === 'produto' ? parseFloat(anuncioData.preco) : null
      });

      res.status(201).json({
        success: true,
        message: `Anúncio criado com sucesso. Status: ${status}`,
        data: anuncio
      });
    } catch (error) {
      // Se houve erro e um arquivo foi enviado, remover o arquivo
      if (req.file) {
        const filePath = req.file.path;
        fs.unlink(filePath, (err) => {
          if (err) console.error('Erro ao remover arquivo após falha:', err);
        });
      }
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const { user } = req;

      const anuncio = await Anuncio.findById(id);
      if (!anuncio) throw new AppError('Anúncio não encontrado', 404);
      
      // REGRA DE NEGÓCIO: Apenas o dono ou um admin (prefeitura) pode editar.
      if (anuncio.id_usuario !== user.id_usuario && user.tipo_usuario !== 'prefeitura') {
        throw new AppError('Você não tem permissão para editar este anúncio', 403);
      }

      let oldImagePath = null;

      // Se um novo arquivo de imagem foi enviado na atualização
      if (req.file) {
        const baseUrl = process.env.BASE_URL || `http://${process.env.IP_ADDRESS || localhost}:${process.env.PORT || 3000}`;
        updateData.imagem_url = `${baseUrl}/uploads/images/${req.file.filename}`;
        
        // Guardar o caminho da imagem antiga para remoção posterior
        if (anuncio.imagem_url) {
          const oldFilename = anuncio.imagem_url.split('/').pop();
          oldImagePath = path.join(__dirname, '..', '..', 'uploads', 'images', oldFilename);
        }
      } else if (updateData.remover_imagem === 'true') {
        // Se o frontend solicitou remoção da imagem
        if (anuncio.imagem_url) {
          const oldFilename = anuncio.imagem_url.split('/').pop();
          oldImagePath = path.join(__dirname, '..', '..', 'uploads', 'images', oldFilename);
        }
        updateData.imagem_url = null;
      } else {
        // Se nenhum novo arquivo foi enviado e não foi solicitada remoção,
        // não altere a imagem_url existente
        delete updateData.imagem_url; 
      }

      // Remover campos que não devem ser atualizados diretamente
      delete updateData.status;
      delete updateData.id_usuario;
      delete updateData.data_criacao;
      delete updateData.remover_imagem;

      // Validar preço para produtos
      if (updateData.preco !== undefined) {
        updateData.preco = parseFloat(updateData.preco);
        if (anuncio.tipo_anuncio === 'produto' && updateData.preco <= 0) {
          throw new AppError('Preço deve ser maior que zero para produtos.', 400);
        }
      }

      const updatedAnuncio = await Anuncio.update(id, updateData);

      // Remover imagem antiga se uma nova foi enviada ou se foi solicitada remoção
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Erro ao remover imagem antiga:', err);
          else console.log('Imagem antiga removida:', oldImagePath);
        });
      }

      res.status(200).json({
        success: true,
        message: 'Anúncio atualizado com sucesso',
        data: updatedAnuncio
      });
    } catch (error) {
      // Se houve erro e um novo arquivo foi enviado, remover o arquivo
      if (req.file) {
        const filePath = req.file.path;
        fs.unlink(filePath, (err) => {
          if (err) console.error('Erro ao remover arquivo após falha:', err);
        });
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { user } = req;

      const anuncio = await Anuncio.findById(id);
      if (!anuncio) throw new AppError('Anúncio não encontrado', 404);
      
      // REGRA DE NEGÓCIO: Apenas o dono ou um admin (prefeitura) pode deletar.
      if (anuncio.id_usuario !== user.id_usuario && user.tipo_usuario !== 'prefeitura') {
         throw new AppError('Você não tem permissão para remover este anúncio', 403);
      }
      
      // Remover o arquivo de imagem associado do servidor antes de deletar o registro no DB
      if (anuncio.imagem_url) {
        const filename = anuncio.imagem_url.split('/').pop();
        const imagePath = path.join(__dirname, '..', '..', 'uploads', 'images', filename);
        if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, (err) => {
            if (err) console.error('Erro ao deletar imagem:', err);
            else console.log('Imagem deletada:', imagePath);
          });
        }
      }

      const deletedAnuncio = await Anuncio.delete(id);

      res.status(200).json({
        success: true,
        message: 'Anúncio removido com sucesso',
        data: deletedAnuncio
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['aprovado', 'rejeitado'].includes(status)) {
        throw new AppError('Status inválido. Use "aprovado" ou "rejeitado".', 400);
      }

      const anuncio = await Anuncio.findById(id);
      if (!anuncio) throw new AppError('Anúncio não encontrado', 404);

      const updatedAnuncio = await Anuncio.update(id, { status });

      res.status(200).json({
        success: true,
        message: `Status do anúncio atualizado para ${status}`,
        data: updatedAnuncio,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 10, 100),
        search: req.query.search,
        orderBy: req.query.orderBy || 'data_criacao',
        orderDirection: req.query.orderDirection || 'DESC',
        tipo_anuncio: req.query.tipo_anuncio,
        status: req.query.status || 'aprovado' // Por padrão, mostrar apenas anúncios aprovados
      };

      const result = await Anuncio.findAll(options);

      res.status(200).json({
        success: true,
        message: 'Anúncios listados com sucesso',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async findById(req, res, next) {
    try {
      const { id } = req.params;
      const anuncio = await Anuncio.findById(id);
      
      if (!anuncio) {
        throw new AppError('Anúncio não encontrado', 404);
      }

      res.status(200).json({
        success: true,
        message: 'Anúncio encontrado',
        data: anuncio
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnuncioController;

