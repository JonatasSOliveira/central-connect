# Migrations do PostgreSQL

O Central Connect usa Drizzle ORM para versionar o schema do PostgreSQL. O
Firebase Authentication e o Firebase Cloud Messaging continuam sendo usados
para autenticação e notificações; os dados de negócio ficam no PostgreSQL.

## Configuração local

Defina `DATABASE_URL` em `.env.local`. O arquivo é ignorado pelo Git:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/central_connect
```

O usuário precisa ter permissão de `CREATE` no schema `public` para executar a
primeira migration.

## Comandos

```bash
pnpm migrations:gen
pnpm migrations:check
pnpm migrations:migrate
pnpm db:studio
```

O fluxo recomendado é editar `src/infra/database/drizzle/schema.ts`, gerar a
migration, revisar o SQL e aplicá-la com `migrations:migrate`.

Não usar `drizzle-kit push` em ambientes compartilhados. O histórico das
migrations fica na tabela `drizzle.__drizzle_migrations`.

## Primeira migration

A migration `0000_chemical_galactus.sql` cria o schema inicial vazio. Os IDs
são UUIDs gerados pelo PostgreSQL e as tabelas usam `timestamptz` para
armazenar datas em UTC.

A migração da persistência de negócio para PostgreSQL/Drizzle foi concluída.
Firebase permanece apenas para Authentication e Cloud Messaging; não existem
repositories Firestore ativos.
