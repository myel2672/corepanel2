r# Corepanel

Development README — quick start

Requirements
- Node 18+

Run locally (development)

1. Server

```bash
cd server
npm install
# Development uses SQLite by default (dev schema)
npm run dev
```

2. Client

```bash
cd client
npm install
npm run dev
```

3. Smoke / E2E

Start server and client, then in another terminal:

```bash
cd server
npm run smoke    # quick smoke test
npm run e2e      # runs automated end-to-end flow (register/login/create order/update status)
```

Notes
- `server/prisma/schema.dev.prisma` is used for local SQLite development.
- In production configure `DATABASE_URL` in `server/.env` for Postgres and run migrations.
# corepanel2