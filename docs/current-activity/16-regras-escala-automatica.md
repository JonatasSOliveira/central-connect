# Atividade 16: Regras de Escala de Membros e Geracao Manual Assistida

## 📋 User Story

**Como** administrador/lider de ministerio,  
**quero** configurar regras de disponibilidade e limite de sequencia dos membros, alem de gerar escalas pelo botao de geracao assistida,  
**para** reduzir trabalho manual e garantir escalas consistentes com as regras da igreja.

---

## 🎯 Objetivos da Atividade

1. Permitir definir dias da semana em que o membro pode/nao pode servir.
2. Configurar limite de escalas seguidas por membro (obrigatorio) **global por igreja**.
3. Permitir geracao assistida de escalas para cultos via acao manual em `/scales`.
4. Garantir que a geracao assistida respeite regras de negocio existentes e novas.
5. Definir, no ministerio, a quantidade obrigatoria por funcao (role) por culto.

---

## ✅ Escopo Funcional

### 1) Disponibilidade semanal no membro

- Adicionar secao no formulario de membro para configurar disponibilidade semanal.
- O usuario pode configurar em dois modos:
  - **ALLOW_LIST**: dias em que o membro pode servir.
  - **BLOCK_LIST**: dias em que o membro nao pode servir.
- A geracao automatica usa essa configuracao para filtrar elegibilidade.

### 2) Configuracao de limite de escalas seguidas

- Criar configuracao obrigatoria com numero inteiro positivo:
  - `maxConsecutiveScalesPerMember`
- Essa regra deve ser considerada na geracao automatica.
- Local da configuracao: **Igreja** (global por igreja).

### 3) Geracao assistida de escalas (acao manual)

- Permitir gerar escalas automaticamente via botao manual em `/scales`.
- A execucao manual deve respeitar:
  - Disponibilidade semanal do membro.
  - Limite de escalas seguidas.
  - Regra existente: nao escalar a mesma pessoa no mesmo culto em ministerios diferentes.
  - Quantidade obrigatoria por funcao de cada ministerio.
- Se nao houver membros suficientes, a escala e criada parcialmente com sinalizacao de pendencia.
- Nao deve criar escala duplicada para o mesmo par `serviceId + ministryId`.

### 4) Ministerio: quantidade obrigatoria por funcao

- No formulario de ministerio, cada funcao (`MinistryRole`) deve possuir campo obrigatorio:
  - `requiredCount` (inteiro >= 1)
- A geracao assistida deve preencher vagas por funcao com base nesse valor.

---

## 🧠 Regras de Alocacao (ordem de prioridade)

1. Membro pertence ao ministerio (regra existente).
2. Membro esta elegivel para o dia do culto conforme disponibilidade.
3. Membro nao ultrapassa `maxConsecutiveScalesPerMember` da igreja.
4. Membro nao pode estar em outro ministerio no mesmo culto.
5. Alocacao por funcao respeitando `requiredCount`.
6. Criterio de desempate (deterministico):
   - Menor sequencia atual de escalas.
   - Menor carga recente (ultimos N cultos).
   - Ordem alfabetica.

---

## 🧩 UX/UI Proposta

### Membro (`/members/new`, `/members/[id]/edit`)

- Nova secao: **Disponibilidade semanal**
  - Toggle de modo: "Pode servir" vs "Nao pode servir"
  - Selecao dos dias da semana (chips/checkboxes)
  - Texto de ajuda com exemplo pratico

### Igreja (`/churches/[id]/edit`)

- Nova secao: **Regras de Escala**
  - Campo obrigatorio: `Maximo de escalas seguidas por membro`
  - Hint: "Ex.: 2 significa no maximo dois cultos consecutivos"

### Ministerio (`/ministries/new`, `/ministries/[id]/edit`)

- Lista de funcoes com:
  - Nome da funcao
  - `requiredCount` (NumberStepper)
- Validacao visual por funcao obrigatoria

### Escalas (`/scales`)

- Nova acao: **Gerar escalas automaticamente**
  - Manual: gerar agora por culto + ministerio
  - Exibir resumo pos-geracao:
    - Quantas escalas criadas/atualizadas
    - Quantas vagas ficaram pendentes
    - Motivos principais de bloqueio (sem disponibilidade, limite consecutivo etc.)

---

## 🔒 Regras de Seguranca e Integridade

- Toda geracao e multi-tenant por `churchId`.
- Endpoint manual de geracao exige autenticacao e permissao.
- Operacao de geracao manual deve ser idempotente:
  - Evitar duplicar escalas por `serviceId + ministryId`.
  - Evitar duplicar membros na mesma escala.
- Escalas `published` nao devem ser sobrescritas pela rotina de geracao.

---

## ✅ Criterios de Aceitacao

