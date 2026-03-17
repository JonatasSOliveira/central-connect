# AGENTS.md - Instruções para Agentes de Código

## 1. Visão Geral do Projeto

**Central Connect** é um sistema de gestão de escalas para igrejas. Permite criar, gerenciar e publicar escalas de membros para diferentes funções liturgical/missas.

O sistema é um Progressive Web App (PWA) instalado no celular dos usuários, com autenticação via Google e armazenamento em Firebase (Firestore).

## 2. Stack e Versões

| Dependência | Versão |
|-------------|--------|
| Next.js | 16.1.6 |
| React | 19.2.3 |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| Biome | 2.4.7 |
| Firebase Admin | 13.7.0 |
| Firebase SDK | 12.10.0 |
| Zod | 4.3.6 |
| pnpm | 10.x |

## 2.1 Design System

### Princípios
- **Mobile-first**: O projeto é desenvolvido para mobile primeiro, depois adaptado para desktop
- **PWA**: Progressive Web App instalado no celular dos usuários

### Fontes
O projeto utiliza duas fontes do Google Fonts:

| Fonte | Uso |
|-------|-----|
| **Inter** | Corpo do texto, labels, botões (padrão) |
| **DM Sans** | Títulos e headings |

**Aplicação no código:**
- `font-sans` (Tailwind) → Inter (padrão)
- `font-heading` → DM Sans para títulos

**Exemplo de uso:**
```tsx
// Títulos com DM Sans
<h1 className="font-heading text-3xl">Título</h1>

// Corpo com Inter (padrão)
<p className="text-sm">Corpo do texto</p>
```

## 3. Arquitetura e Regras de Dependência

### Estrutura de Pastas

```
src/
├── domain/              # Entidades, ports e erros (núcleo do negócio)
│   ├── entities/        # User, Schedule, ChurchFunction, ScheduleMember
│   ├── ports/           # Interfaces para repositories
│   └── errors/          # Erros específicos do domínio
│
├── application/         # Casos de uso e regras de negócio
│   ├── use-cases/       # Um arquivo por caso de uso
│   ├── dtos/           # Input/Output tipados com Zod
│   └── services/       # Orquestração entre use cases
│
├── infra/              # Implementações externas
│   ├── firebase/       # Repositories Firebase
│   │   └── repositories/
│   └── http/           # Cliente HTTP (se necessário)
│
├── app/                # Next.js App Router
│   ├── api/            # Route Handlers (server-side)
│   └── (pages)/        # Páginas e layouts
│
├── components/         # Componentes React
│   ├── ui/             # Componentes base (shadcn-like)
│   └── modules/        # Componentes compostos por feature
│
├── hooks/              # Hooks que consomem APIs internas
│
└── shared/            # Utilitários compartilhados
    ├── utils/
    ├── constants/
    └── types/
```

### Regras de Dependência (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                        UI/Layers                            │
│   components → hooks → app/api → infra → application → domain│
└─────────────────────────────────────────────────────────────┘

