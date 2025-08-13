## Como rodar (rápido)

Backend (FastAPI):

1. Criar venv e instalar deps:

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. (Opcional) Banco Postgres (Neon/Supabase):

- Crie uma connection string e salve em `backend/.env`:

```
SECRET_KEY=<sua-chave-secreta>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=postgresql://USUARIO:SENHA@HOST:PORT/DB?sslmode=require
```

- Migrações:

```bash
.venv\Scripts\python.exe -m alembic upgrade head
```

3. Rodar API:

```bash
uvicorn app.main:app --reload
```

- Swagger: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

Mobile (Expo):

1. App funcional em `mobile53/`:

```bash
cd mobile53
npm i
npx expo start --tunnel --clear
```

2. API base (ajuste se necessário) em `mobile53/App.js`:

```js
const API_BASE = "https://<seu_tunel_ou_ip>/api/v1";
```

## Roadmap

- Backend
  - Postgres + Alembic (ok); Refresh token e CORS explícito
  - Observabilidade (logs estruturados, métricas)
  - CI (Actions) com testes (ok) e build de imagem (ok)
- Mobile
  - UX: loading/erros, logout automático em 401
  - Pull-to-refresh e melhorias visuais
- Infra
  - Docker compose (Postgres+API) local (ok) e deploy simples

---

# API Test (Backend + Mobile)

API com FastAPI e app móvel (Expo/React Native) demonstrando:

- Autenticação com JWT (registro/login)
- CRUD de itens por usuário
- Banco relacional (SQLite por padrão; suporte a Postgres)
- Estrutura organizada para evoluções futuras

## Como rodar (Backend)

Pré-requisitos:

- Python 3.11+

Passos:

1. Crie um ambiente virtual e instale as dependências:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\Activate.ps1   # Windows PowerShell
   pip install -r requirements.txt
   ```
2. Execute a API em modo desenvolvimento:
   ```bash
   uvicorn app.main:app --reload
   ```
3. Acesse a documentação:
   - Swagger: http://127.0.0.1:8000/docs
   - Redoc: http://127.0.0.1:8000/redoc

## Endpoints principais

- POST `/api/v1/auth/register` — cria usuário e retorna token
- POST `/api/v1/auth/login` — autentica e retorna token (OAuth2 password)
- GET `/api/v1/items/` — lista itens do usuário (Bearer token)
- POST `/api/v1/items/` — cria item do usuário (Bearer token)
- GET `/api/v1/items/{id}` — detalhe do item (Bearer token)
- PUT `/api/v1/items/{id}` — atualiza item (Bearer token)
- DELETE `/api/v1/items/{id}` — remove item (Bearer token)
- GET `/health` — status da API

## Variáveis de ambiente

Crie um arquivo `.env` (opcional):

```
SECRET_KEY=troque-essa-chave
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:///./app.db
```

Para Postgres:

```
DATABASE_URL=postgresql+psycopg2://usuario:senha@localhost:5432/nome_db
```

(Instale também `psycopg2-binary`.)

## Como rodar (Mobile - Expo)

Pré-requisitos:

- Node 18+
- npm ou yarn

Passos:

1. Instale dependências:
   ```bash
   cd mobile
   npm i
   npm run start
   ```
2. Abra o app no dispositivo (Expo Go) ou emulador.

Observação: se for testar no dispositivo físico, troque `API_BASE` em `mobile/App.js` para o IP da sua máquina na rede local, por exemplo:

```js
const API_BASE = "http://192.168.0.10:8000/api/v1";
```

Notas:

- O app mobile possui navegação (React Navigation) e CRUD completo com edição/remoção.
- Caso já tenha instalado anteriormente, rode `npm i` novamente após as novas dependências.

## Próximos passos (Mobile)

- Upload de imagem por item e pré-visualização
- Estado global (Zustand/Context) e testes E2E (Detox/Expo Router)

## Scripts úteis

- Rodar API: `uvicorn app.main:app --reload`
- Formulário OAuth2 para login: use `username` como e-mail e `password` na requisição `/api/v1/auth/login`

## Licença

MIT
