# AGENTS.md - Atividade 11: Gerenciamento de Escalas (Scales)

## Contexto da Atividade

Implementar o gerenciamento de escalas ministeriais onde cada escala é vinculada a um culto (Service) e um ministério (Ministry), permitindo atribuir múltiplos membros com suas respectivas funções.

---

## Domínio: Entidades a Criar

### 1. Scale (Nova Entidade)

**Localização:** `src/domain/entities/Scale.ts`

**Herança:** `AuditableEntity` (possui `churchId`)

**Campos:**
```typescript
export type ScaleStatus = "draft" | "published";

export class Scale extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _serviceId: string;
  protected readonly _ministryId: string;
  protected readonly _status: ScaleStatus;
  protected readonly _notes: string | null;
}
```

**Params:**
```typescript
export interface ScaleParams extends AuditableEntityParams {
  churchId: string;
  serviceId: string;
  ministryId: string;
  status?: ScaleStatus;
  notes?: string | null;
}
```

### 2. ScaleMember (Nova Entidade)

**Localização:** `src/domain/entities/ScaleMember.ts`

**Herança:** `BaseEntity` (não precisa de `churchId`, pertence a Scale)

**Campos:**
```typescript
export class ScaleMember extends BaseEntity {
  protected readonly _scaleId: string;
  protected readonly _memberId: string;
  protected readonly _ministryRoleId: string;
  protected readonly _notes: string | null;
}
```

**Params:**
```typescript
export interface ScaleMemberParams extends BaseEntityParams {
  scaleId: string;
  memberId: string;
  ministryRoleId: string;
  notes?: string | null;
}
```

---

## Ports: Interfaces de Repository

### IScaleRepository

**Localização:** `src/domain/ports/IScaleRepository.ts`

```typescript
import type { BaseRepository } from "./BaseRepository";
import type { Scale } from "@/domain/entities/Scale";

export interface IScaleRepository extends BaseRepository<Scale> {
  findAll(): Promise<Scale[]>;
  findByChurchId(churchId: string): Promise<Scale[]>;
  findById(id: string): Promise<Scale | null>;
  findByServiceAndMinistry(
    churchId: string,
    serviceId: string,
    ministryId: string,
    excludeId?: string
  ): Promise<Scale | null>;
  findByFilters(
    churchId: string,
    filters: { serviceId?: string; ministryId?: string }
  ): Promise<Scale[]>;
}
```

### IScaleMemberRepository

**Localização:** `src/domain/ports/IScaleMemberRepository.ts`

```typescript
import type { BaseRepository } from "./BaseRepository";
import type { ScaleMember } from "@/domain/entities/ScaleMember";

export interface IScaleMemberRepository extends BaseRepository<ScaleMember> {
  findAll(): Promise<ScaleMember[]>;
  findByScaleId(scaleId: string): Promise<ScaleMember[]>;
  findById(id: string): Promise<ScaleMember | null>;
  deleteByScaleId(scaleId: string): Promise<void>;
}
```

---

## Infraestrutura: Repositories Firebase

### Estrutura de Pastas

```
src/infra/firebase-admin/
├── repositories/
│   ├── ScaleFirebaseRepository.ts
│   └── ScaleMemberFirebaseRepository.ts
└── mappers/
    ├── scaleMapper.ts
    └── scaleMemberMapper.ts
```

### ScaleFirebaseRepository

- Coleção Firestore: `"scales"`
- Implementar `IScaleRepository`
- Implementar `toEntity` e `toFirestoreData`
- Métodos customizados: `findByServiceAndMinistry`, `findByFilters`

### ScaleMemberFirebaseRepository

- Coleção Firestore: `"scale_members"`
- Implementar `IScaleMemberRepository`
- Implementar `toEntity` e `toFirestoreData`
- Métodos customizados: `findByScaleId`, `deleteByScaleId`

### Mappers

