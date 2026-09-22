# AGENTS.md - Regras para agentes de código

Estas regras se aplicam a todos os arquivos do projeto Central Connect.

## Contexto do produto

O Central Connect é um Progressive Web App para gestão de escalas ministeriais de igrejas.

Usuários autenticados podem pertencer a uma ou mais igrejas. Cada igreja possui membros, ministérios, funções, serviços e escalas. Administradores e líderes gerenciam os dados e publicam escalas; membros consultam suas escalas e, quando autorizados, editam o próprio perfil.

O sistema usa autenticação Google, Firebase Authentication, Firestore e Firebase Cloud Messaging. A autorização é orientada por permissões e sempre deve respeitar o isolamento entre igrejas.

O escopo atual inclui:

- autenticação, sessão e seleção de igreja;
- cadastro de igrejas;
- membros e perfis de membros;
- ministérios, funções e permissões;
- serviços e modelos de serviço;
- geração, publicação e consulta de escalas;
- presença em escalas;
- notificações push;
- autocadastro público de membros;
- consentimentos legais.

Novos recursos devem ser introduzidos como módulos independentes quando fizerem sentido. Não transforme conceitos específicos de um módulo em abstrações compartilhadas sem necessidade real.

## Identidade visual

Preserve a direção visual mobile-first, flat e acolhedora existente até que uma nova identidade seja solicitada explicitamente.

- Use Inter para corpo, labels e controles.
- Use DM Sans via `font-heading` para títulos e headings.
- Preserve os tokens semânticos do tema em `src/app/globals.css`.
- Prefira superfícies sólidas, cards arredondados, hierarquia clara e sombras discretas.
- Mantenha a interface acessível e responsiva, com foco em uso no celular.
- Use texto claro, humano e consistente em português.
- Não use cor como único indicador de estado.
- Não introduza gradientes em headers, cards administrativos ou elementos estruturais.
- Preserve o padrão shadcn/ui e os componentes existentes.

Regras visuais principais:

- Header privado: `bg-primary text-primary-foreground`.
- Cards administrativos: `bg-card border-primary/20`.
- Cards de itens: `bg-card border-border`.
- Ícones destacados: `bg-primary/10 text-primary`.
- Footer: `bg-background border-t`.

## Versão do Next.js

O projeto usa Next.js 16. Antes de alterar código específico do Next.js, consulte a documentação instalada em `node_modules/next/dist/docs/` e siga as APIs e avisos de depreciação da versão instalada.

## Direção arquitetural

O projeto segue Clean Architecture modular. As dependências apontam para dentro:

```text
Entrada Next.js
    -> presentation
    -> application
    -> domain

infrastructure
    -> application ports
    -> domain

composition
    -> implementações concretas das camadas externas
```

Responsabilidades das pastas:

- `src/modules/<module>/domain`: entidades, value objects, invariantes e erros de domínio.
- `src/modules/<module>/application`: casos de uso, DTOs, erros e ports.
- `src/modules/<module>/infrastructure`: adaptadores concretos dos ports, como Firebase repositories e mappers.
- `src/modules/<module>/presentation`: handlers HTTP, schemas e presenters.
- `src/composition`: composition root da aplicação.
- `src/app`: entradas finas do App Router: páginas e route handlers.
- `src/features`: hooks, componentes e estado específico da experiência frontend.
- `src/stores`: estado global genuíno, usando Zustand.
- `src/infra`: infraestrutura técnica compartilhada, como Firebase Admin, Firebase Client e JWT.
- `src/shared`: código realmente reutilizável que não importa módulos de negócio.
- `src/components`: componentes UI compartilhados e componentes compostos.

As árvores históricas `src/application` e `src/domain` não devem receber código novo. Novas entidades, ports, DTOs e casos de uso pertencem ao módulo correspondente; conceitos transversais genuínos pertencem a `src/shared/domain`.

## Limites obrigatórios de dependência

