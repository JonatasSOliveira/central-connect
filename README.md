# Central Connect

Progressive Web App mobile-first para gestão de igrejas, membros, ministérios,
serviços e escalas ministeriais.

## Stack

- Next.js 16 com App Router
- React 19 e TypeScript
- Tailwind CSS e componentes shadcn/ui
- PostgreSQL com Drizzle ORM e Drizzle Kit
- Firebase Authentication para identidade externa
- Firebase Cloud Messaging para notificações push
- Zustand para estado global de frontend
- Vitest para testes e Biome para lint/formatação

O PostgreSQL é a fonte de verdade dos dados de negócio. Firebase não é usado
como banco de dados da aplicação: Auth fornece a identidade externa e FCM
fornece notificações.

## Pré-requisitos

- Node.js compatível com o projeto
- pnpm
- PostgreSQL disponível localmente
- Projeto Firebase configurado para Authentication e Cloud Messaging

## Desenvolvimento local

Copie `.env.example` para `.env.local` e preencha as variáveis necessárias,
incluindo `DATABASE_URL`. O arquivo `.env.local` não deve ser versionado.

```bash
pnpm install
pnpm migrations:migrate
pnpm dev
```

Para iniciar o Next.js junto com o emulador local do Firebase Authentication:

```bash
pnpm dev:firebase
```

O fluxo local não usa emulador Firestore. As operações de negócio continuam
passando pelo PostgreSQL.

## Banco e migrations

O schema do PostgreSQL fica em `src/infra/database/drizzle/schema.ts` e as
migrations versionadas ficam em `migrations/`.

```bash
pnpm migrations:gen
pnpm migrations:check
pnpm migrations:migrate
pnpm db:studio
```

Não use `drizzle-kit push` em ambientes compartilhados. Revise o SQL gerado
antes de aplicar uma migration.

## Arquitetura

O projeto segue Clean Architecture modular:

```text
src/app          entradas do Next.js e route handlers finos
src/modules      módulos de negócio
src/composition  composition root e montagem de dependências
src/infra         adapters técnicos compartilhados
src/features      experiência específica do frontend
src/components    componentes visuais compartilhados
src/shared        contratos e conceitos transversais
src/stores        estado global genuíno
```

O fluxo esperado é:

```text
App Router -> composition -> presentation -> application -> domain
infrastructure -> ports da application/domain
```

Rotas não acessam repositories diretamente. A camada de domínio não conhece
Next.js, Firebase, Zod ou drivers externos. Toda operação de negócio deve
respeitar o contexto da igreja e o isolamento multi-tenant.

Os módulos atuais são `identity`, `churches`, `members`, `member-profiles`,
`ministries`, `roles`, `services`, `service-templates`, `scales`,
`notifications` e `self-signup`.

## Validação

```bash
pnpm lint
pnpm lint:architecture
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

Consulte [AGENTS.md](AGENTS.md), [docs/architecture-migration.md](docs/architecture-migration.md)
e [docs/database/migrations.md](docs/database/migrations.md) antes de alterar
arquitetura, autenticação, persistência ou módulos.

## Deploy

O projeto pode ser publicado na Vercel, com PostgreSQL e Firebase configurados
no ambiente de execução.
