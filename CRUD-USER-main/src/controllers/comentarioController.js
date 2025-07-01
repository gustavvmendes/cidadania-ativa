const Comentario = require("../models/Comentario");
const Anuncio = require("../models/Anuncio");
const Configuracao = require("../models/Configuracao");
const { AppError } = require("../utils/errors");

class ComentarioController {
  static async create(req, res, next) {
    try {
      const { id_anuncio } = req.params;
      const { texto, id_comentario_pai } = req.body;
      const { user } = req; // Usuário vem do middleware authenticateToken

      // REGRA DE NEGÓCIO: Verificar se comentários estão habilitados
      const comentariosHabilitadosConfig = await Configuracao.findByChave("habilitar_comentarios");
      const comentariosHabilitados = comentariosHabilitadosConfig && comentariosHabilitadosConfig.valor === "sim";

      // if (!comentariosHabilitados) {
      //   throw new AppError("Comentários estão desabilitados no momento.", 403);
      // }

      // 1. Verificar se o anúncio existe
      const anuncio = await Anuncio.findById(id_anuncio);
      if (!anuncio) {
        throw new AppError("Anúncio não encontrado", 404);
      }

      // 2. Se for uma resposta, verificar se o comentário pai existe e pertence ao mesmo anúncio
      if (id_comentario_pai) {
        const comentarioPai = await Comentario.findById(id_comentario_pai);
        if (!comentarioPai) {
          throw new AppError("Comentário pai não encontrado", 404);
        }
        if (comentarioPai.id_anuncio !== anuncio.id_anuncio) {
          throw new AppError("A resposta deve pertencer ao mesmo anúncio do comentário pai.", 400);
        }
      }

      const comentarioData = { id_anuncio: parseInt(id_anuncio), id_usuario: user.id_usuario, texto, id_comentario_pai };
      const comentario = await Comentario.create(comentarioData);

      res.status(201).json({
        success: true,
        message: "Comentário adicionado com sucesso",
        data: comentario
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params; 
      const { texto } = req.body;
      const { user } = req; // Usuário vem do middleware authenticateToken

      const comentario = await Comentario.findById(id);
      if (!comentario) {
        throw new AppError("Comentário não encontrado", 404);
      }
      
      // REGRA DE NEGÓCIO: Apenas o autor do comentário ou a prefeitura pode editar.
      if (comentario.id_usuario !== user.id_usuario && user.tipo_usuario !== "prefeitura") {
        throw new AppError("Você não tem permissão para editar este comentário", 403);
      }

      const updatedComentario = await Comentario.update(id, texto);

      res.status(200).json({
        success: true,
        message: "Comentário atualizado com sucesso",
        data: updatedComentario
      });
    } catch (error) {
      if (error.message === "Comentário não encontrado") {
        error = new AppError("Comentário não encontrado", 404);
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { user } = req; // Usuário vem do middleware authenticateToken

      const comentario = await Comentario.findById(id);
      if (!comentario) {
        throw new AppError("Comentário não encontrado", 404);
      }

      // REGRA DE NEGÓCIO: Apenas o autor do comentário, o dono do anúncio ou a prefeitura pode remover.
      const anuncio = await Anuncio.findById(comentario.id_anuncio);
      if (comentario.id_usuario !== user.id_usuario && anuncio.id_usuario !== user.id_usuario && user.tipo_usuario !== "prefeitura") {
        throw new AppError("Você não tem permissão para remover este comentário", 403);
      }
      
      const deletedComentario = await Comentario.delete(id);

      res.status(200).json({
        success: true,
        message: "Comentário removido com sucesso",
        data: deletedComentario
      });
    } catch (error) {
      if (error.message === "Comentário não encontrado") {
        error = new AppError("Comentário não encontrado", 404);
      }
      next(error);
    }
  }

  static async findAllByAnuncio(req, res, next) {
    try {
      const { id_anuncio } = req.params;
      const { limit, offset } = req.query;

      const comentarios = await Comentario.findAllByAnuncioId(id_anuncio, { limit, offset });

      res.status(200).json({
        success: true,
        message: "Comentários do anúncio recuperados com sucesso",
        data: comentarios
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ComentarioController;


