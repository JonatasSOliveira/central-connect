# AGENTS.md - Atividade 16: Regras de Escala e Geracao Automatica

## Contexto da Atividade

Implementar regras de alocacao para escalas com base em:

- disponibilidade semanal de membros
- limite maximo de escalas seguidas por membro
- quantidade obrigatoria por funcao (role) em cada ministerio
- geracao automatica/manual de escalas para cultos

Referencia funcional obrigatoria:

- `docs/current-activity/16-regras-escala-automatica.md`

---

## Decisoes Tecnicas Obrigatorias

1. `maxConsecutiveScalesPerMember` e **global por igreja**.
2. O backend decide elegibilidade e alocacao final. Frontend nao envia decisao de alocacao.
3. Geracao automatica deve ser idempotente.
4. Escalas `published` nao podem ser sobrescritas pela rotina automatica.
5. Regra existente deve continuar valida: um membro nao pode estar em dois ministerios no mesmo culto.
6. Quantidade por funcao vem de `requiredCount` em `MinistryRole`.

---

## Planejamento Passo a Passo (execucao recomendada)

### Passo 1 - Dominio e Persistencia

Objetivo: criar os campos e contratos que sustentam as regras.

1. Atualizar `Church` com `maxConsecutiveScalesPerMember` (obrigatorio, inteiro > 0).
2. Atualizar `MinistryRole` com `requiredCount` (obrigatorio, inteiro >= 1).
3. Evoluir disponibilidade semanal:
   - Reaproveitar `MemberAvailability` e adicionar `mode` (`ALLOW_LIST` | `BLOCK_LIST`) por membro+igreja,
   - ou modelar estrutura equivalente mantendo semantica identica.
4. Atualizar mappers/repositories Firebase Admin para novos campos.
5. Garantir defaults seguros para dados legados:
   - igreja sem valor: definir default de `maxConsecutiveScalesPerMember` no use case/API (ex.: 2)
   - role sem valor: `requiredCount = 1`

Entregaveis minimos:

- entidades atualizadas
- repositorios atualizados
- sem quebra de leitura de dados antigos

### Passo 2 - DTOs e APIs de Cadastro

Objetivo: permitir editar as novas regras no sistema.

1. Church DTOs/API:
   - incluir `maxConsecutiveScalesPerMember` em create/update/get
2. Ministry DTOs/API:
   - incluir `requiredCount` por role no create/update/get
3. Member DTOs/API:
   - incluir disponibilidade semanal (modo + dias)
4. Validacao Zod obrigatoria para todos os campos novos.

Entregaveis minimos:

- payloads novos validados
- dados persistidos e retornados corretamente

### Passo 3 - Frontend de Configuracao

Objetivo: expor regras no UI com boa UX mobile-first.

1. Membro:
   - secao "Disponibilidade semanal"
   - seletor de modo (ALLOW/BLOCK)
   - selecao dos dias da semana
2. Igreja:
   - secao "Regras de Escala"
   - campo `maxConsecutiveScalesPerMember` com NumberStepper
3. Ministerio:
   - em cada role, incluir `requiredCount` com NumberStepper
   - feedback de validacao por role

Entregaveis minimos:

- formularios create/edit atualizados
- estados de erro/sucesso consistentes

### Passo 4 - Motor de Elegibilidade e Alocacao

Objetivo: criar algoritmo deterministico para gerar escalas.

Implementar use cases/helpers:

1. `ValidateMemberEligibilityForService`
   - verifica disponibilidade no dia
   - verifica limite de escalas seguidas na igreja
   - verifica conflito no mesmo culto (membro ja usado)
2. `GenerateScalesAutomatically`
   - recebe janela de servicos alvo
   - cria/atualiza escalas `draft` por `service + ministry`
   - preenche vagas por role conforme `requiredCount`
   - gera resumo com pendencias e motivos

Criterio de desempate (deterministico):

1. menor sequencia atual
2. menor carga recente
3. ordem alfabetica

Entregaveis minimos:

- geracao manual funcional
- resumo de execucao

### Passo 5 - API de Geracao

Objetivo: expor geracao com seguranca.

1. Criar endpoint manual:
   - `POST /api/scales/generate`
2. Criar endpoint para scheduler interno:
   - `POST /api/scales/generate/scheduled-run`
3. Aplicar autorizacao por permissao (novo permission group de automacao de escala ou reutilizacao controlada).
4. Garantir multi-tenant por `churchId`.