- O domínio não pode importar application, presentation, infrastructure, composition, Next.js, Firebase, Zod ou drivers externos.
- A camada application pode depender do domínio e de ports, nunca de adaptadores concretos.
- A presentation pode depender de application e domain, nunca de repositories ou Firebase.
- Adaptadores de infrastructure implementam ports voltados para dentro.
- `src/shared` nunca pode importar de `src/modules`.
- `src/app` obtém comportamento por meio de compositions e contratos públicos; não acessa repositories diretamente.
- `src/composition` é o único lugar para montar repositories concretos, serviços de autenticação, token services, casos de uso e handlers.
- Componentes React e hooks de frontend não podem importar diretamente `@/infra/*`.
- Composições de um módulo não podem importar a composição de outro módulo.
- Dependências entre módulos devem usar ports ou contratos públicos mínimos.
- Mantenha `dependency-cruiser.config.mjs` sincronizado com as decisões arquiteturais.

Valide as regras com:

```bash
pnpm lint:architecture
```

## Módulos atuais

Os módulos de negócio atuais são:

```text
src/modules/
├── churches
├── identity
├── member-profiles
├── members
├── ministries
├── notifications
├── roles
├── scales
├── self-signup
├── service-templates
└── services
```

Cada módulo funcional deve manter, quando aplicável:

```text
module/
├── domain/
├── application/
├── infrastructure/
├── presentation/
└── composition/
```

Não crie pastas vazias ou compositions para módulos sem comportamento funcional.

## Identidade, autenticação e autorização

- Usuários representam identidade e dados de autenticação; não devem conter responsabilidades de escalas ou outros módulos.
- Tokens de acesso devem carregar apenas a identidade e o contexto mínimo necessário para validação.
- Não exponha tokens, credenciais, hashes ou dados sensíveis em DTOs de resposta.
- Mantenha login, logout, sessão, seleção de igreja e `/auth/me` cobertos por testes.
- Erros de autenticação devem ser traduzidos para respostas HTTP somente na camada de presentation.
- Toda autorização deve verificar o usuário autenticado e a permissão necessária.
- Toda operação de negócio deve respeitar a igreja selecionada e o isolamento multi-tenant.
- Nunca permita que um usuário leia ou altere dados de outra igreja.
- Permissões como `CHURCH_SELF_READ`, `CHURCH_SELF_WRITE` e `MEMBER_SELF_WRITE` devem continuar sendo aplicadas no servidor, não apenas na UI.

## Regras de domínio e application

- Mantenha invariantes de negócio nas entidades e value objects.
- Use erros explícitos de domínio/application para falhas esperadas.
- Casos de uso dependem de ports, nunca de repositories concretos.
- Cada caso de uso deve ficar em seu próprio arquivo dentro de `application/use-cases`.
- Não agrupe operações CRUD não relacionadas em uma única classe ou arquivo.
- Cada caso de uso deve ter contrato focado quando houver necessidade de abstração.
- DTOs de casos de uso devem ficar em arquivos dedicados dentro de `application/dtos`.
- Valide entradas com Zod na fronteira apropriada.
- Não exponha entidades de domínio, tipos do Firebase ou objetos HTTP diretamente nos contratos públicos.
- Evite abstrações especulativas e service locators globais.
- Mantenha `create`, `update`, `delete`, `list` e `get` semanticamente claros.
- IDs de documentos devem ser gerados pelo Firebase; não use IDs sequenciais.

## Firebase e infraestrutura

O projeto usa duas bibliotecas Firebase:

| Biblioteca | Uso | Local permitido |
|---|---|---|
| Firebase Admin | APIs, repositories e serviços server-side | `src/infra/firebase-admin` ou infrastructure do módulo |
| Firebase SDK | autenticação e recursos client-side | `src/infra/firebase-client` |

Regras:

- Nunca use Firebase diretamente em componentes React.
- Nunca crie queries Firestore diretamente em hooks.
- Queries específicas de uma feature devem ficar no adapter/repository do módulo.
- `BaseFirebaseRepository` é infraestrutura técnica compartilhada; repositories de negócio pertencem aos respectivos módulos.
- Mappers de entidades pertencem ao módulo dono da entidade.
- Serviços técnicos compartilhados devem permanecer isolados em `src/infra`.
- Secrets devem ficar em `.env.local`; nunca commite credenciais ou arquivos de configuração sensíveis.
- Toda query multi-tenant deve filtrar por `churchId` ou validar o contexto equivalente.

## HTTP e presentation

