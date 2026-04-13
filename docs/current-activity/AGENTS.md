# AGENTS.md - Atividade 15: Auto Cadastro de Membros

## Contexto da Atividade

Implementar um fluxo publico de auto cadastro para membros, com vinculacao obrigatoria a uma igreja especifica via link, finalizacao com Google e atribuicao automatica de cargo do sistema com base na configuracao da igreja.

---

## Decisoes Tecnicas Obrigatorias

1. A URL de auto cadastro deve usar **route param**, nao query param.
   - Formato recomendado: `/signup/[churchId]`
2. O cargo padrao da igreja deve referenciar a entidade **UserRole** (`src/domain/entities/UserRole.ts`), nao enum.
3. O backend decide o cargo final. O frontend nao pode escolher `roleId` no fluxo publico.
4. A busca por telefone deve ser global (independente de igreja).

---

## Escopo Funcional

### 1) Pagina publica de auto cadastro

- Criar pagina publica de auto cadastro sem exigir sessao previa.
- Receber `churchId` obrigatoriamente pelo path.
- Carregar contexto minimo da igreja (nome e status de auto cadastro).
- Se igreja nao existir ou estiver indisponivel para auto cadastro, bloquear finalizacao com mensagem amigavel.

### 2) Fluxo em duas etapas no formulario

- Etapa 1: telefone (obrigatorio).
- Ao confirmar telefone, consultar membro existente globalmente.
- Etapa 2: exibir demais campos (email opcional).
- Se membro existir, preencher automaticamente os campos conhecidos para confirmacao/edicao.

### 3) Finalizacao com Google

- CTA final deve ser amigavel (ex: "Continuar com Google para finalizar").
- Ao clicar, executar login Google (fluxo atual de client).
- Enviar token Google + dados do formulario + `churchId` para endpoint de finalizacao.
- Regras de persistencia:
  - Membro novo: criar membro, criar usuario (se necessario), vincular em `MemberChurch`.
  - Membro existente: atualizar dados permitidos e vincular em `MemberChurch` se ainda nao vinculado.
- Garantir idempotencia: nao duplicar `MemberChurch` para o mesmo `memberId + churchId`.

### 4) Cargo padrao da igreja para auto cadastro

- Adicionar campo em Igreja: `defaultSelfSignupUserRoleId` (nome sugerido).
- Campo referencia `roles.id` (UserRole).
- Campo editavel no formulario de igreja (create/edit).
- Campo obrigatorio para permitir auto cadastro.
- Fallback para igrejas legadas sem valor: usar role de menor privilegio (regra definida pelo produto) ate configuracao explicita.
- Mudanca desse campo afeta apenas novos auto cadastros.

### 5) Geracao de link e QRCode

- Disponibilizar no modulo de igrejas uma acao para:
  - copiar link de auto cadastro da igreja
  - visualizar/baixar QRCode correspondente
- Link deve apontar para a rota publica com `churchId`.

---

## Dominio: Entidades a Atualizar

### Church (`src/domain/entities/Church.ts`)

Adicionar campo:

```typescript
protected readonly _defaultSelfSignupUserRoleId: string | null;
```

Atualizar `ChurchParams`:

```typescript
defaultSelfSignupUserRoleId?: string | null;
```

Adicionar getter publico:

```typescript
get defaultSelfSignupUserRoleId(): string | null;
```

### Member (`src/domain/entities/Member.ts`) - recomendacao para busca por telefone

Se necessario para performance/consistencia da busca:

- Adicionar campo persistido normalizado (ex: `phoneNormalized`) ou garantir normalizacao consistente no campo `phone`.
- A consulta global deve usar valor normalizado (somente digitos ou E.164, padrao unico no projeto).

---

## Ports e Repositories

### IChurchRepository

- Sem mudanca obrigatoria de assinatura base, mas deve persistir/retornar `defaultSelfSignupUserRoleId`.

### IMemberRepository

Adicionar metodo para consulta global por telefone:

```typescript
findByPhone(phone: string): Promise<Member | null>;
```

ou (preferivel para evitar ambiguidades):

```typescript
findByNormalizedPhone(phoneNormalized: string): Promise<Member | null>;
```

### IRoleRepository

- Reusar `findById` para validar se o `defaultSelfSignupUserRoleId` existe.

### Implementacoes Firebase Admin

Atualizar:

- `ChurchFirebaseRepository` + mapper de church
- `MemberFirebaseRepository` + mapper de member (caso incluir normalizacao de telefone)

---

## DTOs e Validacao (Zod)

### Church DTOs

Atualizar DTO de igreja para aceitar novo campo:

- `defaultSelfSignupUserRoleId: z.string().min(1)` (com estrategia de fallback para legado no use case)

### Novo DTO de lookup publico por telefone

Local sugerido:

`src/application/dtos/self-signup/SelfSignupLookupDTO.ts`

```typescript
phone: string;
churchId: string;
```

Resposta sugerida:

```typescript
memberExists: boolean;
prefill?: {
  fullName: string;
  email: string | null;
  phone: string | null;
}
```

### Novo DTO de finalizacao publica

Local sugerido:

`src/application/dtos/self-signup/FinalizeSelfSignupDTO.ts`

```typescript
churchId: string;
googleToken: string;
fullName: string;
phone: string;
email?: string;
```

Regras:

- `email` opcional no formulario, mas email vindo do Google deve ser fonte confiavel de autenticacao.
- Ignorar `roleId` no payload do cliente.

---

## Use Cases (Application Layer)

Criar pasta:

`src/application/use-cases/self-signup/`

### 1. GetSelfSignupChurchContext

- Entrada: `churchId`
- Saida: dados publicos da igreja necessarios para tela
- Nao expor dados sensiveis

