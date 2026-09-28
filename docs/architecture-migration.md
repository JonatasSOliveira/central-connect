# Migração arquitetural

O Central Connect está migrando gradualmente para uma arquitetura modular
inspirada no `milnatix-finance`.

## Direção das dependências

```text
app -> composition -> modules
presentation -> application -> domain
infrastructure -> application ports -> domain
frontend -> public API contracts
shared -> não conhece módulos de negócio
```

Os pontos de entrada utilizam `src/composition/application.ts` e as
compositions de cada módulo. O container global em `src/infra/di` e a árvore
legada `src/application` foram removidos. O kernel compartilhado (entidades
base, enums transversais e contratos comuns) vive em `src/shared/domain`,
enquanto entidades, casos de uso, ports e adaptadores específicos permanecem
dentro de seus respectivos módulos.

## Estado atual

Todos os módulos de negócio possuem implementação de persistência em Drizzle
ou adapters externos específicos, sem repositories Firestore ativos. O
`src/composition/application.ts` é o ponto de entrada das compositions.

As compositions de módulo recebem repositories, serviços técnicos e factories
transacionais pela composition root global. O frontend acessa autenticação,
notificações push e contratos HTTP por facades públicas, sem importar
Firebase, Drizzle, repositories ou entidades de domínio diretamente.

Os próximos trabalhos arquiteturais devem ser incrementais: adicionar novos
ports no módulo dono, montar adapters somente em `src/composition` e manter os
contratos de presentation independentes da infraestrutura.

## Validação

```bash
pnpm lint
pnpm lint:architecture
pnpm typecheck
pnpm test
pnpm build
```
