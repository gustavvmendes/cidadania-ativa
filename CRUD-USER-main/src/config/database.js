const { Pool } = require('pg');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'postgres3',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
      max: 20, // Máximo de conexões no pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      console.error('Erro inesperado no pool de conexões:', err);
      process.exit(-1);
    });
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Query executada:', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Erro na query:', { text, error: error.message });
      throw error;
    }
  }

  async getClient() {
    return await this.pool.connect();
  }

  async close() {
    await this.pool.end();
  }

  // Método para verificar conexão
  async testConnection() {
    try {
      const client = await this.getClient();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Conexão com banco de dados estabelecida com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar com banco de dados:', error.message);
      return false;
    }
  }
}

module.exports = new Database(); 