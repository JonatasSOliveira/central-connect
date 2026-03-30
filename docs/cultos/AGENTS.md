# AGENTS.md - Atividade: Gerenciamento de Cultos

Este documento contém as especificações técnicas para implementação da funcionalidade de gerenciamento de cultos.

---

## 1. Visão Geral

Desenvolver o sistema de gerenciamento de cultos (Services) e templates de cultos (ServiceTemplates), permitindo:
- CRUD completo de cultos
- Sistema de automação semanal via templates
- Geração automática de cultos da semana

---

## 2. Entidades de Domínio

### 2.1 Service (Culto)

**Atualizar entidade existente**: `src/domain/entities/Service.ts`

Adicionar campos necessários:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | string | auto | UUID gerado automaticamente |
| churchId | string | sim | ID da igreja |
| serviceTemplateId | string | não | ID do template de origem (se criado via template) |
| title | string | **sim** | Título do culto (ex: "Missa Dominical") |
| date | Date | sim | Data do culto |
| time | string | sim | Horário de início (formato HH:mm) |
| dayOfWeek | DayOfWeek | sim | Dia da semana (derivado da data) |
| shift | string | não | "Manhã", "Tarde" ou "Noite" |
| location | string | não | Local do culto (ex: "Salão Principal") |
| description | string | não | Observações |
| createdAt | Date | auto | Data de criação |
| updatedAt | Date | auto | Data de atualização |

### 2.2 ServiceTemplate (Modelo de Culto)

**Atualizar entidade existente**: `src/domain/entities/ServiceTemplate.ts`

Adicionar campos necessários:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | string | auto | UUID |
| churchId | string | sim | ID da igreja |
| title | string | **sim** | Título base do culto |
| dayOfWeek | DayOfWeek | sim | Dia da semana |
| shift | string | sim | "Manhã", "Tarde" ou "Noite" |
| time | string | sim | Horário (formato HH:mm) |
| location | string | não | Local padrão do culto |
| isActive | boolean | sim | Se está ativo para geração |
| createdAt | Date | auto | Data de criação |
| updatedAt | Date | auto | Data de atualização |

---

## 3. Ports (Interfaces)

### 3.1 IServiceRepository

Criar: `src/domain/ports/IServiceRepository.ts`

```typescript
import type { Service } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IServiceRepository extends BaseRepository<Service> {
  findByChurchId(churchId: string): Promise<Service[]>;
  findByDateRange(churchId: string, startDate: Date, endDate: Date): Promise<Service[]>;
  findByDateAndLocation(churchId: string, date: Date, time: string, location: string | null): Promise<Service | null>;
}
```

### 3.2 IServiceTemplateRepository

Criar: `src/domain/ports/IServiceTemplateRepository.ts`

```typescript
import type { ServiceTemplate } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IServiceTemplateRepository extends BaseRepository<ServiceTemplate> {
  findActiveByChurchId(churchId: string): Promise<ServiceTemplate[]>;
}
```

---

## 4. Repositories (Firebase)

### 4.1 ServiceFirebaseRepository

Criar: `src/infra/firebase-admin/repositories/ServiceFirebaseRepository.ts`

- Implementar `IServiceRepository`
- Usar coleção: `services`
- Consultas filtradas por `churchId`

### 4.2 ServiceTemplateFirebaseRepository

Criar: `src/infra/firebase-admin/repositories/ServiceTemplateFirebaseRepository.ts`

- Implementar `IServiceTemplateRepository`
- Usar coleção: `service_templates`

---

## 5. DTOs (Validação com Zod)

### 5.1 Service DTOs

**Criar**: `src/application/dtos/service/CreateServiceDTO.ts`

```typescript
import { z } from "zod";

export const CreateServiceInputSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  date: z.string().transform((val) => new Date(val)),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)"),
  shift: z.enum(["Manhã", "Tarde", "Noite"]).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});
```

**Criar**: `src/application/dtos/service/UpdateServiceDTO.ts`

