const fs = require('fs').promises;
const path = require('path');
const db = require('../../config/database');

const runMigrations = async () => {
  try {
    console.log('🚀 Iniciando execução das migrações...');

    // Testar conexão
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Não foi possível conectar ao banco de dados');
    }

    // Diretório das migrações
    const migrationsDir = __dirname;
    
    // Ler arquivos de migração
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordenar para executar em ordem

    if (migrationFiles.length === 0) {
      console.log('📝 Nenhuma migração encontrada');
      return;
    }

    console.log(`📋 Encontradas ${migrationFiles.length} migrações:`);
    migrationFiles.forEach(file => console.log(`   - ${file}`));

    // Executar cada migração
    for (const file of migrationFiles) {
      console.log(`\n⚡ Executando migração: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');
      
      try {
        await db.query(sql);
        console.log(`✅ Migração ${file} executada com sucesso`);
      } catch (error) {
        console.error(`❌ Erro na migração ${file}:`, error.message);
        throw error;
      }
    }

    console.log('\n🎉 Todas as migrações foram executadas com sucesso!');

    // Verificar se a tabela foi criada
    const result = await db.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      ORDER BY ordinal_position
    `);

    if (result.rows.length > 0) {
      console.log('\n📊 Estrutura da tabela usuarios criada:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro durante execução das migrações:', error.message);
    process.exit(1);
  } finally {
    await db.close();
  }
};

// Executar migrações se este arquivo for chamado diretamente
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations }; 