```typescript
// scaleMapper.ts
export function scaleToPersistence(scale: Scale): DocumentData;
export function scaleFromPersistence(data: DocumentData, id: string): Scale;

// scaleMemberMapper.ts
export function scaleMemberToPersistence(member: ScaleMember): DocumentData;
export function scaleMemberFromPersistence(data: DocumentData, id: string): ScaleMember;
```

---

## Aplicação: DTOs com Zod

### Localização

```
src/application/dtos/scale/
├── ScaleDTO.ts
└── errors/
    └── ScaleErrors.ts
```

### ScaleDTO.ts - Schemas

```typescript
import { z } from "zod";

// Input/Output types
export const ScaleStatusSchema = z.enum(["draft", "published"]);

export const ScaleMemberFormSchema = z.object({
  id: z.string().nullable().optional(),
  memberId: z.string().min(1, "Membro é obrigatório"),
  ministryRoleId: z.string().min(1, "Função é obrigatória"),
  notes: z.string().optional(),
});

export const ScaleFormSchema = z.object({
  serviceId: z.string().min(1, "Culto é obrigatório"),
  ministryId: z.string().min(1, "Ministério é obrigatório"),
  status: ScaleStatusSchema.default("draft"),
  notes: z.string().max(500).optional(),
  members: z.array(ScaleMemberFormSchema).default([]),
});

export const ListScalesQuerySchema = z.object({
  serviceId: z.string().optional(),
  ministryId: z.string().optional(),
});

// Response schemas
export const ScaleMemberListItemSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  ministryRoleId: z.string(),
  notes: z.string().nullable(),
});

export const ScaleListItemSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  ministryId: z.string(),
  status: ScaleStatusSchema,
  notes: z.string().nullable(),
});

export const ScaleDetailSchema = ScaleListItemSchema.extend({
  members: z.array(ScaleMemberListItemSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types
export type ScaleFormData = z.infer<typeof ScaleFormSchema>;
export type ScaleFormInput = z.input<typeof ScaleFormSchema>;
export type ScaleListItemDTO = z.infer<typeof ScaleListItemSchema>;
export type ScaleDetailDTO = z.infer<typeof ScaleDetailSchema>;
export type ScaleMemberDTO = z.infer<typeof ScaleMemberListItemSchema>;
```

### ScaleErrors.ts

```typescript
export const ScaleErrors = {
  SCALE_NOT_FOUND: { code: "SCALE_NOT_FOUND", message: "Escala não encontrada" },
  SCALE_ALREADY_EXISTS: {
    code: "SCALE_ALREADY_EXISTS",
    message: "Já existe uma escala para este culto e ministério"
  },
  SCALE_CREATION_FAILED: { code: "SCALE_CREATION_FAILED", message: "Falha ao criar escala" },
  SCALE_UPDATE_FAILED: { code: "SCALE_UPDATE_FAILED", message: "Falha ao atualizar escala" },
  SCALE_DELETE_FAILED: { code: "SCALE_DELETE_FAILED", message: "Falha ao excluir escala" },
  MEMBER_NOT_FOUND: { code: "MEMBER_NOT_FOUND", message: "Membro não encontrado" },
  MINISTRY_ROLE_NOT_FOUND: { code: "MINISTRY_ROLE_NOT_FOUND", message: "Função não encontrada" },
} as const;
```

---

## Aplicação: Use Cases

### Localização

```
src/application/use-cases/scale/
├── CreateScale.ts
├── GetScale.ts
├── UpdateScale.ts
├── DeleteScale.ts
├── ListScales.ts
├── AddMemberToScale.ts
└── RemoveMemberFromScale.ts
```

### CreateScale

