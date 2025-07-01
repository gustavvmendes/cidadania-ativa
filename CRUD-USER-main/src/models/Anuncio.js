const db = require('../config/database');

class Anuncio {
  constructor(anuncioData) {
    this.id_anuncio = anuncioData.id_anuncio;
    this.id_usuario = anuncioData.id_usuario;
    this.titulo = anuncioData.titulo;
    this.descricao = anuncioData.descricao;
    this.imagem_url = anuncioData.imagem_url;
    this.tipo_anuncio = anuncioData.tipo_anuncio;
    this.preco = anuncioData.preco;
    this.data_evento = anuncioData.data_evento;
    this.local_evento = anuncioData.local_evento;
    this.status = anuncioData.status;
    this.data_criacao = anuncioData.data_criacao;
  }

  static async create(anuncioData) {
    const {
      id_usuario,
      titulo,
      descricao,
      imagem_url,
      tipo_anuncio,
      preco,
      data_evento,
      local_evento
    } = anuncioData;
    
    // O status e data_criacao são definidos pelo DB (DEFAULT)
    const query = `
      INSERT INTO anuncio (id_usuario, titulo, descricao, imagem_url, tipo_anuncio, preco, data_evento, local_evento)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      id_usuario, titulo, descricao, imagem_url || null, tipo_anuncio,
      preco || null, data_evento || null, local_evento || null
    ];

    const result = await db.query(query, values);
    return new Anuncio(result.rows[0]);
  }

  static async findById(id) {
    const query = 'SELECT * FROM anuncio WHERE id_anuncio = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) return null;
    return new Anuncio(result.rows[0]);
  }

  static async findAll(options = {}) {
    const { page = 1, limit = 10, search, orderBy = 'data_criacao', orderDirection = 'DESC', tipo_anuncio, status } = options;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let values = [];
    let valueIndex = 1;

    if (search) {
      whereConditions.push(`(titulo ILIKE $${valueIndex++} OR descricao ILIKE $${valueIndex++})`);
      values.push(`%${search}%`, `%${search}%`);
    }
    if (tipo_anuncio) {
      whereConditions.push(`tipo_anuncio = $${valueIndex++}`);
      values.push(tipo_anuncio);
    }
    if (status) {
      whereConditions.push(`status = $${valueIndex++}`);
      values.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM anuncio ${whereClause}`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    const dataQuery = `
      SELECT * FROM anuncio 
      ${whereClause}
      ORDER BY ${orderBy} ${orderDirection}
      LIMIT $${valueIndex++} OFFSET $${valueIndex++}
    `;
    
    values.push(limit, offset);
    const dataResult = await db.query(dataQuery, values);
    const anuncios = dataResult.rows.map(row => new Anuncio(row));

    return {
      data: anuncios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  static async update(id, anuncioData) {
    const allowedFields = ['titulo', 'descricao', 'imagem_url', 'preco', 'data_evento', 'local_evento', 'status'];
    const updateFields = [];
    const values = [];
    let valueIndex = 1;

    for (const field of allowedFields) {
      if (anuncioData[field] !== undefined) {
        updateFields.push(`${field} = $${valueIndex++}`);
        values.push(anuncioData[field]);
      }
    }

    if (updateFields.length === 0) throw new Error('Nenhum campo válido para atualizar');

    values.push(id);
    const query = `
      UPDATE anuncio 
      SET ${updateFields.join(', ')}
      WHERE id_anuncio = $${valueIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);
    if (result.rows.length === 0) throw new Error('Anúncio não encontrado');
    return new Anuncio(result.rows[0]);
  }

  static async delete(id) {
    const query = 'DELETE FROM anuncio WHERE id_anuncio = $1 RETURNING *';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) throw new Error('Anúncio não encontrado');
    return new Anuncio(result.rows[0]);
  }
}

module.exports = Anuncio;