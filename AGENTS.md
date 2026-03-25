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

## 2.2 Padrões Visuais (UI/UX)

### Estilo: Flat Design

O projeto utiliza o padrão **Flat Design** para uma interface limpa, moderna e consistente.

### Princípios Visuais

| Princípio | Descrição |
|-----------|-----------|
| **Cores Sólidas** | Sem gradientes em elementos estruturais (header, cards) |
| **Bordas Sutiles** | Usar `border-primary/20` ou `border-border` |
| **Hierarquia Clara** | Sombras leves (`shadow-sm`) para elementos elevados |
| **shadcn/ui Compliant** | Seguir padrões do design system |

### Cores do Tema

| Variável | Uso |
|----------|-----|
| `--primary` | Header, botões principais, ícones de destaque |
| `--primary-foreground` | Texto sobre primary |
| `--card` | Fundo de cards |
| `--muted` | Fundos sutis, hover states |
| `--border` | Bordas de cards e elementos |
| `--background` | Fundo da página |

### Regras de Estilo por Componente

#### Header (PrivateHeader)
```tsx
className="bg-primary text-primary-foreground"
```
- ✅ Cor sólida primary
- ✅ Texto em primary-foreground
- ❌ Sem gradientes

#### CardAdmin (cards administrativos)
```tsx
className="bg-card border-primary/20 hover:border-primary/30"
```
- ✅ Fundo `bg-card` (sólido)
- ✅ Borda sutil `border-primary/20`
- ✅ Hover com borda mais visível
- ❌ Sem gradiente `from-primary/5`

#### CardItem (itens de lista)
```tsx
className="bg-card border-border hover:bg-muted/50"
```
- ✅ Fundo `bg-card` (sólido)
- ✅ Borda `border-border`
- ✅ Hover com fundo sutil

#### Ícones em Cards
```tsx
className="bg-primary/10 text-primary"
```
- ✅ Fundo colorido sutil `bg-primary/10`
- ✅ Ícone com cor primary

#### Footer
```tsx
className="bg-background border-t"
```
- ✅ Fundo `bg-background`
- ✅ Borda superior sutil

### Checklist de Implementação

```
✅ Header: bg-primary text-primary-foreground (sempre)
✅ Cards Admin: bg-card border-primary/20
✅ Cards Item: bg-card border-border
✅ Ícones: bg-primary/10 text-primary
✅ Footer: bg-background border-t
✅ Sem gradientes em elementos estruturais
```

### Exemplo de Estrutura Visual

```
┌─────────────────────────────┐
│ ████████████████████████████ │  ← Header: bg-primary
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │ ●  Título              → │ │  ← Card: bg-card, border-primary/20
│ │    Descrição             │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ●  Item                → │ │  ← Item: bg-card, border-border
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘
░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← Footer: bg-background, border-t
```

## 3. Arquitetura e Regras de Dependência

### Visão Geral da Arquitetura

O projeto segue uma arquitetura híbrida que combina:

1. **Zustand** → Estado global (auth, igreja selecionada, tema)
2. **Feature-based Hooks** → Lógica de tela desacoplada da UI
3. **Clean Architecture** → Domínio e regras de negócio isolados

```
┌─────────────────────────────────────────────────────────────────┐
│                           UI Layer                              │
│  app/(pages)/page.tsx → Componentes puros → Só renderizam      │
├─────────────────────────────────────────────────────────────────┤
│                       Hooks Layer (Features)                    │
│  features/[feature]/hooks/*.ts → Lógica de tela desacoplada    │
├─────────────────────────────────────────────────────────────────┤
│                      Zustand (Stores)                           │
│  stores/*.ts → Estado global (auth, church, tema)              │
├─────────────────────────────────────────────────────────────────┤
│                       API Layer                                 │
│  app/api/*/route.ts → Route Handlers                           │
├─────────────────────────────────────────────────────────────────┤
│                     Application Layer                           │
│  application/use-cases/*.ts → Casos de uso                     │
├─────────────────────────────────────────────────────────────────┤
│                       Infra Layer                               │
│  infra/firebase/repositories/*.ts → Implementações Firebase   │
├─────────────────────────────────────────────────────────────────┤
│                       Domain Layer                              │
│  domain/entities/*.ts → Entidades de negócio                    │
└─────────────────────────────────────────────────────────────────┘
```

### Estrutura de Pastas