```typescript
interface CreateScaleInput {
  churchId: string;
  serviceId: string;
  ministryId: string;
  status?: "draft" | "published";
  notes?: string | null;
  members?: { memberId: string; ministryRoleId: string; notes?: string | null }[];
  createdByUserId: string;
}

interface CreateScaleOutput {
  scale: ScaleDetailDTO;
}

class CreateScale extends BaseUseCase<CreateScaleInput, CreateScaleOutput> {
  async execute(input: CreateScaleInput): Promise<Result<CreateScaleOutput>> {
    // 1. Verificar duplicata (serviceId + ministryId únicos por churchId)
    const existing = await this.scaleRepository.findByServiceAndMinistry(
      input.churchId,
      input.serviceId,
      input.ministryId
    );
    if (existing) {
      return { ok: false, error: ScaleErrors.SCALE_ALREADY_EXISTS };
    }

    // 2. Criar Scale
    const scaleParams: ScaleParams = { ... };
    const scale = new Scale(scaleParams);
    const createdScale = await this.scaleRepository.create(scale);

    // 3. Criar ScaleMembers (se houver)
    for (const member of input.members ?? []) {
      const memberParams: ScaleMemberParams = {
        scaleId: createdScale.id,
        memberId: member.memberId,
        ministryRoleId: member.ministryRoleId,
        notes: member.notes ?? null,
      };
      const scaleMember = new ScaleMember(memberParams);
      await this.scaleMemberRepository.create(scaleMember);
    }

    // 4. Retornar com members
    const members = await this.scaleMemberRepository.findByScaleId(createdScale.id);
    return { ok: true, value: { scale: { ... } } };
  }
}
```

### ListScales

```typescript
interface ListScalesInput {
  churchId: string;
  serviceId?: string;
  ministryId?: string;
}

interface ListScalesOutput {
  scales: ScaleListItemDTO[];
}

class ListScales extends BaseUseCase<ListScalesInput, ListScalesOutput> {
  async execute(input: ListScalesInput): Promise<Result<ListScalesOutput>> {
    const scales = await this.scaleRepository.findByFilters(input);
    return { ok: true, value: { scales } };
  }
}
```

### AddMemberToScale / RemoveMemberFromScale

- Similar ao padrão de MinistryRole em Ministry

### UpdateScale

- Atualizar dados da Scale e gerenciar sync de members (adicionar/remover/editar)

### DeleteScale

- Deletar Scale e cascade deletar todos ScaleMembers

---

## Dependency Injection

### Localização

```
src/infra/di/scale/
└── container.ts
```

```typescript
class ScaleContainer {
  private static _scaleRepository: IScaleRepository | null = null;
  private static _scaleMemberRepository: IScaleMemberRepository | null = null;
  private static _createScale: CreateScale | null = null;
  // ... outros use cases

  static get scaleRepository(): IScaleRepository {
    if (!ScaleContainer._scaleRepository) {
      ScaleContainer._scaleRepository = new ScaleFirebaseRepository();
    }
    return ScaleContainer._scaleRepository;
  }

  static get scaleMemberRepository(): IScaleMemberRepository {
    if (!ScaleContainer._scaleMemberRepository) {
      ScaleContainer._scaleMemberRepository = new ScaleMemberFirebaseRepository();
    }
    return ScaleContainer._scaleMemberRepository;
  }

  // ... getters para use cases
}

export const scaleContainer = ScaleContainer;
```

**Atualizar:** `src/infra/di/index.ts` - exportar `scaleContainer`

---

## API: Route Handlers

### Endpoints REST

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/scales` | Listar escalas (com filtros) |
| POST | `/api/scales` | Criar escala |
| GET | `/api/scales/[scaleId]` | Obter escala por ID |
| PUT | `/api/scales/[scaleId]` | Atualizar escala |
| DELETE | `/api/scales/[scaleId]` | Excluir escala |

### Localização

```
src/app/api/scales/
├── route.ts
└── [scaleId]/
    └── route.ts
```

### Validações de Permissão

```typescript
// Verificar permissões
const hasReadAccess = user.isSuperAdmin || user.permissions.includes(Permission.SCHEDULE_READ);
const hasWriteAccess = user.isSuperAdmin || user.permissions.includes(Permission.SCHEDULE_WRITE);
const hasDeleteAccess = user.isSuperAdmin || user.permissions.includes(Permission.SCHEDULE_DELETE);
```

---

## Camada de Feature: Hooks

### Localização

```
src/features/scales/
├── hooks/
│   ├── useScales.ts
│   └── useScaleForm.ts
└── types/
    └── index.ts
