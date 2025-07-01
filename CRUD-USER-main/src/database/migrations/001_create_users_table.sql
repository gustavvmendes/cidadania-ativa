-- Criação da tabela de usuários
-- Executar esta migration para criar a estrutura do banco

-- Tabela Cidade
CREATE TABLE cidade (
    id_cidade SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    codigo_ibge VARCHAR(20)
);

-- Tabela Usuário
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('prefeitura', 'produtor', 'cliente')) NOT NULL,
    id_cidade INTEGER REFERENCES cidade(id_cidade),
    endereco TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_usuario_tipo ON usuario(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuario_ativo ON usuario(ativo);
CREATE INDEX IF NOT EXISTS idx_usuario_cidade ON usuario(id_cidade);
CREATE INDEX IF NOT EXISTS idx_usuario_data_criacao ON usuario(data_criacao);

CREATE INDEX IF NOT EXISTS idx_cidade_nome ON cidade(nome);
CREATE INDEX IF NOT EXISTS idx_cidade_estado ON cidade(estado);
CREATE INDEX IF NOT EXISTS idx_cidade_codigo_ibge ON cidade(codigo_ibge);

-- Comentários das tabelas
COMMENT ON TABLE usuario IS 'Tabela para armazenar dados dos usuários do sistema';
COMMENT ON COLUMN usuario.id_usuario IS 'Identificador único do usuário';
COMMENT ON COLUMN usuario.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN usuario.email IS 'Email único do usuário para login';
COMMENT ON COLUMN usuario.senha IS 'Senha criptografada do usuário';
COMMENT ON COLUMN usuario.tipo_usuario IS 'Tipo/perfil do usuário no sistema';
COMMENT ON COLUMN usuario.id_cidade IS 'Referência para a cidade do usuário';
COMMENT ON COLUMN usuario.endereco IS 'Endereço completo do usuário';
COMMENT ON COLUMN usuario.ativo IS 'Status ativo/inativo do usuário';
COMMENT ON COLUMN usuario.data_criacao IS 'Data e hora de criação do registro';

COMMENT ON TABLE cidade IS 'Tabela para armazenar dados das cidades';
COMMENT ON COLUMN cidade.id_cidade IS 'Identificador único da cidade';
COMMENT ON COLUMN cidade.nome IS 'Nome da cidade';
COMMENT ON COLUMN cidade.estado IS 'Sigla do estado (2 caracteres)';
COMMENT ON COLUMN cidade.codigo_ibge IS 'Código oficial IBGE da cidade'; 