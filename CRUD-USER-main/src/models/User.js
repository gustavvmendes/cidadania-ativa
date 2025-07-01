const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(userData) {
    this.id_usuario = userData.id_usuario;
    this.nome = userData.nome;
    this.email = userData.email;
    this.senha = userData.senha; // Senha já criptografada
    this.tipo_usuario = userData.tipo_usuario;
    this.id_cidade = userData.id_cidade;
    this.endereco = userData.endereco;
    this.ativo = userData.ativo;
    this.data_criacao = userData.data_criacao;
  }

  // Hash da senha
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verificar senha
  async checkPassword(password) {
    return await bcrypt.compare(password, this.senha);
  }

  // Criar usuário
  static async create(userData) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Hash da senha
      const hashedPassword = await User.hashPassword(userData.senha);

      const query = `
        INSERT INTO usuario (nome, email, senha, tipo_usuario, id_cidade, endereco)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_usuario, nome, email, tipo_usuario, id_cidade, endereco, ativo, data_criacao
      `;

      const values = [
        userData.nome,
        userData.email.toLowerCase(),
        hashedPassword,
        userData.tipo_usuario,
        userData.id_cidade || null,
        userData.endereco || null
      ];

      const result = await client.query(query, values);
      await client.query('COMMIT');

      return new User(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Buscar por ID
  static async findById(id) {
    const query = 'SELECT * FROM usuario WHERE id_usuario = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return new User(result.rows[0]);
  }

  // Buscar por email
  static async findByEmail(email) {
    const query = 'SELECT * FROM usuario WHERE email = $1';
    const result = await db.query(query, [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return new User(result.rows[0]);
  }

  // Buscar todos com paginação e filtros
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      tipo_usuario,
      ativo,
      search,
      orderBy = 'data_criacao',
      orderDirection = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let values = [];
    let valueIndex = 1;

    // Filtros
    if (tipo_usuario) {
      whereConditions.push(`tipo_usuario = $${valueIndex++}`);
      values.push(tipo_usuario);
    }

    if (ativo !== undefined) {
      whereConditions.push(`ativo = $${valueIndex++}`);
      values.push(ativo === 'true' || ativo === true);
    }

    if (search) {
      whereConditions.push(`(nome ILIKE $${valueIndex++} OR email ILIKE $${valueIndex++})`);
      values.push(`%${search}%`, `%${search}%`);
      valueIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para contar total
    const countQuery = `SELECT COUNT(*) FROM usuario ${whereClause}`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Query para buscar dados (sem retornar senha)
    const dataQuery = `
      SELECT id_usuario, nome, email, tipo_usuario, id_cidade, endereco, ativo, data_criacao 
      FROM usuario 
      ${whereClause}
      ORDER BY ${orderBy} ${orderDirection}
      LIMIT $${valueIndex++} OFFSET $${valueIndex++}
    `;
    
    values.push(limit, offset);
    const dataResult = await db.query(dataQuery, values);

    const users = dataResult.rows.map(row => new User({...row, senha: null}));

    return {
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  // Atualizar usuário
  static async update(id, userData) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Verificar se usuário existe
      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      const updateFields = [];
      const values = [];
      let valueIndex = 1;

      // Campos que podem ser atualizados
      const allowedFields = ['nome', 'email', 'tipo_usuario', 'id_cidade', 'endereco'];

      for (const field of allowedFields) {
        if (userData[field] !== undefined) {
          if (field === 'email') {
            updateFields.push(`${field} = $${valueIndex++}`);
            values.push(userData[field].toLowerCase());
          } else {
            updateFields.push(`${field} = $${valueIndex++}`);
            values.push(userData[field]);
          }
        }
      }

      // Hash da nova senha se fornecida
      if (userData.senha) {
        const hashedPassword = await User.hashPassword(userData.senha);
        updateFields.push(`senha = $${valueIndex++}`);
        values.push(hashedPassword);
      }

      if (updateFields.length === 0) {
        throw new Error('Nenhum campo válido para atualizar');
      }

      values.push(id);
      const query = `
        UPDATE usuario 
        SET ${updateFields.join(', ')}
        WHERE id_usuario = $${valueIndex}
        RETURNING id_usuario, nome, email, tipo_usuario, id_cidade, endereco, ativo, data_criacao
      `;

      const result = await client.query(query, values);
      await client.query('COMMIT');

      return new User({...result.rows[0], senha: null});
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Deletar usuário permanentemente
  static async delete(id) {
    const query = 'DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario, nome, email, tipo_usuario';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    return new User({...result.rows[0], senha: null});
  }

  // Desativar usuário (soft delete)
  static async deactivate(id) {
    const query = `
      UPDATE usuario 
      SET ativo = FALSE 
      WHERE id_usuario = $1 
      RETURNING id_usuario, nome, email, tipo_usuario, id_cidade, endereco, ativo, data_criacao
    `;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    return new User({...result.rows[0], senha: null});
  }

  // Reativar usuário
  static async reactivate(id) {
    const query = `
      UPDATE usuario 
      SET ativo = TRUE 
      WHERE id_usuario = $1 
      RETURNING id_usuario, nome, email, tipo_usuario, id_cidade, endereco, ativo, data_criacao
    `;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    return new User({...result.rows[0], senha: null});
  }

  // Verificar se email já existe (para validação)
  static async emailExists(email, excludeId = null) {
    let query = 'SELECT id_usuario FROM usuario WHERE email = $1';
    let values = [email.toLowerCase()];

    if (excludeId) {
      query += ' AND id_usuario != $2';
      values.push(excludeId);
    }

    const result = await db.query(query, values);
    return result.rows.length > 0;
  }

  // Buscar usuários por tipo
  static async findByTipo(tipo, options = {}) {
    const mergedOptions = {
      ...options,
      tipo_usuario: tipo
    };

    return await User.findAll(mergedOptions);
  }

  // Estatísticas de usuários
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN ativo = TRUE THEN 1 END) as ativos,
        COUNT(CASE WHEN ativo = FALSE THEN 1 END) as inativos,
        tipo_usuario,
        COUNT(*) as count_by_tipo
      FROM usuario 
      GROUP BY tipo_usuario
      ORDER BY count_by_tipo DESC
    `;
    
    const result = await db.query(query);
    
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total) : 0;
    const ativos = result.rows.length > 0 ? parseInt(result.rows[0].ativos) : 0;
    const inativos = result.rows.length > 0 ? parseInt(result.rows[0].inativos) : 0;
    
    const porTipo = {};
    result.rows.forEach(row => {
      porTipo[row.tipo_usuario] = parseInt(row.count_by_tipo);
    });

    return {
      total,
      ativos,
      inativos,
      por_tipo: porTipo
    };
  }
}

module.exports = User; 