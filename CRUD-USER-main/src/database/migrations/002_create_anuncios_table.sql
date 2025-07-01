CREATE TYPE tipo_anuncio_enum AS ENUM ('produto', 'evento');
CREATE TYPE status_anuncio_enum AS ENUM ('pendente', 'aprovado', 'rejeitado');

CREATE TABLE anuncio (
    id_anuncio SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    imagem_url VARCHAR(255),
    tipo_anuncio tipo_anuncio_enum NOT NULL,
    preco DECIMAL(10, 2),
    data_evento TIMESTAMP,
    local_evento VARCHAR(255),
    status status_anuncio_enum NOT NULL DEFAULT 'pendente',
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Adiciona a chave estrangeira referenciando a tabela de usuários
    -- Altere 'usuario(id_usuario)' se o nome da sua tabela/coluna for diferente
    CONSTRAINT fk_usuario
        FOREIGN KEY(id_usuario) 
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE -- Se um usuário for deletado, seus anúncios também serão.
);

-- Índices para melhorar o desempenho das buscas
CREATE INDEX idx_anuncio_id_usuario ON anuncio(id_usuario);
CREATE INDEX idx_anuncio_tipo ON anuncio(tipo_anuncio);
CREATE INDEX idx_anuncio_status ON anuncio(status);