- domain        → Não importa nada externo
- application   → Importa apenas domain
- infra        → Importa application e domain
- hooks        → Importa apenas tipos de domain/dtos (nunca infra diretamente)
- components   → Importa apenas hooks e tipos (nunca infra diretamente)
```

**Regra de Ouro**: Componentes React **nunca** podem importar diretamente de `@/infra/*`. Todas as comunicações com o backend devem passar pelos hooks.

## 4. Padrões de Código Obrigatórios

### Nomenclatura

- **Arquivos**: PascalCase (`UserRepository.ts`, `GetUserById.ts`)
- **Componentes React**: PascalCase (`Button.tsx`, `UserForm.tsx`)
- **Funções**: Prefixo `get`, `create`, `update`, `delete` (`getUserById`, `createSchedule`)
- **Variáveis**: camelCase

### Componentes React

- **Sempre** usar named exports
- Tipar props com interface ou type
- Usar `"use client"` apenas quando necessário (interações com browser)

```tsx
// ✅ Correto
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ Errado
export default function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}
```

### API REST

- **URLs**: kebab-case (`/api/users`, `/api/church-functions`, `/api/schedules`)
- **Métodos**: GET (listar), POST (criar), PUT/PATCH (atualizar), DELETE (remover)
- **Respostas**: JSON padronizado

### TypeScript

- **Sempre** tipar retorno de funções
- Usar Zod para validação de DTOs
- Evitar `any`

### Git Commits

**NUNCA fazer commits automaticamente**. Apenas fazer commit quando o usuário solicitar explicitamente.

Usar Conventional Commits:

```
feat: add user authentication with Google
fix: resolve schedule date timezone issue
docs: update API endpoints documentation
refactor: extract schedule validation to domain service
test: add unit tests for CreateSchedule use case
```

### Página de Componentes

Sempre que um novo componente shadcn for adicionado ou atualizado, a página `/components` deve refletir essas mudanças.

A página está em `src/app/components/page.tsx` e usa um array de configuração para renderizar os componentes automaticamente. Para adicionar um novo componente:

1. Adicionar o componente via shadcn: `pnpm dlx shadcn@latest add <componente>`
2. Atualizar o arquivo `src/app/components/page.tsx`:
   - Importar o componente
   - Adicionar uma nova entrada no array `components` com a função `render()` que exibe as variações

Exemplo de nova entrada:

```typescript
{
  name: "Input",
  description: "Campo de entrada de texto",
  render: () => (
    <div className="space-y-2">
      <Input placeholder="Default" />
      <Input placeholder="Disabled" disabled />
    </div>
  ),
},
```

Para verificar se está funcionando, execute `pnpm build` e acesso `http://localhost:3000/components`.

## 5. Como Adicionar uma Nova Feature

### Passo a Passo

1. **Definir a entidade no domínio**
   - Criar/entidade em `src/domain/entities/`
   - Definir tipos e validações básicas

2. **Criar o port (interface)**
   - Criar interface em `src/domain/ports/`
   - Ex: `IUserRepository.ts`

3. **Implementar o repository**
   - Criar implementação em `src/infra/firebase/repositories/`
   - Implementar métodos definidos no port

4. **Criar o DTO com Zod**
   - Criar em `src/application/dtos/`
   - Definir schemas de validação

5. **Criar o use case**
   - Criar em `src/application/use-cases/`
   - Implementar lógica de negócio
   - Não importar nada de infra diretamente (usar injeção de dependência)

6. **Criar a API (Route Handler)**
   - Criar arquivo em `src/app/api/[recurso]/route.ts`
   - Mapear HTTP method para use case

7. **Criar o hook**
   - Criar em `src/hooks/`
   - Consumir API interna via `fetch`
   - Tipar retorno corretamente

8. **Criar componentes**
   - Adicionar em `src/components/modules/`
   - Usar hooks criados
   - Não importar de infra!

9. **Testar**
   - Verificar build: `pnpm build`
   - Verificar lint: `pnpm lint`
   - Verificar format: `pnpm format`

### Exemplo de Fluxo Completo

```typescript
// 1. domain/entities/User.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'leader' | 'member';
  churchId: string;
}

// 2. domain/ports/IUserRepository.ts
export interface IUserRepository {
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
}

// 3. application/dtos/CreateUserDTO.ts
import { z } from 'zod';
export const CreateUserDTO = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'leader', 'member']),
});

// 4. application/use-cases/CreateUser.ts
import { IUserRepository } from '@/domain/ports/IUserRepository';
import { CreateUserDTO } from '../dtos/CreateUserDTO';

export class CreateUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: z.infer<typeof CreateUserDTO>) {
    const data = CreateUserDTO.parse(input);
    const user = await this.userRepository.create(data);
    return user;
  }
}

// 5. app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infra/container';

export async function POST(request: NextRequest) {
  const useCase = container.createUser();
  const body = await request.json();
  const user = await useCase.execute(body);
  return NextResponse.json(user, { status: 201 });
}

// 6. hooks/useUsers.ts
'use client';
import { useState, useCallback } from 'react';
import type { User } from '@/domain/entities/User';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const createUser = useCallback(async (data: unknown) => {
    setLoading(true);
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const user = await response.json();
    setUsers((prev) => [...prev, user]);
    setLoading(false);
    return user;
  }, []);

  return { users, loading, createUser };
}

// 7. components/modules/UserForm.tsx
'use client';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/Button';

export function UserForm() {
  const { createUser } = useUsers();

  const handleSubmit = async () => {
    await createUser({ name: 'John', email: 'john@example.com', role: 'member' });
  };

  return <Button onClick={handleSubmit}>Create User</Button>;
}
```

## 6. O Que Nunca Fazer

### Proibidos

- ❌ Importar repositories, Firebase ou qualquer coisa de `@/infra/*` em componentes ou hooks
- ❌ Usar Firebase SDK diretamente em componentes React
- ❌ Criar queries Firestore diretamente nos hooks
- ❌ Ignorar o lint/format (`pnpm lint` e `pnpm format` devem passar)
- ❌ Commitar secrets no repositório (usar `.env.local` e nunca commitar)
- ❌ Criar arquivos grandes (>200 linhas, fragmentar em funções menores)
- ❌ Misturar responsabilidades (um arquivo = uma responsabilidade)
- ❌ Usar `any` em TypeScript
- ❌ Criar APIs que expõem dados de outras igrejas (verificar `churchId` sempre)

### Atenção Especial

- ⚠️ **Multi-tenant**: Toda query deve filtrar por `churchId` do usuário logado
- ⚠️ **Auth**: Nunca expor endpoints sem verificação de autenticação
- ⚠️ **IDs**: Usar IDs do Firebase (UUID), não sequenciais

## 7. Contexto de Negócio

### O Sistema

Central Connect é um sistema de **gestão de escalas ministeriais** para igrejas.

### Funcionalidades Principais

1. **Gestão de Membros**
   - Cadastro de membros com funções específicas
   - Cada membro pode ter uma ou mais funções na igreja

2. **Funções da Igreja (ChurchFunction)**
   - Ex: Música, Som, Projeção, Segurança, Porta, Cantora, Leitor, Preschool, etc.
   - Cada função tem um número mínimo de pessoas necessárias (`requiredCount`)

3. **Escalas (Schedule)**
   - Criar escalas para datas específicas (missas/eventos)
   - Status: `draft` (rascunho) ou `published` (publicada)
   - Apenas escalas publicadas são visíveis aos membros

4. **Membros da Escala (ScheduleMember)**
   - Associar membros às escalas
   - Cada membro tem uma função específica na escala
   - Sistema avisa se a função não atingiu o número mínimo

### Fluxo Typical

1. **Admin/Líder** cria uma escala para uma data
2. **Admin/Líder** atribui membros às funções
3. Sistema verifica se todas as funções têm o número mínimo
4. **Admin/Líder** publica a escala
5. **Membros** visualizam suas escalas no app

### Termos de Domínio

| Termo | Descrição |
|-------|------------|
| ChurchFunction | Função na igreja (ex: "Música", "Som") |
| Schedule | Uma escala para um evento específico |
| ScheduleMember | Um membro atribuído a uma função em uma escala |
| Draft | Escala em rascunho (não visível aos membros) |
| Published | Escala publicada (visível aos membros) |

---

## Referência Rápida

```bash
# Comandos principais
pnpm dev          # Iniciar desenvolvimento
pnpm build        # Build de produção
pnpm lint         # Verificar código
pnpm format       # Formatar código
```

```typescript
// Importações típicas
import { User } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/ports/IUserRepository';
import { CreateUserDTO } from '@/application/dtos/CreateUserDTO';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/Button';
```
