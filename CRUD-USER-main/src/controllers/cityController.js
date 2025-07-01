const City = require('../models/City');
const { AppError } = require('../utils/errors');

class CityController {
  // Criar cidade
  static async create(req, res, next) {
    try {
      const cityData = req.body;

      // Verificar se código IBGE já existe (apenas se fornecido)
      if (cityData.codigo_ibge) {
        const codigoExists = await City.codigoIbgeExists(cityData.codigo_ibge);
        if (codigoExists) {
          throw new AppError('Código IBGE já está em uso', 409);
        }
      }

      const city = await City.create(cityData);

      res.status(201).json({
        success: true,
        message: 'Cidade criada com sucesso',
        data: city
      });
    } catch (error) {
      next(error);
    }
  }

  // Buscar todas as cidades
  static async findAll(req, res, next) {
    try {
      const options = req.query;
      const result = await City.findAll(options);

      res.status(200).json({
        success: true,
        message: 'Cidades encontradas',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  // Buscar cidade por ID
  static async findById(req, res, next) {
    try {
      const { id } = req.params;
      
      const city = await City.findById(id);
      if (!city) {
        throw new AppError('Cidade não encontrada', 404);
      }

      res.status(200).json({
        success: true,
        message: 'Cidade encontrada',
        data: city
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar cidade
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Se código IBGE está sendo atualizado, verificar se já existe (apenas se fornecido)
      if (updateData.codigo_ibge) {
        const codigoExists = await City.codigoIbgeExists(updateData.codigo_ibge, id);
        if (codigoExists) {
          throw new AppError('Código IBGE já está em uso', 409);
        }
      }

      const city = await City.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Cidade atualizada com sucesso',
        data: city
      });
    } catch (error) {
      if (error.message === 'Cidade não encontrada') {
        error = new AppError('Cidade não encontrada', 404);
      }
      next(error);
    }
  }

  // Deletar cidade
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const city = await City.delete(id);

      res.status(200).json({
        success: true,
        message: 'Cidade removida com sucesso',
        data: city
      });
    } catch (error) {
      if (error.message === 'Cidade não encontrada') {
        error = new AppError('Cidade não encontrada', 404);
      }
      next(error);
    }
  }

  // Buscar cidades por estado
  static async findByEstado(req, res, next) {
    try {
      const { estado } = req.params;
      const options = req.query;

      const result = await City.findByEstado(estado, options);

      res.status(200).json({
        success: true,
        message: `Cidades do estado '${estado}' encontradas`,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  // Buscar cidade por código IBGE
  static async findByCodigoIbge(req, res, next) {
    try {
      const { codigo } = req.params;
      
      const city = await City.findByCodigoIbge(codigo);
      if (!city) {
        throw new AppError('Cidade não encontrada', 404);
      }

      res.status(200).json({
        success: true,
        message: 'Cidade encontrada',
        data: city
      });
    } catch (error) {
      next(error);
    }
  }

  // Estatísticas de cidades
  static async getStats(req, res, next) {
    try {
      const stats = await City.getStats();

      res.status(200).json({
        success: true,
        message: 'Estatísticas das cidades',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CityController; 