```typescript
import { z } from "zod";

export const UpdateServiceInputSchema = z.object({
  title: z.string().min(1).optional(),
  date: z.string().transform((val) => new Date(val)).optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  shift: z.enum(["Manhã", "Tarde", "Noite"]).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});
```

**Criar**: `src/application/dtos/service/ListServicesDTO.ts`

```typescript
import { z } from "zod";

export const ListServicesQuerySchema = z.object({
  churchId: z.string(),
  startDate: z.string().transform((val) => new Date(val)).optional(),
  endDate: z.string().transform((val) => new Date(val)).optional(),
});
```

### 5.2 ServiceTemplate DTOs

**Criar**: `src/application/dtos/serviceTemplate/CreateServiceTemplateDTO.ts`

```typescript
import { z } from "zod";

export const CreateServiceTemplateInputSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  dayOfWeek: z.enum(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
  shift: z.enum(["Manhã", "Tarde", "Noite"]),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)"),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
});
```

**Criar**: `src/application/dtos/serviceTemplate/UpdateServiceTemplateDTO.ts`

```typescript
import { z } from "zod";

export const UpdateServiceTemplateInputSchema = z.object({
  title: z.string().min(1).optional(),
  dayOfWeek: z.enum(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]).optional(),
  shift: z.enum(["Manhã", "Tarde", "Noite"]).optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
});
```

**Criar**: `src/application/dtos/serviceTemplate/GenerateWeekDTO.ts`

```typescript
import { z } from "zod";

export const GenerateWeekInputSchema = z.object({
  churchId: z.string(),
  weekStartDate: z.string().transform((val) => new Date(val)),
});
```

---

## 6. Use Cases

### 6.1 Service Use Cases

Criar em `src/application/use-cases/service/`:

- `CreateService.ts` - Criar culto
- `ListServices.ts` - Listar cultos com filtros
- `UpdateService.ts` - Editar culto
- `DeleteService.ts` - Excluir culto (soft delete)

### 6.2 ServiceTemplate Use Cases

Criar em `src/application/use-cases/serviceTemplate/`:

- `CreateServiceTemplate.ts` - Criar template
- `ListServiceTemplates.ts` - Listar templates
- `UpdateServiceTemplate.ts` - Editar template
- `DeleteServiceTemplate.ts` - Excluir template
- `GenerateWeekServices.ts` - Gerar cultos da semana

**Lógica do GenerateWeekServices:**

1. Buscar templates ativos da igreja
2. Para cada template:
   - Calcular datas da semana baseada na data inicial
   - Para cada dia da semana que corresponda ao template.dayOfWeek:
     - Verificar se já existe culto com mesma data, time e location
     - Se não existir, criar culto com título: "{title} - {dd/MM/yyyy}"
3. Retornar cultos criados

---

## 7. APIs REST

### 7.1 Services API

**Criar**: `src/app/api/services/route.ts`

- `GET /api/services?churchId=xxx&startDate=xxx&endDate=xxx` - Listar cultos
- `POST /api/services` - Criar culto

**Criar**: `src/app/api/services/[serviceId]/route.ts`

- `GET /api/services/[serviceId]` - Obter culto
- `PUT /api/services/[serviceId]` - Editar culto
- `DELETE /api/services/[serviceId]` - Excluir culto

### 7.2 ServiceTemplates API

**Criar**: `src/app/api/service-templates/route.ts`

- `GET /api/service-templates?churchId=xxx` - Listar templates
- `POST /api/service-templates` - Criar template

**Criar**: `src/app/api/service-templates/[templateId]/route.ts`

- `PUT /api/service-templates/[templateId]` - Editar template
- `DELETE /api/service-templates/[templateId]` - Excluir template

**Criar**: `src/app/api/service-templates/generate-week/route.ts`

- `POST /api/service-templates/generate-week` - Gerar cultos da semana

---

## 8. Permissões