```
src/
├── stores/                    # Zustand (estado global)
│   ├── authStore.ts          # user, churches, login/logout
│   └── ...
│
├── features/                  # Hooks organizados por feature
│   ├── auth/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts           # Hook de autenticação
│   │   │   └── useLoginScreen.ts    # Lógica da tela de login
│   │   └── types/
│   │
│   ├── home/
│   │   └── hooks/
│   │       └── useHomeScreen.ts
│   │
│   ├── schedules/
│   │   └── hooks/
│   │       ├── useSchedules.ts
│   │       └── useScheduleForm.ts
│   │
│   └── members/
│       └── hooks/
│           ├── useMembers.ts
│           └── useMemberForm.ts
│
├── domain/                    # Entidades, ports e erros
│   ├── entities/
│   ├── ports/
│   └── errors/
│
├── application/               # Casos de uso e regras de negócio
│   ├── use-cases/
│   ├── dtos/
│   └── services/
│
├── infra/                     # Implementações externas
│   ├── firebase-admin/        # Firebase Admin SDK (server-side)
│   │   ├── firebaseConfig.ts
│   │   ├── repositories/
│   │   └── services/
│   ├── firebase-client/       # Firebase Client SDK (client-side)
│   │   ├── firebaseConfig.ts
│   │   └── services/
│   └── jose/
│
├── app/                       # Next.js App Router
│   ├── api/
│   └── (pages)/
│
├── components/                # Componentes React
│   ├── ui/                    # Atoms (shadcn-like)
│   ├── modules/               # Molecules (componentes compostos)
│   └── templates/            # Templates (estruturas de página)
│
└── shared/
    ├── utils/
    ├── constants/
    └── types/
```

### Regras de Dependência

| Camada | Pode importar de |
|--------|------------------|
| `domain` | Nada (é o núcleo) |
| `application` | `domain` |
| `infra/firebase-admin` | `domain`, `application` (server-side apenas) |
| `infra/firebase-client` | `domain`, `application` (client-side apenas) |
| `stores` | `domain`, `application` |
| `features/*/hooks` | `domain`, `application`, `stores`, `infra/firebase-client` |
| `components` | `features/*/hooks`, `stores` |
| `app/(pages)/*` | `components`, `features/*/hooks` |

**Regras de Ouro**:
1. Componentes React **nunca** podem importar diretamente de `@/infra/*`
2. Todas as comunicações com backend passam pelos hooks
3. Hooks de tela ficam dentro de `features/[nome]/hooks/`
4. **Server-side** usa `infra/firebase-admin`
5. **Client-side** usa `infra/firebase-client`

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

### Atomic Design

O projeto segue o padrão **Atomic Design** para organização de componentes:

```
src/components/
├── ui/           # Atoms (elementos básicos)
│   ├── button.tsx
│   ├── card.tsx
│   ├── card-admin.tsx
│   ├── card-item.tsx
│   ├── empty-state.tsx
│   ├── form-field.tsx
│   ├── form-select.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── list-item-card.tsx
│   ├── number-stepper.tsx
│   └── ...
│
├── modules/      # Molecules (combinações simples)
│   ├── card-item.tsx
│   ├── private-header.tsx
│   └── private-footer.tsx
│
└── templates/    # Templates (estruturas de página)
    ├── form-template.tsx
    ├── list-template.tsx
    └── page-template.tsx
```

**Níveis de Atomic Design:**

| Nível | Descrição | Exemplos |
|-------|-----------|----------|
| **Atoms** | Elementos básicos e indivisíveis | Button, Input, Card |
| **Molecules** | Combinações simples de atoms | CardItem, EmptyState |
| **Templates** | Estruturas completas de página | ListTemplate, PageTemplate |

### Componentes de Formulário Mobile-First

Para garantir uma experiência mobile otimizada, o projeto possui componentes específicos para formulários:

#### NumberStepper
Input numérico com botões +/- para facilitar a interação em touch screens.

```tsx
<NumberStepper
  label="Quantidade"
  value={quantity}
  onChange={setQuantity}
  min={0}
  max={99}
/>
```

#### ListItemCard
Card para itens de lista com suporte a ações (remover, editar).

```tsx
<ListItemCard
  index={0}
  onRemove={handleRemove}
>
  <Input placeholder="Nome da função" />
</ListItemCard>
```

#### FormSelect
Select estilizado com ícone de seta customizado.

```tsx
<FormSelect
  label="Igreja"
  value={churchId}
  onChange={setChurchId}
  options={[
    { value: "1", label: "Igreja Central" },
    { value: "2", label: "Igreja Norte" }
  ]}
  placeholder="Selecione"
  required
/>
```

### Compound Components

Compound Components permitem criar APIs declarativas e flexíveis:

