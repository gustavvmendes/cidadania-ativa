const db = require('../config/database');

class Configuracao {
  constructor(configData) {
    this.chave = configData.chave;
    this.valor = configData.valor;
    this.descricao = configData.descricao;
    this.data_modificacao = configData.data_modificacao;
  }

  // Cria ou atualiza um registro (UPSERT)
  static async upsert(chave, valor, descricao) {
    const query = `
      INSERT INTO configuracao (chave, valor, descricao)
      VALUES ($1, $2, $3)
      ON CONFLICT (chave) DO UPDATE SET
        valor = EXCLUDED.valor,
        descricao = COALESCE(EXCLUDED.descricao, configuracao.descricao)
      RETURNING *
    `;
    const values = [chave, valor, descricao];

    const result = await db.query(query, values);
    return new Configuracao(result.rows[0]);
  }

  static async findByChave(chave) {
    const query = 'SELECT * FROM configuracao WHERE chave = $1';
    const result = await db.query(query, [chave]);
    
    if (result.rows.length === 0) return null;
    return new Configuracao(result.rows[0]);
  }

  static async findAll() {
    const query = 'SELECT * FROM configuracao ORDER BY chave ASC';
    const result = await db.query(query);
    return result.rows.map(row => new Configuracao(row));
  }
  
  // O método delete é opcional e talvez perigoso para configurações.
  // Se for necessário, pode ser adicionado aqui.
  static async delete(chave) {
    const query = 'DELETE FROM configuracao WHERE chave = $1 RETURNING *';
    const result = await db.query(query, [chave]);
    
    if (result.rows.length === 0) throw new Error('Configuração não encontrada');
    return new Configuracao(result.rows[0]);
  }
}

module.exports = Configuracao;
