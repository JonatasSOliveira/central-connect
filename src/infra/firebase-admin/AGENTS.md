# AGENTS.md - Firebase Admin Repositories

Regras para criação de repositories Firebase Admin (server-side).

## Estrutura

```
src/infra/firebase-admin/
├── firebaseConfig.ts           # Configuração do Firebase Admin
├── repositories/
│   ├── BaseFirebaseRepository.ts  # Classe abstrata com métodos comuns
│   └── [Entity]FirebaseRepository.ts  # Implementação por entidade
```

## Regras de Implementação

### BaseFirebaseRepository
- Toda entidade deve ter seu repository em `repositories/`
- Usar classe abstrata base para métodos comuns (findById, findAll, create, update, delete)
- Converter Date para Timestamp ao salvar no Firestore
- Converter Timestamp para Date ao ler do Firestore
- Usar ID do documento Firestore como ID da entidade

### Implementação de Repository
- Implementar a interface de port correspondente (IUserRepository, etc)
- Implementar métodos abstratos: `toEntity` e `toFirestoreData`
- Criar métodos específicos da entidade quando necessário (findByEmail, etc)

### Serialização
- Todos os campos do tipo Date devem ser convertidos para Timestamp
- Todos os campos do tipo Timestamp devem ser convertidos para Date
- Usar métodos auxiliares `convertToTimestamp` e `convertFromTimestamp`
