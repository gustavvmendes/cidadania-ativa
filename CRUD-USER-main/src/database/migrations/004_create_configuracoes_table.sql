CREATE TABLE configuracao (
    chave VARCHAR(100) PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao TEXT,
    -- Adicionando uma coluna para rastrear a última modificação
    data_modificacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gatilho para atualizar a data de modificação automaticamente
CREATE OR REPLACE FUNCTION update_data_modificacao_col()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_modificacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_configuracao_modtime
BEFORE UPDATE ON configuracao
FOR EACH ROW
EXECUTE FUNCTION update_data_modificacao_col();