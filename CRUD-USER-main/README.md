# 🚀 Backend API - Multi CRUD

API REST para múltiplos CRUDs com PostgreSQL, arquitetura MVC e validações robustas.

## 🗃️ Entidades Disponíveis

- ✅ **Usuários** - Gestão completa de usuários
- ✅ **Cidades** - Gestão completa de cidades

## ⚡ Setup Rápido

```bash
# Clone e instale dependências
git clone <repo>
npm install

# Configure .env com suas credenciais do PostgreSQL
cp env.example .env
# DB_HOST=localhost
# DB_USER=postgres  
# DB_PASSWORD=sua_senha
# DB_NAME=crud_users
# PORT=3000

# Inicie o servidor
npm run dev
# Server: http://localhost:3000
```

---

## 👥 CRUD: Usuários

**Base URL**: `/api/users`

### Schema da Entidade
```sql
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
```

### Endpoints

#### `POST /api/users` - Criar Usuário
**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "MinhaSenh@123",
  "tipo_usuario": "cliente",
  "id_cidade": 1,
  "endereco": "Rua A, 123"
}
```
**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "id_usuario": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "tipo_usuario": "cliente",
    "id_cidade": 1,
    "endereco": "Rua A, 123",
    "ativo": true,
    "data_criacao": "2024-01-15T10:30:00.000Z"
  }
}
```

#### `GET /api/users` - Listar Usuários
**Query Params:**
```
?page=1&limit=10&search=joão&tipo_usuario=cliente&ativo=true&orderBy=nome&orderDirection=ASC
```
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Usuários encontrados",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### `GET /api/users/:id` - Buscar por ID
**Response:** `200 OK` | `404 Not Found`

#### `PUT /api/users/:id` - Atualizar Usuário
**Request:** (campos opcionais)
```json
{
  "nome": "João Santos",
  "endereco": "Rua B, 456"
}
```
**Response:** `200 OK` | `404 Not Found` | `409 Conflict` (email já existe)

#### `DELETE /api/users/:id` - Deletar Permanentemente
**Response:** `200 OK` | `404 Not Found`

#### `PATCH /api/users/:id/desativar` - Soft Delete
**Response:** `200 OK` | `404 Not Found`

#### `PATCH /api/users/:id/reativar` - Reativar
**Response:** `200 OK` | `404 Not Found`

#### `GET /api/users/tipo/:tipo` - Filtrar por Tipo
**Params:** `tipo` = `prefeitura|produtor|cliente`
**Response:** `200 OK`

#### `GET /api/users/stats` - Estatísticas
**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 100,
    "ativos": 85,
    "inativos": 15,
    "por_tipo": {
      "prefeitura": 5,
      "produtor": 30,
      "cliente": 65
    }
  }
}
```

---

## 🏙️ CRUD: Cidades

**Base URL**: `/api/cities`

### Schema da Entidade
```sql
CREATE TABLE cidade (
    id_cidade SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    codigo_ibge VARCHAR(20)
);
```

### Endpoints

#### `POST /api/cities` - Criar Cidade
**Request:**
```json
{
  "nome": "São Paulo",
  "estado": "SP",
  "codigo_ibge": "3550308"
}
```
**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Cidade criada com sucesso",
  "data": {
    "id_cidade": 1,
    "nome": "São Paulo",
    "estado": "SP",
    "codigo_ibge": "3550308"
  }
}
```

#### `GET /api/cities` - Listar Cidades
**Query Params:**
```
?page=1&limit=10&search=são&estado=SP&orderBy=nome&orderDirection=ASC
```
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Cidades encontradas",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 645,
    "totalPages": 65,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### `GET /api/cities/:id` - Buscar por ID
**Response:** `200 OK` | `404 Not Found`

#### `PUT /api/cities/:id` - Atualizar Cidade
**Request:** (campos opcionais)
```json
{
  "nome": "São Paulo - Capital",
  "codigo_ibge": "3550308"
}
```
**Response:** `200 OK` | `404 Not Found` | `409 Conflict` (código IBGE já existe)

