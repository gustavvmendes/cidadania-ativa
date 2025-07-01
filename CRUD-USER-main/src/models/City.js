const db = require('../config/database');

class City {
  constructor(cityData) {
    this.id_cidade = cityData.id_cidade;
    this.nome = cityData.nome;
    this.estado = cityData.estado;
    this.codigo_ibge = cityData.codigo_ibge;
  }

  // Criar cidade
  static async create(cityData) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO cidade (nome, estado, codigo_ibge)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const values = [
        cityData.nome,
        cityData.estado.toUpperCase(),
        cityData.codigo_ibge || null
      ];

      const result = await client.query(query, values);
      await client.query('COMMIT');

      return new City(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Buscar por ID
  static async findById(id) {
    const query = 'SELECT * FROM cidade WHERE id_cidade = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return new City(result.rows[0]);
  }

  // Buscar por código IBGE
  static async findByCodigoIbge(codigoIbge) {
    const query = 'SELECT * FROM cidade WHERE codigo_ibge = $1';
    const result = await db.query(query, [codigoIbge]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return new City(result.rows[0]);
  }

  // Buscar todas com paginação e filtros
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      estado,
      search,
      orderBy = 'nome',
      orderDirection = 'ASC'
    } = options;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let values = [];
    let valueIndex = 1;

    // Filtros
    if (estado) {
      whereConditions.push(`estado = $${valueIndex++}`);
      values.push(estado.toUpperCase());
    }

    if (search) {
      whereConditions.push(`(nome ILIKE $${valueIndex++} OR codigo_ibge ILIKE $${valueIndex++})`);
      values.push(`%${search}%`, `%${search}%`);
      valueIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para contar total
    const countQuery = `SELECT COUNT(*) FROM cidade ${whereClause}`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Query para buscar dados
    const dataQuery = `
      SELECT * FROM cidade 
      ${whereClause}
      ORDER BY ${orderBy} ${orderDirection}
      LIMIT $${valueIndex++} OFFSET $${valueIndex++}
    `;
    
    values.push(limit, offset);
    const dataResult = await db.query(dataQuery, values);

    const cities = dataResult.rows.map(row => new City(row));

    return {
      data: cities,
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

  // Atualizar cidade
  static async update(id, cityData) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Verificar se cidade existe
      const existingCity = await City.findById(id);
      if (!existingCity) {
        throw new Error('Cidade não encontrada');
      }

      const updateFields = [];
      const values = [];
      let valueIndex = 1;

      // Campos que podem ser atualizados
      const allowedFields = ['nome', 'estado', 'codigo_ibge'];

      for (const field of allowedFields) {
        if (cityData[field] !== undefined) {
          if (field === 'estado') {
            updateFields.push(`${field} = $${valueIndex++}`);
            values.push(cityData[field].toUpperCase());
          } else {
            updateFields.push(`${field} = $${valueIndex++}`);
            values.push(cityData[field]);
          }
        }
      }

      if (updateFields.length === 0) {
        throw new Error('Nenhum campo válido para atualizar');
      }

      values.push(id);
      const query = `
        UPDATE cidade 
        SET ${updateFields.join(', ')}
        WHERE id_cidade = $${valueIndex}
        RETURNING *
      `;

      const result = await client.query(query, values);
      await client.query('COMMIT');

      return new City(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Deletar cidade
  static async delete(id) {
    const query = 'DELETE FROM cidade WHERE id_cidade = $1 RETURNING *';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Cidade não encontrada');
    }

    return new City(result.rows[0]);
  }

  // Verificar se código IBGE já existe (para validação opcional)
  static async codigoIbgeExists(codigoIbge, excludeId = null) {
    if (!codigoIbge) return false; // Se não fornecido, não verifica

    let query = 'SELECT id_cidade FROM cidade WHERE codigo_ibge = $1';
    let values = [codigoIbge];

    if (excludeId) {
      query += ' AND id_cidade != $2';
      values.push(excludeId);
    }

    const result = await db.query(query, values);
    return result.rows.length > 0;
  }

  // Buscar cidades por estado
  static async findByEstado(estado, options = {}) {
    const mergedOptions = {
      ...options,
      estado: estado.toUpperCase()
    };

    return await City.findAll(mergedOptions);
  }

  // Estatísticas de cidades
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT estado) as total_estados,
        estado,
        COUNT(*) as cidades_por_estado
      FROM cidade 
      GROUP BY estado
      ORDER BY cidades_por_estado DESC
    `;
    
    const result = await db.query(query);
    
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total) : 0;
    const totalEstados = result.rows.length > 0 ? parseInt(result.rows[0].total_estados) : 0;
    
    const cidadesPorEstado = {};
    result.rows.forEach(row => {
      cidadesPorEstado[row.estado] = parseInt(row.cidades_por_estado);
    });

    return {
      total,
      total_estados: totalEstados,
      cidades_por_estado: cidadesPorEstado
    };
  }
}

module.exports = City; 