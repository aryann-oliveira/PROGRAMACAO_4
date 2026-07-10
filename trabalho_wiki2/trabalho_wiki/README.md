# Drama Total Wiki — Trabalho Prático (Back-end + Banco de Dados + Integração)

Evolução do 1º trabalho (front-end estático da Wiki de *Drama Total*) para um
ecossistema dinâmico: o front-end antigo consome uma API REST própria
(**NestJS**), que persiste os dados em **MySQL** e exige autenticação via
**JWT** para todas as operações sobre os personagens.

## Estrutura do projeto

```
trabalho_wiki/
├── backend/        # API NestJS + TypeORM + MySQL + JWT
│   ├── src/
│   │   ├── auth/          # Registro, login, estratégia e guard JWT
│   │   ├── users/         # Entidade de usuário (necessária para o login)
│   │   ├── personagens/   # Entidade de conteúdo (CRUD completo)
│   │   └── seed/          # Popula o banco com os dados que antes eram mockados
│   └── .env.example
└── frontend/       # HTML/CSS/JS original, agora 100% dinâmico (fetch → API)
```

A entidade de conteúdo escolhida foi **Personagens**, reaproveitando o
sistema do 1º trabalho. Ela contempla os 4 campos obrigatórios do enunciado:

| Campo do enunciado         | Campo no banco (`personagens`) |
|-----------------------------|---------------------------------|
| Título                      | `nome`                          |
| Conteúdo/Texto              | `destino` (spoiler/destino do personagem) |
| Imagem                      | `imagem` (caminho/URL)          |
| Ordenação de Apresentação   | `ordem` (inteiro, usado no `ORDER BY`) |

Campo adicional: `time` (`falcao` ou `gafanhoto`), mantido do front-end original.

---

## 1. Pré-requisitos

- Node.js 18+ e npm
- MySQL 8+ (ou MariaDB 10.6+) rodando localmente ou em container

## 2. Instalação do back-end

```bash
cd backend
npm install
cp .env.example .env
```

Edite o `.env` com as credenciais do seu MySQL:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=sua_senha
DB_DATABASE=drama_total_wiki

JWT_SECRET=troque-este-valor-por-um-segredo-forte
JWT_EXPIRES_IN=1d
```

Crie o banco de dados (o TypeORM cria as tabelas automaticamente via
`synchronize: true` ao subir a aplicação):

```sql
CREATE DATABASE drama_total_wiki;
```

### Popular o banco (seed)

Insere os 22 personagens que antes estavam fixos no HTML, além de um usuário
de teste (`admin` / `admin123`):

```bash
npm run seed
```

### Subir a API

```bash
npm run start:dev
```

A API sobe em `http://localhost:3000/api`.

## 3. Rodando os testes unitários

```bash
cd backend
npm test
```

Cobre as regras de negócio do `AuthService` (registro/login, senha inválida,
usuário duplicado) e do `PersonagensService`/`PersonagensController`
(listagem, filtro por time, busca por id, cálculo automático de ordem,
atualização, remoção, e erro 404 quando o personagem não existe).

## 4. Rodando o front-end

O front-end é estático (HTML/CSS/JS puro). Basta servir a pasta `frontend/`
com qualquer servidor estático, por exemplo:

```bash
cd frontend
npx serve .
# ou: python3 -m http.server 5500
```

Abra o endereço indicado no navegador. Como a API já libera CORS
(`app.enableCors`), o front-end pode rodar em qualquer porta.

> Se a API não estiver em `http://localhost:3000/api`, ajuste a constante
> `API_BASE_URL` no topo do arquivo `frontend/script.js`.

### Fluxo de uso

1. Clique em **Entrar** no cabeçalho.
2. Faça login com `admin` / `admin123` (ou crie uma conta pelo botão
   "Criar conta").
3. Após autenticado, a lista de personagens é carregada dinamicamente da
   API e o formulário de administração (criar/editar/excluir) aparece
   abaixo da grade de cards.
4. Os filtros "Todos / Falcões / Gafanhotos" e o botão "Ver destino"
   continuam funcionando como no front-end original, mas agora sobre os
   dados vindos da API.

---

## 5. Autenticação (JWT)

- `POST /api/auth/register` e `POST /api/auth/login` são as únicas rotas
  públicas.
- Todas as rotas de `/api/personagens` exigem o cabeçalho
  `Authorization: Bearer <token>`. Sem token válido, a API responde
  `401 Unauthorized`.
- As senhas são armazenadas com hash `bcrypt` (nunca em texto puro).

## 6. Mapeamento dos Endpoints da API

Prefixo global: `/api`

### Autenticação

| Método | Rota             | Autenticação | Descrição                                  |
|--------|-------------------|:---:|---------------------------------------------|
| POST   | `/auth/register`  | –   | Cria um usuário e já retorna o token JWT     |
| POST   | `/auth/login`     | –   | Autentica um usuário existente               |

**Body** (ambos): `{ "username": "string", "password": "string" }`
**Resposta**: `{ "access_token": "...", "token_type": "Bearer", "user": { "id": 1, "username": "admin" } }`

### Personagens (todas exigem `Authorization: Bearer <token>`)

| Método | Rota                    | Descrição                                          |
|--------|--------------------------|-----------------------------------------------------|
| GET    | `/personagens`           | Lista todos, ordenado por `ordem`. Filtro opcional `?time=falcao\|gafanhoto` |
| GET    | `/personagens/:id`       | Busca um personagem pelo id (404 se não existir)     |
| POST   | `/personagens`           | Cria um personagem                                   |
| PATCH  | `/personagens/:id`       | Atualiza parcialmente um personagem                  |
| DELETE | `/personagens/:id`       | Remove um personagem                                 |

**Body de criação/atualização**:
```json
{
  "nome": "Gwen",
  "destino": "Finalista — chegou ao final da temporada.",
  "imagem": "img/Gwen.png",
  "time": "gafanhoto",
  "ordem": 1
}
```
`ordem` é opcional na criação — se omitido, o personagem é adicionado ao
final da lista automaticamente.

---

## 7. Requisitos do enunciado atendidos

- ✅ API com ciclo de vida completo (CRUD) da entidade **Personagens**.
- ✅ Banco de dados MySQL com título, conteúdo/texto, imagem e ordenação.
- ✅ Front-end 100% dinâmico, sem dados mockados (`script.js` consome a API via `fetch`).
- ✅ Suíte de testes unitários (Jest) cobrindo regras de negócio e rotas.
- ✅ Documentação de instalação, configuração, testes e endpoints (este arquivo).
- ✅ Módulo de autenticação JWT com entidade de usuário, protegendo todas as
  demais rotas.
