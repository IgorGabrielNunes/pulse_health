# Pulse

Monitor de disponibilidade de aplicações. Cadastre URLs, o backend verifica cada uma no intervalo configurado e o painel mostra status, latência, uptime de 24h e o histórico das últimas 40 verificações.

```
apps/
  api/   Fastify + Apollo Server + Prisma + PostgreSQL   → Render
  web/   React + Vite + Apollo Client                    → Vercel
```

## Stack

| Camada   | Tecnologias |
|----------|-------------|
| API      | Node 22, Fastify 5, Apollo Server 5, Prisma 7 (driver adapter `pg`), Zod 4, DataLoader |
| Web      | React 19, Vite 8, Apollo Client 4, CSS Modules |
| Contrato | `apps/api/src/graphql/schema.graphql` é a fonte única; GraphQL Code Generator gera os tipos dos resolvers (API) e os `TypedDocumentNode` das operações (web) |

## Rodando localmente

```bash
docker compose up -d                       # PostgreSQL em localhost:5432
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm install
npm run db:migrate -w @pulse/api           # aplica migrations e gera o Prisma Client
npm run dev:api                            # http://localhost:4000/graphql
npm run dev:web                            # http://localhost:5173
```

Para monitorar serviços em `localhost` durante o desenvolvimento, defina `ALLOW_PRIVATE_TARGETS=true` no `.env` da API.

Após alterar o `schema.graphql` ou uma operação do front, rode `npm run codegen` e commite os arquivos em `__generated__`.

## Deploy

### Backend no Render

O `render.yaml` na raiz é um Blueprint que provisiona o PostgreSQL e o web service juntos.

1. Render → **New → Blueprint** → selecione o repositório.
2. Informe `CORS_ORIGINS` quando solicitado (ex.: `https://pulse.vercel.app,https://*.vercel.app`).
3. Aplique. O build instala apenas o workspace da API, gera o Prisma Client e compila; o start roda `prisma migrate deploy` antes de subir o servidor.

Health check: `GET /healthz` (valida também a conexão com o banco).

### Frontend na Vercel

1. Importe o repositório e defina **Root Directory** como `apps/web` (o preset Vite é detectado).
2. Variável de ambiente: `VITE_GRAPHQL_URL=https://<seu-servico>.onrender.com/graphql`.
3. Deploy. O `vercel.json` cuida do fallback de SPA e do cache imutável dos assets.

## Variáveis da API

| Variável                | Padrão  | Descrição |
|-------------------------|---------|-----------|
| `DATABASE_URL`          | —       | Connection string do PostgreSQL |
| `CORS_ORIGINS`          | vazio   | Origens permitidas, separadas por vírgula; aceita curinga de subdomínio (`https://*.vercel.app`) |
| `MONITOR_TICK_MS`       | `5000`  | Frequência com que o agendador procura verificações vencidas |
| `MONITOR_BATCH_SIZE`    | `20`    | Máximo de verificações executadas em paralelo por ciclo |
| `CHECK_RETENTION_DAYS`  | `30`    | Histórico mais antigo que isso é removido a cada hora |
| `ALLOW_PRIVATE_TARGETS` | `false` | Libera alvos em redes privadas/loopback |

## Decisões de arquitetura

- **Agendamento no banco.** Cada aplicação guarda `next_check_at`. O agendador reserva o lote vencido com `UPDATE … FOR UPDATE SKIP LOCKED`, então mais de uma instância da API pode rodar sem verificar a mesma aplicação duas vezes.
- **Status desnormalizado.** `status`, `last_latency_ms` e `last_checked_at` ficam na tabela `applications`; a listagem não precisa agregar o histórico.
- **Sem N+1.** `recentChecks` usa `row_number() OVER (PARTITION BY …)` em uma única query por lote; `uptime` usa `groupBy`. Ambos via DataLoader por requisição.
- **Proteção contra SSRF.** O DNS do alvo é resolvido antes de cada requisição e endereços privados, loopback, link-local e metadata de cloud são bloqueados. Redirects são seguidos manualmente para que cada salto passe pela mesma validação.
- **Erros previsíveis.** Erros de domínio viram `BAD_USER_INPUT` (com `extensions.fields` por campo) ou `NOT_FOUND`; qualquer outra falha é logada e retorna `INTERNAL_SERVER_ERROR` sem vazar detalhes.
- **Fuso horário.** A sessão do banco é fixada em UTC; o driver adapter do Prisma serializa datas sem offset e, sem isso, colunas `timestamptz` ficariam deslocadas em servidores fora de UTC.

## Limitações conhecidas

- **Plano free do Render** hiberna o serviço após 15 minutos sem tráfego, o que pausa o agendador. Para monitoramento contínuo use o plano Starter ou mova o agendador para um Background Worker.
- **PostgreSQL free do Render** tem prazo de expiração; para dados duradouros use um plano pago.
- **Sem autenticação.** Qualquer pessoa com a URL da API pode cadastrar e remover serviços. Antes de expor publicamente, adicione autenticação nas mutations.
- A validação de DNS reduz, mas não elimina, a janela para DNS rebinding.
