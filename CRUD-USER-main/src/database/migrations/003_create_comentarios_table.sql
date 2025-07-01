CREATE TABLE comentario (
    id_comentario SERIAL PRIMARY KEY,
    id_anuncio INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    texto TEXT NOT NULL CHECK (length(texto) > 0),
    id_comentario_pai INTEGER, -- Pode ser nulo para comentários de nível superior
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Chave estrangeira para o anúncio
    CONSTRAINT fk_anuncio
        FOREIGN KEY(id_anuncio) 
        REFERENCES anuncio(id_anuncio)
        ON DELETE CASCADE, -- Se o anúncio for deletado, os comentários também são

    -- Chave estrangeira para o usuário
    CONSTRAINT fk_usuario
        FOREIGN KEY(id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,

    -- Chave estrangeira para o comentário pai (auto-relacionamento)
    CONSTRAINT fk_comentario_pai
        FOREIGN KEY(id_comentario_pai)
        REFERENCES comentario(id_comentario)
        ON DELETE CASCADE -- Se um comentário pai for deletado, suas respostas também são
);

-- Índices para otimizar as buscas
CREATE INDEX idx_comentario_id_anuncio ON comentario(id_anuncio);
CREATE INDEX idx_comentario_id_usuario ON comentario(id_usuario);
CREATE INDEX idx_comentario_id_comentario_pai ON comentario(id_comentario_pai);