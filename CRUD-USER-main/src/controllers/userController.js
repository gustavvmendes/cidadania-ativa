const User = require('../models/User');
const { AppError } = require('../utils/errors');

class UserController {
  // Criar usuário
  static async create(req, res, next) {
    try {
      const userData = req.body;

      // Verificar se email já existe
      const emailExists = await User.emailExists(userData.email);
      if (emailExists) {
        throw new AppError('Email já está em uso', 409);
      }

      const user = await User.create(userData);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Buscar todos os usuários
  static async findAll(req, res, next) {
    try {
      const options = req.query;
      const result = await User.findAll(options);

      res.status(200).json({
        success: true,
        message: 'Usuários encontrados',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  // Buscar usuário por ID
  static async findById(req, res, next) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Remover senha da resposta
      const { senha, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: 'Usuário encontrado',
        data: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar usuário
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Se email está sendo atualizado, verificar se já existe
      if (updateData.email) {
        const emailExists = await User.emailExists(updateData.email, id);
        if (emailExists) {
          throw new AppError('Email já está em uso', 409);
        }
      }

      const user = await User.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: user
      });
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        error = new AppError('Usuário não encontrado', 404);
      }
      next(error);
    }
  }

  // Deletar usuário permanentemente
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.delete(id);

      res.status(200).json({
        success: true,
        message: 'Usuário removido com sucesso',
        data: user
      });
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        error = new AppError('Usuário não encontrado', 404);
      }
      next(error);
    }
  }

  // Desativar usuário (soft delete)
  static async deactivate(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.deactivate(id);

      res.status(200).json({
        success: true,
        message: 'Usuário desativado com sucesso',
        data: user
      });
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        error = new AppError('Usuário não encontrado', 404);
      }
      next(error);
    }
  }

  // Reativar usuário
  static async reactivate(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.reactivate(id);

      res.status(200).json({
        success: true,
        message: 'Usuário reativado com sucesso',
        data: user
      });
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        error = new AppError('Usuário não encontrado', 404);
      }
      next(error);
    }
  }

  // Buscar usuários por tipo
  static async findByTipo(req, res, next) {
    try {
      const { tipo } = req.params;
      const options = req.query;

      const result = await User.findByTipo(tipo, options);

      res.status(200).json({
        success: true,
        message: `Usuários do tipo '${tipo}' encontrados`,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  // Estatísticas de usuários
  static async getStats(req, res, next) {
    try {
      const stats = await User.getStats();

      res.status(200).json({
        success: true,
        message: 'Estatísticas dos usuários',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController; 