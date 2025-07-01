# Instruções de Uso do Aplicativo Cidadania Ativa

Este documento contém as instruções para configurar e executar o aplicativo Cidadania Ativa, que foi integrado com o backend.

## 1. Pré-requisitos

Certifique-se de ter os seguintes softwares instalados em sua máquina:

*   **Node.js e npm (ou Yarn):** Recomenda-se a versão LTS.
*   **Expo CLI:** Ferramenta de linha de comando do Expo. Instale-o globalmente:
    ```bash
    npm install -g expo-cli
    ```
*   **Backend em execução:** O backend (`CRUD-USER-main`) deve estar rodando e acessível pela URL configurada no aplicativo. Certifique-se de que o PostgreSQL esteja configurado e as migrações executadas.

## 2. Configuração do Backend

Se você ainda não configurou o backend, siga estas etapas:

1.  **Extraia o arquivo `CRUD-USER-com-ajustes.zip`** que foi fornecido anteriormente.
2.  **Navegue até o diretório do backend:**
    ```bash
    cd /caminho/para/CRUD-USER-main/CRUD-USER-main
    ```
3.  **Instale as dependências:**
    ```bash
    npm install
    ```
4.  **Configure o arquivo `.env`:** Crie um arquivo `.env` na raiz do projeto do backend com as configurações do seu banco de dados PostgreSQL. Exemplo:
    ```
    DB_USER=crud_user
    DB_PASSWORD=password
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=crud_users
    JWT_SECRET=seu_segredo_jwt
    ```
    *Altere `seu_segredo_jwt` para uma string segura e única.*
5.  **Execute as migrações do banco de dados:**
    ```bash
    # Se você usa `sequelize-cli` ou similar, execute o comando de migração.
    # Caso contrário, execute o arquivo SQL manualmente no seu banco de dados.
    ```
6.  **Inicie o servidor backend:**
    ```bash
    npm start
    ```
    O backend estará rodando, por padrão, em `http://localhost:3000`.

## 3. Configuração do Aplicativo

1.  **Extraia o arquivo `cidadania-ativa-main.zip`** (o arquivo atualizado que você recebeu).
2.  **Navegue até o diretório do aplicativo:**
    ```bash
    cd /caminho/para/cidadania-ativa-main/cidadania-ativa-main
    ```
3.  **Instale as dependências:**
    ```bash
    npm install
    ```
4.  **Configure a URL do Backend:**
    Abra o arquivo `src/config/api.ts` e certifique-se de que `API_BASE_URL` aponte para o endereço correto do seu backend. Por padrão, ele está configurado para `http://localhost:3000/api`.
    ```typescript
    export const API_BASE_URL = "http://localhost:3000/api"; // Verifique se esta URL está correta
    ```
    *Se o seu backend estiver rodando em um endereço IP diferente ou porta, ajuste aqui.*

## 4. Executando o Aplicativo

1.  **Inicie o servidor de desenvolvimento do Expo:**
    ```bash
    expo start
    ```
2.  **Escolha como abrir o aplicativo:**
    *   **Emulador/Simulador:** Pressione `a` para Android ou `i` para iOS (se tiver o Xcode instalado).
    *   **Dispositivo Físico:** Escaneie o código QR exibido no terminal com o aplicativo Expo Go (disponível na App Store e Google Play).

## 5. Funcionalidades Integradas

As seguintes funcionalidades foram integradas com o backend:

*   **Login de Usuário:** Na tela de Login, você pode usar credenciais de usuários existentes no seu banco de dados para autenticar.
*   **Registro de Usuário:** Na tela de Registro, você pode criar novos usuários que serão salvos no backend.
*   **Cadastro de Produto:** Na tela de Cadastro de Produto, você pode enviar dados de novos produtos para o backend, incluindo nome, preço, descrição, vigência e imagem (em base64).
*   **Cadastro de Evento:** Na tela de Cadastro de Evento, você pode enviar dados de novos eventos para o backend, incluindo nome, local, período, descrição e imagem (em base64).
*   **Busca de Produtos:** Na tela de Busca de Produtos, o aplicativo agora busca os anúncios (produtos/eventos) do backend e os exibe. A funcionalidade de filtro por texto também está integrada.
*   **Detalhes do Produto/Evento:** Na tela de Detalhes, o aplicativo busca os comentários relacionados a um anúncio específico e permite que novos comentários sejam adicionados (ainda sem autenticação de usuário para o comentário em si, usando um placeholder de `id_usuario`).

## 6. Próximos Passos (Sugestões)

*   **Autenticação de Comentários:** Implementar o envio do `id_usuario` real (do usuário logado) ao adicionar comentários.
*   **Tratamento de Imagens:** Melhorar o tratamento de imagens, talvez enviando-as para um serviço de armazenamento de arquivos (como S3) e salvando apenas a URL no banco de dados, em vez de base64 diretamente.
*   **Filtros Avançados:** Implementar os filtros de 

