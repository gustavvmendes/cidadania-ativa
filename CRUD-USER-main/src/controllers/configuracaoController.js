const Configuracao = require('../models/Configuracao');
const { AppError } = require('../utils/errors');

class ConfiguracaoController {

  // Ponto de atenção: O acesso a este controller deve ser restrito a administradores.
  // Um middleware de verificação de role/permissão deve ser adicionado nas rotas.

  static async upsert(req, res, next) {
    try {
      const { chave } = req.params;
      const { valor, descricao } = req.body;

      const config = await Configuracao.upsert(chave, valor, descricao);

      res.status(200).json({
        success: true,
        message: 'Configuração salva com sucesso',
        data: config
      });
    } catch (error) {
      next(error);
    }
  }

  static async findByChave(req, res, next) {
    try {
      const { chave } = req.params;
      const config = await Configuracao.findByChave(chave);

      if (!config) {
        throw new AppError('Configuração não encontrada', 404);
      }

      res.status(200).json({
        success: true,
        message: 'Configuração encontrada',
        data: config
      });
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req, res, next) {
    try {
      const configs = await Configuracao.findAll();
      res.status(200).json({
        success: true,
        message: 'Configurações encontradas',
        count: configs.length,
        data: configs
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ConfiguracaoController;
