# AGENTS.md - Ministry Management

## Atividade Atual

Implementar gestão de ministérios com funções internas (MinistryRole).

---

## Estrutura Simplificada (Abordagem Escolhida)

### Filosofia
- Ministry e MinistryRole são gerenciados juntos
- `CreateMinistry` cria ministry + roles juntos
- `UpdateMinistry` atualiza ministry + gerencia array completo de roles (create/update/delete)
- Não existem use cases separados para MinistryRole

---

## 1. Entidades (JÁ IMPLEMENTADAS)

### Ministry.ts
- churchId, name, minMembersPerService, idealMembersPerService, notes
- Campo `leaderId` REMOVIDO

### MinistryRole.ts
- churchId, ministryId, name

### MemberMinistryRole.ts
- churchId, memberId, ministryId, ministryRoleId
- Para uso futuro (vínculo de membros)

---

## 2. Ports (JÁ IMPLEMENTADOS)

### IMinistryRepository.ts
```typescript
interface IMinistryRepository extends BaseRepository<Ministry> {
  findByChurchId(churchId: string): Promise<Ministry[]>;
}
```

### IMinistryRoleRepository.ts
```typescript
interface IMinistryRoleRepository extends BaseRepository<MinistryRole> {
  findByMinistryId(ministryId: string): Promise<MinistryRole[]>;
  findByChurchId(churchId: string): Promise<MinistryRole[]>;
}
```

---

## 3. Use Cases (JÁ IMPLEMENTADOS)

### src/application/use-cases/ministry/

| Arquivo | Input | Output | Descrição |
|---------|-------|--------|-----------|
| `CreateMinistry.ts` | churchId + dados + roles[] + userId | MinistryDetailDTO | Cria ministry + roles juntos |
| `ListMinistries.ts` | churchId | MinistryListItemDTO[] | Lista ministries com roles |
| `GetMinistry.ts` | ministryId | MinistryDetailDTO | Detalhe completo |
| `UpdateMinistry.ts` | ministryId + dados + roles[] + userId | MinistryDetailDTO | Update ministry + gerencia roles |
| `DeleteMinistry.ts` | ministryId | void | Soft delete + cascade roles |

### UpdateMinistry - Lógica de Roles

```typescript
// Input para roles
interface UpdateMinistryRoleInput {
  id: string | null;  // null = criar novo
  name: string;
}

// No execute:
1. Buscar roles existentes do ministry
2. Para cada role do input:
   - Se id = null → criar novo
   - Se id existe → verificar se nome mudou, atualizar se mudou
3. Roles que estavam no banco mas não estão no input → soft delete
```

---

## 4. DTOs (JÁ IMPLEMENTADOS)

### src/application/dtos/ministry/MinistryDTO.ts

```typescript
// Formulário
MinistryFormSchema = {
  name: z.string().min(1).max(100),
  minMembersPerService: z.coerce.number().int().min(0).default(1),
  idealMembersPerService: z.coerce.number().int().min(0).default(2),
  notes: z.string().max(500).optional(),
  roles: z.array(MinistryRoleFormSchema).default([]),
}

// ListItem (simplificado para evitar N+1)
MinistryListItemSchema = {
  id: z.string(),
  name: z.string(),
  roles: [{ id, name }],
}

// Detalhe (completo)
MinistryDetailSchema = MinistryListItemSchema.extend({
  minMembersPerService, idealMembersPerService, notes, createdAt
})
```

---

## 5. Errors (JÁ IMPLEMENTADOS)

### src/application/errors/MinistryErrors.ts
- MINISTRY_NOT_FOUND
- MINISTRY_ROLE_NOT_FOUND
- MINISTRY_CREATION_FAILED
- MINISTRY_UPDATE_FAILED
- MINISTRY_DELETION_FAILED
- MINISTRY_ROLE_CREATION_FAILED
- MINISTRY_ROLE_UPDATE_FAILED
- MINISTRY_ROLE_DELETION_FAILED

---

## 6. Firebase Repositories (JÁ IMPLEMENTADOS)

- `MinistryFirebaseRepository.ts` - coleção `ministries`
- `MinistryRoleFirebaseRepository.ts` - coleção `ministryRoles`
- `MemberMinistryFirebaseRepository.ts` - coleção `memberMinistries`
- `MemberMinistryRoleFirebaseRepository.ts` - coleção `memberMinistryRoles`

---

## 7. DI Container (JÁ IMPLEMENTADO)

### src/infra/di/ministry/container.ts

Repositórios:
- `ministryRepository`
- `ministryRoleRepository`
- `memberMinistryRepository`
- `memberMinistryRoleRepository`

Use Cases:
- `createMinistry`
- `listMinistries`
- `getMinistry`
- `updateMinistry`
- `deleteMinistry`

---

## 8. Próximos Passos (A IMPLEMENTAR)

### 8.1 API Routes (src/app/api/)
- `GET /api/ministries?churchId=X` - Listar
- `POST /api/ministries` - Criar
- `GET /api/ministries/[id]` - Detalhe
- `PUT /api/ministries/[id]` - Atualizar
- `DELETE /api/ministries/[id]` - Excluir

### 8.2 Feature Hooks (src/features/ministries/hooks/)
- `useMinistries.ts` - listar, criar, deletar
- `useMinistryForm.ts` - formulário com roles

### 8.3 UI Components
- Página de listagem
- Página de detalhe/criação
- Componentes de roles

### 8.4 MemberMinistryRole (uso futuro)
- Vínculo de membros com ministries e roles
- Use cases: LinkMemberToMinistry, UpdateMemberRoles, UnlinkMember

---

## 9. Regras Importantes

- ✅ Ministry e MinistryRole gerenciados juntos
- ✅ UpdateMinistry recebe array completo de roles
- ✅ Soft delete em cascade (ministry deleta → roles deletadas)
- ✅ Filtrar por churchId sempre (multi-tenant)
- ✅ Usar Result<T> pattern
- ✅ Não commitar sem permissão