Entregaveis minimos:

- endpoints funcionando
- erros padronizados

### Passo 6 - Agendamento

Objetivo: suportar execucao automatica por horario.

1. Configuracao de agendamento no `ServiceTemplate` (ou modelo equivalente):
   - habilitado
   - dia/hora de execucao
   - antecedencia em dias
2. `RunScheduledScaleGeneration` para executar rotina agendada.
3. Integrar com mecanismo de cron do ambiente (endpoint interno seguro).

Entregaveis minimos:

- configuracao salva
- rotina executavel por cron

### Passo 7 - UI de Acionamento em Escalas

Objetivo: permitir operacao manual clara para usuarios autorizados.

1. Adicionar acao "Gerar escalas automaticamente" em `/scales`.
2. Form simplificado para periodo alvo.
3. Exibir resumo pos-geracao:
   - criadas
   - atualizadas
   - pendentes
   - principais motivos de bloqueio

Entregaveis minimos:

- fluxo manual de geracao no frontend

### Passo 8 - Validacao Final

1. Validar cenarios obrigatorios do arquivo da atividade.
2. Rodar:
   - `pnpm lint`
   - `pnpm build`
3. Registrar pendencias que ficarem fora de escopo.

---

## Regras de Negocio Obrigatorias

1. Disponibilidade semanal e obrigatoria para o motor de elegibilidade.
2. Limite de sequencia e aplicado por igreja, nao por ministerio.
3. Nao duplicar escala para mesmo `serviceId + ministryId`.
4. Nao duplicar membro na mesma escala.
5. Nao escalar membro em ministerios diferentes no mesmo culto.
6. Respeitar `requiredCount` por role; se faltar candidato, registrar pendencia.
7. Nao editar automaticamente escala publicada.

---

## Arquivos Alvo (guia)

### Dominio

- `src/domain/entities/Church.ts`
- `src/domain/entities/MinistryRole.ts`
- `src/domain/entities/MemberAvailability.ts`

### Ports

- `src/domain/ports/IChurchRepository.ts`
- `src/domain/ports/IMinistryRoleRepository.ts`
- `src/domain/ports/IMemberAvailabilityRepository.ts` (novo se necessario)
- `src/domain/ports/IScaleRepository.ts`
- `src/domain/ports/IScaleMemberRepository.ts`

### Infra Firebase Admin

- mappers/repositories de church, ministryRole, memberAvailability, scale e scaleMember

### Application

- DTOs de member/church/ministry/scale-generate
- use-cases de elegibilidade e geracao automatica

### API

- `src/app/api/churches/*`
- `src/app/api/members/*`
- `src/app/api/ministries/*`
- `src/app/api/scales/generate/route.ts` (novo)
- `src/app/api/scales/generate/scheduled-run/route.ts` (novo)

### Frontend

- `src/features/members/*`
- `src/features/churches/*`
- `src/features/ministries/*`
- `src/features/scales/*`
- `src/features/serviceTemplates/*` (config de agendamento)

---

## Checklist de Implementacao

### Fase 1: Dominio e Persistencia
- [ ] Campo global de sequencia por igreja implementado
- [ ] Campo `requiredCount` por role implementado
- [ ] Disponibilidade semanal por membro implementada
- [ ] Mappers/repositories atualizados

### Fase 2: Cadastro e Edicao
- [ ] APIs de membro/igreja/ministerio atualizadas
- [ ] Formularios atualizados
- [ ] Validacoes Zod atualizadas

### Fase 3: Geracao Automatica
- [ ] Algoritmo de elegibilidade implementado
- [ ] Geracao por role respeitando `requiredCount`
- [ ] Respeito a regras de conflito no mesmo culto
- [ ] Resumo de pendencias implementado

### Fase 4: Agendamento
- [ ] Configuracao de agendamento no modelo de culto
- [ ] Endpoint interno de execucao agendada
- [ ] Idempotencia garantida

### Fase 5: Validacao
- [ ] Cenarios manuais obrigatorios validados
- [ ] `pnpm lint` passando
- [ ] `pnpm build` passando

---

## O que nunca fazer nesta atividade

- Nao quebrar regras multi-tenant por `churchId`.
- Nao sobrescrever escalas publicadas automaticamente.
- Nao depender do frontend para decidir elegibilidade.
- Nao introduzir aleatoriedade sem criterio deterministico de desempate.
- Nao usar `any` em TypeScript.