#### `DELETE /api/cities/:id` - Deletar Permanentemente
**Response:** `200 OK` | `404 Not Found`

#### `GET /api/cities/estado/:estado` - Filtrar por Estado
**Params:** `estado` = UF válida (ex: `SP`, `RJ`, `MG`)
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Cidades do estado 'SP' encontradas",
  "data": [...],
  "pagination": {...}
}
```

#### `GET /api/cities/ibge/:codigo` - Buscar por Código IBGE
**Params:** `codigo` = até 20 caracteres (ex: `3550308`)
**Response:** `200 OK` | `404 Not Found`

#### `GET /api/cities/stats` - Estatísticas
**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 5570,
    "total_estados": 27,
    "cidades_por_estado": {
      "MG": 853,
      "SP": 645,
      "BA": 417,
      "RS": 497
    }
  }
}
```

---

## 🔧 Padrões da API

### Request Headers
```
Content-Type: application/json
Accept: application/json
```

### Response Format
**Sucesso:**
```json
{
  "success": true,
  "message": "Descrição da operação",
  "data": {} // ou []
}
```

**Erro:**
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": [
    {
      "field": "email",
      "message": "Email deve ter um formato válido"
    }
  ]
}
```

### Status Codes
| Code | Descrição | Quando |
|------|-----------|--------|
| `200` | OK | Operação bem-sucedida |
| `201` | Created | Recurso criado |
| `400` | Bad Request | Dados inválidos |
| `404` | Not Found | Recurso não encontrado |
| `409` | Conflict | Email/Código IBGE já existe |
| `429` | Too Many Requests | Rate limit atingido |
| `500` | Internal Server Error | Erro do servidor |

### Query Parameters (Listagem)
| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `page` | number | 1 | Página atual |
| `limit` | number | 10 | Itens por página (max: 100) |
| `search` | string | - | Busca em nome/email (users) ou nome/código IBGE (cities) |
| `orderBy` | string | data_criacao (users), nome (cities) | Campo para ordenar |
| `orderDirection` | string | DESC (users), ASC (cities) | ASC ou DESC |

### Validações

#### Usuário
- **Nome**: 2-100 chars, obrigatório
- **Email**: formato válido, único, obrigatório (100 chars max)
- **Senha**: min 8 chars, deve conter: minúscula, maiúscula, número, especial
- **Tipo**: `prefeitura`, `produtor`, `cliente`
- **ID Cidade**: número inteiro positivo (opcional, FK)
- **Endereço**: texto livre (opcional)

#### Cidade
- **Nome**: 2-100 chars, obrigatório
- **Estado**: 2 chars, UF válida (AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO)
- **Código IBGE**: até 20 chars, opcional

---

## 🚀 Comandos de Uso

### Instalar e Configurar
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com credenciais do seu PostgreSQL

# Iniciar servidor
npm run dev
```

### Testar API
```bash
# Health Check
curl http://localhost:3000/health

# Criar cidade
curl -X POST http://localhost:3000/api/cities \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "São Paulo",
    "estado": "SP",
    "codigo_ibge": "3550308"
  }'

# Criar usuário
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "MinhaSenh@123",
    "tipo_usuario": "cliente",
    "id_cidade": 1
  }'

# Listar usuários
curl http://localhost:3000/api/users?page=1&limit=10

# Listar cidades por estado
curl http://localhost:3000/api/cities/estado/SP
```

---

## 🔧 URLs da API

- **Base API**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`
- **Documentação**: `http://localhost:3000/api/docs`
- **CRUD Users**: `http://localhost:3000/api/users`
- **CRUD Cities**: `http://localhost:3000/api/cities`

---

## 🚨 Troubleshooting

**Erro de conexão com DB:**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql
# ou no Windows: sc query postgresql-x64-12

# Testar conexão direta
psql -h localhost -U postgres -d crud_users
```

**Erro de dependências:**
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

**Rate limit atingido:**
- Aguardar 15 minutos ou reiniciar servidor

---

## 📦 Scripts Disponíveis

```bash
npm start          # Produção
npm run dev        # Desenvolvimento (nodemon)
npm test          # Testes (a implementar)
```

---