**Criar/Atualizar**: `src/domain/enums/Permission.ts`

Adicionar:

```typescript
SERVICE_READ = "SERVICE_READ",
SERVICE_WRITE = "SERVICE_WRITE",
SERVICE_TEMPLATE_READ = "SERVICE_TEMPLATE_READ",
SERVICE_TEMPLATE_WRITE = "SERVICE_TEMPLATE_WRITE",
SERVICE_TEMPLATE_GENERATE = "SERVICE_TEMPLATE_GENERATE",
```

---

## 9. Feature Hooks

### 9.1 Services Hooks

Criar: `src/features/services/hooks/useServices.ts`

- listar cultos (com filtros de período)
- criar culto
- editar culto
- excluir culto

Criar: `src/features/services/hooks/useServiceForm.ts`

- validação de formulário
- formatação de data/hora
- derivar dayOfWeek da data

### 9.2 ServiceTemplates Hooks

Criar: `src/features/serviceTemplates/hooks/useServiceTemplates.ts`

- listar templates
- criar template
- editar template
- excluir template

Criar: `src/features/serviceTemplates/hooks/useGenerateWeek.ts`

- gerar cultos da semana
- feedback de sucesso/erro

---

## 10. Componentes UI

### 10.1 Cultos (Services)

Criar em `src/features/services/components/`:

- `ServiceList.tsx` - Lista de cultos com filtros
- `ServiceCard.tsx` - Card de visualização do culto
- `ServiceForm.tsx` - Formulário de criar/editar culto
- `ServiceFilters.tsx` - Filtros de período

### 10.2 Templates

Criar em `src/features/serviceTemplates/components/`:

- `ServiceTemplateList.tsx` - Lista de templates
- `ServiceTemplateCard.tsx` - Card de template
- `ServiceTemplateForm.tsx` - Formulário de template
- `GenerateWeekButton.tsx` - Botão para gerar cultos

---

## 11. Páginas

Criar:

- `src/app/(pages)/services/page.tsx` - Lista de cultos
- `src/app/(pages)/services/new/page.tsx` - Criar culto
- `src/app/(pages)/services/[serviceId]/page.tsx` - Detalhes do culto
- `src/app/(pages)/services/[serviceId]/edit/page.tsx` - Editar culto
- `src/app/(pages)/service-templates/page.tsx` - Gerenciar templates
- `src/app/(pages)/service-templates/new/page.tsx` - Criar template
- `src/app/(pages)/service-templates/[templateId]/edit/page.tsx` - Editar template

---

## 12. Regras de Negócio Importantes

### 12.1 Duplicatas

- Verificar antes de criar: mesma data, mesmo time E mesmo location
- Se location for null em ambos, também considera duplicado
- Allow múltiplos cultos no mesmo horário se locations forem diferentes

### 12.2 Geração de Cultos

- Pegar templates ativos (isActive = true)
- Para cada template, verificar cada dia da semana
- Criar culto apenas se não existir duplicata
- Título automático: "{title} - {dd/MM/yyyy}"

### 12.3 DayOfWeek

- Derivar automaticamente a partir da data
- Usar tipo existente: `DayOfWeek` (Sunday, Monday, etc.)

---

## 13. Padrões de Código

Seguir os mesmos padrões do projeto:

- Usar named exports
- Tipar todas as funções
- Usar Zod para validação de DTOs
- Components em `features/[feature]/components/`
- Hooks em `features/[feature]/hooks/`
- Não importar infra diretamente em componentes

---

## 14. Referências

- Entidade Service: `src/domain/entities/Service.ts`
- Entidade ServiceTemplate: `src/domain/entities/ServiceTemplate.ts`
- Exemplo de API: `src/app/api/members/route.ts`
- Exemplo de hook: `src/features/members/hooks/useMembers.ts`
- Container DI: `src/infra/di/member/container.ts`
- Enum Permissions: `src/domain/enums/Permission.ts`
