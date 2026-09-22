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

## Primeiro módulo migrado

`ministries` possui composição própria em `src/modules/ministries/composition`.
As dependências são montadas explicitamente pela composição, sem depender do
container global.

## Validação

```bash
pnpm lint
pnpm lint:architecture
pnpm typecheck
pnpm test
pnpm build
```