```tsx
// Uso do ListTemplate
<ListTemplate>
  <ListTemplate.Header title="Igrejas" subtitle="Gerencie..." />
  <ListTemplate.Action label="Nova" icon={Plus} onClick={handleAdd} />
  
  {items.length === 0 ? (
    <ListTemplate.EmptyState
      icon={Inbox}
      title="Nenhuma igreja"
      description="Cadastre sua primeira igreja"
    />
  ) : (
    <ListTemplate.List>
      {items.map(item => (
        <ListTemplate.Item
          key={item.id}
          icon={Building2}
          title={item.name}
          onClick={() => handleSelect(item.id)}
        />
      ))}
    </ListTemplate.List>
  )}
</ListTemplate>
```

**Implementação do Compound Component:**

```tsx
// templates/list-template.tsx
interface ListTemplateProps {
  children: React.ReactNode;
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return <header>...</header>;
}

function List({ children }: { children: React.ReactNode }) {
  return <div className="grid">{children}</div>;
}

export function ListTemplate({ children }: ListTemplateProps) {
  return <main>{children}</main>;
}

ListTemplate.Header = Header;
ListTemplate.List = List;
```

**Benefícios:**
- **DRY**: Template reutilizável para todas as listagens
- **Consistência**: Mesma estrutura visual em todas as páginas
- **Composição**: Cada parte é independente e testável
- **Flexibilidade**: Pode usar apenas as partes necessárias

### API REST

- **URLs**: kebab-case (`/api/users`, `/api/church-functions`, `/api/schedules`)
- **Métodos**: GET (listar), POST (criar), PUT/PATCH (atualizar), DELETE (remover)
- **Respostas**: JSON padronizado

### TypeScript

- **Sempre** tipar retorno de funções
- Usar Zod para validação de DTOs
- Evitar `any`

### Git Commits

**NUNCA criar branches automaticamente**. Apenas criar branch quando o usuário solicitar explicitamente.

**Estrutura de branches:**
- `master` - Branch principal, produção
- `develop` - Branch para atividades em revisão
- `<sufixo>/<id-atividade>-<descricao-curto>` - Branchs de atividades

**Exemplos de branchs:**
```
feat/3-autenticacao-google
fix/5-corrigir-login
refactor/10-reestruturar-repositories
```

**Formato de commit:**
Usar Conventional Commits com referência ao issue:

```
feat: add user authentication with Google

refs #3

---
fix: resolve schedule date timezone issue

refs #5

---
docs: update API endpoints documentation

refs #10
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
   - Criar entidade em `src/domain/entities/`
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

7. **Criar o store (se necessário)**
   - Criar em `src/stores/[feature]Store.ts` (Zustand)
   - Apenas para estado verdadeiramente global

8. **Criar o hook de feature**
   - Criar em `src/features/[feature]/hooks/`
   - Consumir API interna via `fetch`
   - Tipar retorno corretamente

9. **Criar componentes**
   - Adicionar em `src/components/modules/`
   - Usar hooks criados
   - Não importar de infra!

10. **Testar**
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

// 6. stores/userStore.ts (Zustand - para estado global)
import { create } from 'zustand';

interface UserState {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  fetchUsers: async () => {
    set({ loading: true });
    const res = await fetch('/api/users');
    const users = await res.json();
    set({ users, loading: false });
  },
}));

// 7. features/users/hooks/useUsers.ts (hook de tela)
'use client';
import { useUserStore } from '@/stores/userStore';

export function useUsers() {
  const { users, loading, fetchUsers } = useUserStore();

  const createUser = async (data: unknown) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const user = await res.json();
    useUserStore.setState((state) => ({
      users: [...state.users, user],
    }));
    return user;
  };

  return { users, loading, fetchUsers, createUser };
}

// 8. components/modules/UserForm.tsx
'use client';
import { useUsers } from '@/features/users/hooks/useUsers';
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
- ❌ **Commitar qualquer alteração sem o usuário solicitar explicitamente** - Sempre perguntar antes de commitar

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

### Firebase

O projeto usa duas bibliotecas Firebase:

| Biblioteca | Uso | Importar de |
|------------|-----|-------------|
| **Firebase Admin** | Server-side (APIs, repositories) | `@/infra/firebase-admin/*` |
| **Firebase SDK** | Client-side (auth, UI) | `@/infra/firebase-client/*` |

**Client-side auth (useLoginScreen):**
```typescript
import { signInWithGoogle } from "@/infra/firebase-client/services/googleAuth";

const firebaseUser = await signInWithGoogle();
const idToken = firebaseUser.idToken;
```

**Server-side auth (container.ts):**
```typescript
import { GoogleAuthFirebaseService } from "@/infra/firebase-admin/services/GoogleAuthFirebaseService";
```

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
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { signInWithGoogle } from '@/infra/firebase-client/services/googleAuth';
import { Button } from '@/components/ui/Button';
```