- [x] Formulario de membro permite configurar disponibilidade semanal em modo pode/nao pode.
- [x] Disponibilidade e persistida e retornada corretamente na API de membro.
- [x] Existe configuracao obrigatoria de `maxConsecutiveScalesPerMember` global por igreja.
- [x] Formulario de ministerio permite informar `requiredCount` por funcao.
- [x] Geracao assistida via botao cria escalas para cultos com base nas regras.
- [x] Geracao respeita regra de membro unico por culto (sem duplicidade em ministerios distintos).
- [x] Geracao respeita limite de escalas seguidas por membro.
- [x] Geracao respeita disponibilidade semanal do membro.
- [x] Geracao respeita `requiredCount` por funcao.
- [ ] Quando faltar membro elegivel, vagas pendentes sao sinalizadas.
- [x] Existe execucao manual de geracao em `/scales`.
- [x] Quando ja existir escala para `serviceId + ministryId`, a UI informa o conflito e oferece abrir a escala existente.
- [x] Build passando.
- [ ] Lint passando.

---

## 🏗️ Impacto Tecnico (Arquitetura)

### Entidades de dominio

- Atualizar `MemberAvailability` para suportar modo:
  - `mode: "ALLOW_LIST" | "BLOCK_LIST"`
- Atualizar `Church`:
  - `maxConsecutiveScalesPerMember: number`
- Atualizar `MinistryRole`:
  - `requiredCount: number`
- (Opcional recomendado) adicionar metadados de geracao em `Scale`:
  - `generationType: "manual" | "auto"`
  - `generationStatus: "complete" | "partial"`

### Ports / Repositories

- `IMemberAvailabilityRepository` (novo, caso ainda nao exista implementacao)
- `IMinistryRoleRepository` com suporte a `requiredCount`
- `IChurchRepository` com novo campo de configuracao
- `IScaleRepository` e `IScaleMemberRepository` com consultas para suporte a validacao de conflito por culto

### DTOs / Zod

- Atualizar DTOs de membro para disponibilidade semanal
- Atualizar DTOs de igreja para `maxConsecutiveScalesPerMember`
- Atualizar DTOs de ministerio (roles com `requiredCount`)
- Criar DTOs de geracao assistida/manual:
  - execucao manual
  - resumo de resultado da geracao

### Use Cases (Application Layer)

- `GenerateScalesAutomatically`
- `GetScaleGenerationPreview` (opcional recomendado para UX)
- `ValidateMemberEligibilityForService` (helper/reuse)

### APIs

- `POST /api/scales/generate` (manual)
- Atualizar:
  - `/api/members` e `/api/members/[memberId]`
  - `/api/churches` e `/api/churches/[churchId]`
  - `/api/ministries` e `/api/ministries/[ministryId]`

### Frontend Features

- `features/members/*` (disponibilidade)
- `features/churches/*` (regra de sequencia)
- `features/ministries/*` (required por funcao)
- `features/scales/*` (geracao assistida/manual + resumo)

---

## 🚀 Fases de Implementacao

### Fase 1: Base de dados e dominio
- [x] Modelar campos novos (`Church`, `MinistryRole`, disponibilidade do membro)
- [x] Atualizar mappers e repositories Firebase
- [x] Backfill/migracao de dados legados com defaults seguros

### Fase 2: Cadastro e edicao
- [x] Ajustar DTOs e APIs de membro/igreja/ministerio
- [x] Ajustar formularios e validacoes de UI

### Fase 3: Motor de geracao assistida/manual
- [x] Implementar algoritmo de elegibilidade e alocacao
- [x] Implementar geracao por culto/ministerio/funcao
- [ ] Implementar resumo de geracao e pendencias

### Fase 4: Validacao final
- [ ] Testes de cenarios criticos
- [ ] `pnpm lint` passando
- [x] `pnpm build` passando

---

## 🧪 Cenarios obrigatorios para validacao manual

- [ ] Membro indisponivel no dia nao e escalado
- [ ] Membro com limite de sequencia atingido nao e escalado
- [ ] Membro nao aparece em dois ministerios no mesmo culto
- [ ] Geracao preenche por funcao conforme `requiredCount`
- [ ] Geracao parcial informa pendencias corretamente
- [ ] Reexecucao da geracao nao cria duplicatas
- [ ] Escalas publicadas nao sao sobrescritas pela geracao

---

## Fora de Escopo (nesta atividade)

- Agendamento por cron/scheduler (`/api/scales/generate/scheduled-run`).
- Configuracao de automacao em modelo de culto (`service-templates`).
- Otimizacao avancada de distribuicao com IA/solver matematico.
- Rebalanceamento retroativo de escalas ja publicadas.
- Notificacoes automaticas aos membros apos geracao (pode virar atividade separada).