### 2. LookupMemberByPhone

- Entrada: `churchId`, `phone`
- Normalizar telefone
- Buscar membro globalmente por telefone
- Retornar somente dados de prefill permitidos

### 3. FinalizeSelfSignupWithGoogle

Fluxo esperado:

1. Validar igreja e `defaultSelfSignupUserRoleId`
2. Validar role em `IRoleRepository`
3. Validar token Google com servico atual
4. Identificar membro alvo por telefone (ou por email Google com regra definida)
5. Criar/atualizar Member
6. Criar User quando nao existir (por `memberId`)
7. Garantir vinculacao `MemberChurch` com `roleId = church.defaultSelfSignupUserRoleId`
8. Retornar sucesso + informacoes de sessao (ou orientar login imediato com endpoint atual)

Observacao:

- Se houver divergencia entre email digitado e email do Google, priorizar email autenticado do Google para identidade.

---

## Dependency Injection

Criar container de self-signup:

`src/infra/di/self-signup/container.ts`

Dependencias minimas:

- `IChurchRepository`
- `IMemberRepository`
- `IMemberChurchRepository`
- `IUserRepository`
- `IRoleRepository`
- `IGoogleAuthService`
- `ITokenService` (se o fluxo tambem criar sessao imediatamente)

Atualizar:

- `src/infra/di/index.ts` para exportar `selfSignupContainer`

---

## API: Route Handlers

Criar rotas publicas em:

`src/app/api/public/self-signup/`

### Endpoints sugeridos

1. `GET /api/public/self-signup/[churchId]`
   - Obter contexto publico da igreja para auto cadastro

2. `POST /api/public/self-signup/lookup-member`
   - Body: `churchId`, `phone`
   - Retorna prefill basico sem vazar dados sensiveis

3. `POST /api/public/self-signup/finalize`
   - Body: `churchId`, `googleToken`, dados de cadastro
   - Executa criar/atualizar + vincular + atribuir role

### Seguranca

- Essas rotas sao publicas (sem cookie de sessao), mas devem:
  - validar schema estritamente
  - limitar superficie de dados retornados
  - aplicar rate-limit (se ja existir infra de rate-limit)
  - nunca aceitar `roleId` do cliente

---

## Frontend: Paginas, Hooks e Componentes

### Pagina publica

Local sugerido:

`src/app/(public)/signup/[churchId]/page.tsx`

### Feature sugerida

`src/features/self-signup/`

Arquivos sugeridos:

- `hooks/useSelfSignup.ts`
- `components/SelfSignupPhoneStep.tsx`
- `components/SelfSignupFormStep.tsx`
- `components/SelfSignupGoogleButton.tsx`

### Ajustes em Igreja

- Atualizar `src/features/churches/components/ChurchForm.tsx`
- Atualizar `src/features/churches/hooks/useChurchForm.ts`
- Exibir seletor de role padrao de auto cadastro no formulario da igreja

### QRCode na area privada

Adicionar na experiencia de igrejas (lista ou edicao):

- acao "Link de auto cadastro"
- modal/cartao com link e QRCode

---

## Regras de Negocio e Validacoes

1. **Igreja obrigatoria por path**
   - Sem `churchId` valido, nao existe auto cadastro.

2. **Role obrigatoria por igreja**
   - Se igreja nao tiver `defaultSelfSignupUserRoleId`, bloquear finalizacao e orientar configuracao no admin.

3. **Role valida**
   - `defaultSelfSignupUserRoleId` deve existir em `roles`.

4. **Vinculacao idempotente**
   - Nao criar duplicata em `member_churches` para mesma combinacao `memberId + churchId`.

5. **Privacidade na busca de telefone**
   - Retornar apenas campos necessarios para prefill.
   - Nao retornar listas de igrejas/permissoes/roles.

6. **Integridade com Google**
   - Token Google obrigatorio na finalizacao.
   - Identidade autenticada vem do provedor Google.

7. **Multitenancy preservado**
   - Mesmo com busca global de membro, vinculacao sempre direcionada para igreja do link.

---

## Checklist de Implementacao

### Fase 1: Dominio e Persistencia
- [ ] Atualizar entidade `Church` com `defaultSelfSignupUserRoleId`
- [ ] Atualizar mapper e repository de church
- [ ] Adicionar busca por telefone global no member repository

### Fase 2: DTOs
- [ ] Atualizar DTOs de church para novo campo
- [ ] Criar DTO de lookup por telefone
- [ ] Criar DTO de finalizacao de auto cadastro

### Fase 3: Use Cases
- [ ] Criar `GetSelfSignupChurchContext`
- [ ] Criar `LookupMemberByPhone`
- [ ] Criar `FinalizeSelfSignupWithGoogle`

### Fase 4: DI e API
- [ ] Criar `self-signup/container.ts`
- [ ] Exportar no `infra/di/index.ts`
- [ ] Criar rotas `/api/public/self-signup/*`

### Fase 5: Frontend
- [ ] Criar pagina publica `/signup/[churchId]`
- [ ] Implementar formulario em duas etapas
- [ ] Integrar com login Google
- [ ] Atualizar formulario de igreja com role padrao
- [ ] Implementar visualizacao de link + QRCode

### Fase 6: Validacao Final
- [ ] Fluxo de novo membro validado
- [ ] Fluxo de membro existente validado
- [ ] Fluxo de igreja invalida validado
- [ ] `pnpm lint` passando
- [ ] `pnpm build` passando

---

## Fora de Escopo

- Auto cadastro para multiplas igrejas no mesmo link
- Definicao manual de role no fluxo publico
- Migracao retroativa de role para membros ja vinculados
- Alteracao do modelo de permissao fora do uso de `UserRole`
