const db = require('../config/database');

class Comentario {
  constructor(comentarioData) {
    this.id_comentario = comentarioData.id_comentario;
    this.id_anuncio = comentarioData.id_anuncio;
    this.id_usuario = comentarioData.id_usuario;
    this.texto = comentarioData.texto;
    this.id_comentario_pai = comentarioData.id_comentario_pai;
    this.data_criacao = comentarioData.data_criacao;
  }

  static async create(comentarioData) {
    const { id_anuncio, id_usuario, texto, id_comentario_pai } = comentarioData;
    
    const query = `
      INSERT INTO comentario (id_anuncio, id_usuario, texto, id_comentario_pai)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [id_anuncio, id_usuario, texto, id_comentario_pai || null];

    const result = await db.query(query, values);
    return new Comentario(result.rows[0]);
  }

  static async findById(id) {
    const query = 'SELECT * FROM comentario WHERE id_comentario = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) return null;
    return new Comentario(result.rows[0]);
  }

  static async findAllByAnuncioId(id_anuncio, options = {}) {
    const { page = 1, limit = 20, orderBy = 'data_criacao', orderDirection = 'ASC' } = options;
    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*) FROM comentario WHERE id_anuncio = $1';
    const countResult = await db.query(countQuery, [id_anuncio]);
    const total = parseInt(countResult.rows[0].count);

    const dataQuery = `
      SELECT * FROM comentario 
      WHERE id_anuncio = $1
      ORDER BY ${orderBy} ${orderDirection}
      LIMIT $2 OFFSET $3
    `;
    
    const values = [id_anuncio, limit, offset];
    const dataResult = await db.query(dataQuery, values);
    const comentarios = dataResult.rows.map(row => new Comentario(row));

    return {
      data: comentarios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  static async update(id, texto) {
    const query = `
      UPDATE comentario 
      SET texto = $1
      WHERE id_comentario = $2
      RETURNING *
    `;
    const result = await db.query(query, [texto, id]);

    if (result.rows.length === 0) throw new Error('Comentário não encontrado');
    return new Comentario(result.rows[0]);
  }

  static async delete(id) {
    const query = 'DELETE FROM comentario WHERE id_comentario = $1 RETURNING *';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) throw new Error('Comentário não encontrado');
    return new Comentario(result.rows[0]);
  }
}

module.exports = Comentario;
