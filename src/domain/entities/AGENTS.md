# AGENTS.md - Entidades de Domínio

Regras para criação de entidades neste diretório.

## Estrutura de Herança

```
BaseEntity
├── AuditableEntity
│   └── Entidades com churchId (multi-tenant)
└── Entidades sem churchId (globais)
```

## Regras de Implementação

### BaseEntity
- Gera `id` automaticamente com `crypto.randomUUID()` se não fornecido
- Gera `createdAt`, `updatedAt` automaticamente com `new Date()` se não fornecidos
- `deletedAt` padrão: `null`
- Campo `isDeleted` como getter

### AuditableEntity
- Estende BaseEntity
- Adiciona: `createdByUserId`, `updatedByUserId`, `deletedByUserId`

### Campos
- Todos `readonly` com getters públicos
- Params via interface com `?` para opcionais
- Construtor usa `?? null` ou `?? default` para opcionais

### Multi-tenant
- `churchId` obrigatório em todas as entidades AuditableEntity

### Types
- Exportar types separados das classes quando necessário