```

### useScales.ts

```typescript
interface UseScalesReturn {
  scales: ScaleListItemDTO[];
  allScalesCount: number;
  isLoading: boolean;
  searchQuery: string;
  setSearch: (query: string) => void;
  filters: { serviceId?: string; ministryId?: string };
  setFilters: (filters: { serviceId?: string; ministryId?: string }) => void;
  deleteScale: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useScales(): UseScalesReturn {
  // Implementação com filtros por serviceId e ministryId
}
```

### useScaleForm.ts

```typescript
interface UseScaleFormProps {
  mode: "create" | "edit";
  scaleId?: string;
}

interface UseScaleFormReturn {
  form: UseFormReturn<ScaleFormInput>;
  availableMembers: MemberListItemDTO[];  // Filtrados por ministryId
  availableRoles: MinistryRoleListItemSchema[];  // Roles do ministério selecionado
  members: ScaleMemberDTO[];
  isLoading: boolean;
  isFetching: boolean;
  onSubmit: (data: ScaleFormInput) => Promise<void>;
}

// Lógica:
// - Quando ministryId muda, buscar members do ministério e roles
// - Ao selecionar membro, mostrar apenas roles daquele ministry
```

---

## Camada de Feature: Componentes

### Localização

```
src/features/scales/
├── components/
│   ├── ScaleList.tsx
│   ├── ScaleForm.tsx
│   ├── ScaleMemberList.tsx
│   └── ScaleFilter.tsx
└── types/
    └── index.ts
```

### ScaleForm.tsx

```typescript
export function ScaleForm({ mode, scaleId }: ScaleFormProps) {
  const { form, availableMembers, availableRoles, members, onSubmit } = useScaleForm({ mode, scaleId });
  const { watch, setValue } = form;
  const selectedMinistryId = watch("ministryId");

  return (
    <FormTemplate>
      <FormSelect
        label="Culto"
        options={services.map(s => ({ value: s.id, label: s.title }))}
        onChange={(v) => setValue("serviceId", v)}
      />
      <FormSelect
        label="Ministério"
        options={ministries.map(m => ({ value: m.id, label: m.name }))}
        onChange={(v) => setValue("ministryId", v)}
      />
      
      {/* Lista de membros com roles filtrados pelo ministério */}
      {selectedMinistryId && (
        <ScaleMemberList
          members={members}
          availableMembers={availableMembers}
          availableRoles={availableRoles}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      )}

      <FormSelect
        label="Status"
        options={[{ value: "draft", label: "Rascunho" }, { value: "published", label: "Publicada" }]}
      />

      <Button onClick={form.handleSubmit(onSubmit)}>
        {mode === "create" ? "Criar Escala" : "Salvar Alterações"}
      </Button>
    </FormTemplate>
  );
}
```

---

## Páginas

### Localização

```
src/app/(pages)/
├── scales/
│   ├── page.tsx           # Listagem
│   ├── new/
│   │   └── page.tsx       # Criar
│   └── [scaleId]/
│       └── edit/
│           └── page.tsx   # Editar
```

### scales/page.tsx

- Usar `ListTemplate` com filtros
- `<ScaleFilter>` para serviceId e ministryId
- `<ScaleList>` com ações (editar, excluir)

### scales/new/page.tsx

- `<ScaleForm mode="create" />`

### scales/[scaleId]/edit/page.tsx

- `<ScaleForm mode="edit" scaleId={params.scaleId} />`

---

## Validações de Negócio

### 1. Duplicata de Escala

```
Uma escala é única pela combinação: churchId + serviceId + ministryId
Não permitir criar outra escala se já existir para mesmo service + ministry
```

### 2. Filtragem de Membros

```
Ao selecionar ministryId, buscar apenas membros associados a esse ministério
(MemberMinistry onde ministryId = selectedMinistryId)
```

### 3. Filtragem de Roles

```
Ao selecionar membro, mostrar apenas MinistryRole onde ministryId = selectedMinistryId
```

### 4. Status da Escala

```
"draft" = rascunho (não visível aos membros)
"published" = publicada (visível aos membros)
```

---

## Permissões

Já existem no enum `Permission`:

```typescript
export enum Permission {
  // ...
  SCHEDULE_READ = "schedule:read",
  SCHEDULE_WRITE = "schedule:write",
  SCHEDULE_DELETE = "schedule:delete",
  // ...
}
```

**Não é necessário adicionar novas permissões** - usar as existentes para Scales.

---

## Checklist de Implementação

### Fase 1: Domínio
- [ ] Criar `src/domain/entities/Scale.ts`
- [ ] Criar `src/domain/entities/ScaleMember.ts`
- [ ] Criar `src/domain/ports/IScaleRepository.ts`
- [ ] Criar `src/domain/ports/IScaleMemberRepository.ts`

### Fase 2: Infraestrutura
- [ ] Criar `src/infra/firebase-admin/mappers/scaleMapper.ts`
- [ ] Criar `src/infra/firebase-admin/mappers/scaleMemberMapper.ts`
- [ ] Criar `src/infra/firebase-admin/repositories/ScaleFirebaseRepository.ts`
- [ ] Criar `src/infra/firebase-admin/repositories/ScaleMemberFirebaseRepository.ts`

### Fase 3: Aplicação
- [ ] Criar `src/application/dtos/scale/ScaleDTO.ts`
- [ ] Criar `src/application/errors/ScaleErrors.ts`
- [ ] Criar `src/application/use-cases/scale/CreateScale.ts`
- [ ] Criar `src/application/use-cases/scale/GetScale.ts`
- [ ] Criar `src/application/use-cases/scale/UpdateScale.ts`
- [ ] Criar `src/application/use-cases/scale/DeleteScale.ts`
- [ ] Criar `src/application/use-cases/scale/ListScales.ts`
- [ ] Criar `src/application/use-cases/scale/AddMemberToScale.ts`
- [ ] Criar `src/application/use-cases/scale/RemoveMemberFromScale.ts`

### Fase 4: DI
- [ ] Criar `src/infra/di/scale/container.ts`
- [ ] Atualizar `src/infra/di/index.ts`

### Fase 5: API
- [ ] Criar `src/app/api/scales/route.ts`
- [ ] Criar `src/app/api/scales/[scaleId]/route.ts`

### Fase 6: Features (Client)
- [ ] Criar `src/features/scales/hooks/useScales.ts`
- [ ] Criar `src/features/scales/hooks/useScaleForm.ts`
- [ ] Criar `src/features/scales/components/ScaleList.tsx`
- [ ] Criar `src/features/scales/components/ScaleForm.tsx`
- [ ] Criar `src/features/scales/components/ScaleMemberList.tsx`
- [ ] Criar `src/features/scales/components/ScaleFilter.tsx`

### Fase 7: Páginas
- [ ] Criar `src/app/(pages)/scales/page.tsx`
- [ ] Criar `src/app/(pages)/scales/new/page.tsx`
- [ ] Criar `src/app/(pages)/scales/[scaleId]/edit/page.tsx`

### Fase 8: Validação
- [ ] `pnpm build` passa
- [ ] `pnpm lint` passa
- [ ] `pnpm format` passa
- [ ] Testado manualmente

---

## Dependências Externas a Consultar

Ao implementar, será necessário usar repositórios existentes:

- `IServiceRepository` - para buscar Services
- `IMinistryRepository` - para buscar Ministries
- `IMinistryRoleRepository` - para buscar MinistryRoles
- `IMemberRepository` ou `IMemberMinistryRepository` - para buscar membros do ministério

Verificar em `src/domain/ports/` e `src/infra/di/` para interfaces e containers existentes.