- Mantenha páginas e route handlers do Next.js finos.
- Parseie e valide entradas HTTP em schemas/handlers de presentation.
- Um handler deve coordenar autenticação, validação de origem, parsing, chamada do caso de uso, tradução de erros e resposta.
- Não crie um objeto `crud` ou handler único que concentre todas as operações de um recurso.
- Não retorne entidades de domínio ou rows de persistência diretamente.
- Use respostas JSON padronizadas e códigos de erro estáveis.
- Não registre erros esperados de validação ou regra de negócio como erros inesperados de servidor.
- Toda rota privada deve validar autenticação e autorização.
- Rotas públicas de autocadastro devem limitar o escopo à igreja informada e aplicar rate limit/validações existentes.

## Convenções de código

- Prefira funções pequenas e nomes explícitos.
- Use `import type` para imports somente de tipo.
- Mantenha imports formatados pelo Biome.
- Preserve espaços verticais entre métodos, funções, tipos e seções lógicas.
- Preserve tipagem TypeScript estrita.
- Não introduza `any`, casts não verificados ou tipos frouxos.
- Mantenha pontos de entrada públicos pequenos.
- Componentes React devem ter props tipadas.
- Use `"use client"` somente quando houver necessidade de browser, estado ou interação.
- Prefira named exports para componentes reutilizáveis.
- Componentes específicos de feature devem ficar em `src/features/<feature>/components`.
- Componentes genéricos devem ficar em `src/components/ui`, `src/components/modules` ou `src/components/templates`, conforme sua responsabilidade.
- Nomes de arquivos e componentes devem seguir o padrão já adotado pelo diretório em que forem criados.

## Limite de tamanho de arquivos

- Target: 150 linhas por arquivo.
- Hard limit: 200 linhas.
- Componentes pequenos: aproximadamente 50-100 linhas.

Fragmente quando houver:

- mais de três responsabilidades distintas;
- renderização com mais de 100 linhas;
- mais de sete hooks de estado/efeito;
- mapeamento de lista com mais de 30 linhas de JSX.

Componentes específicos devem permanecer próximos da feature; componentes verdadeiramente genéricos devem ser promovidos para `src/components`.

## Página de componentes

Sempre que um componente shadcn/ui novo for adicionado ou atualizado, atualize `src/app/components/page.tsx` para demonstrar suas variações.

Valide com:

```bash
pnpm build
```

## Artefatos temporários

- Screenshots, logs de testes visuais e arquivos auxiliares devem ser salvos em `.temp/`.
- Não salve artefatos temporários na raiz do projeto.
- Para Playwright, use caminhos como `.temp/playwright/<arquivo>.png`.
- Artefatos temporários não devem ser commitados.

## Validação obrigatória

Antes de entregar alterações de arquitetura, dependências, Firebase, composição, autenticação ou módulos, execute:

```bash
pnpm lint
pnpm lint:architecture
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

Se uma restrição ambiental impedir alguma verificação, informe a restrição exata e não declare a validação como aprovada.

## Comunicação e execução

- Comece comunicando o resultado esperado e os principais riscos.
- Envie atualizações curtas durante tarefas longas.
- Responda em português, salvo solicitação diferente.
- Se houver uma decisão de negócio ou arquitetura que mude materialmente a implementação, pare e pergunte antes de escolher.
- Preserve alterações existentes do usuário e não sobrescreva trabalho não relacionado.
- Ao diagnosticar, não implemente a correção sem solicitação explícita.
- Ao implementar, valide o resultado proporcionalmente ao risco.
- Ao concluir, informe o que mudou, quais validações passaram e quais pendências permanecem.
- Não use formatação excessiva; prefira explicações claras e objetivas.

## Commits e Git

Nunca crie commit, branch, tag, push ou pull request sem solicitação explícita do usuário.

Nunca crie branches automaticamente. Se uma branch for solicitada, siga o padrão definido pelo usuário; na ausência de padrão, use o prefixo `codex/`.

Quando um commit for autorizado:

- use Conventional Commits;
- mantenha o commit focado;
- inclua a referência ao issue quando existir;
- não inclua arquivos temporários, secrets ou mudanças não relacionadas;
- revise o diff antes de commitar.

Exemplo:

```text
refactor: organize modular architecture

refs #15
```

## Comandos principais

```bash
pnpm dev
pnpm dev:firebase
pnpm build
pnpm start
pnpm lint
pnpm lint:architecture
pnpm typecheck
pnpm test
pnpm check
pnpm format
```
