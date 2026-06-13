# Plano: Formulario Completo de Membro no Self-Signup

## Resumo

Este plano estende o fluxo atual de `self-signup`, sem criar um novo fluxo.
O fluxo existente em `src/app/self-signup/[churchId]` continua responsavel por
confirmar telefone, coletar dados, aceitar termos, autenticar via Google e
finalizar em `POST /api/public/churches/[churchId]/self-signups`.

A mudanca adiciona o formulario do PDF como um wizard de 5 etapas, com rascunho
local, enums de dominio para valores fechados e persistencia dos dados
complementares no documento `members/{memberId}`.

## Organizacao e Arquitetura

Cada enum, DTO, estrutura de dominio e componente deve ter uma responsabilidade
própria. Não usar arquivos agrupados genéricos para vários conceitos.

Enums ficam em arquivos separados em `src/domain/enums/`:

- `MaritalStatus.ts`
- `AcceptedJesusStatus.ts`
- `WaterBaptismStatus.ts`
- `DiscipleshipStatus.ts`
- `ChurchAttendanceTime.ts`
- `SmallGroupStatus.ts`
- `OfficialMemberStatus.ts`
- `ServiceAvailabilitySlot.ts`
- `PracticalSkill.ts`
- `MutiraoAvailability.ts`

Estruturas complementares de membro ficam em arquivos proprios:

- `MemberSpiritualJourney.ts`
- `MemberServiceProfile.ts`
- `MemberProfessionalProfile.ts`

Labels traduzidos ficam na feature de self-signup, separados do dominio. O
Firestore persiste valores estaveis em ingles; a UI traduz os valores.

## Mudancas de Dominio e DTOs

`Member` passa a aceitar dados opcionais/nulos de formulario:

- `birthDate`
- `maritalStatus`
- `hasChildren`
- `childrenCount`
- `childrenAges`
- `neighborhood`
- `spiritualJourney`
- `serviceProfile`
- `professionalProfile`
- `healthLimitations`
- `leadershipNotes`

DTOs ficam divididos por etapa:

- `SelfSignupBasicDataDTO.ts`
- `SelfSignupSpiritualJourneyDTO.ts`
- `SelfSignupServiceProfileDTO.ts`
- `SelfSignupProfessionalProfileDTO.ts`
- `SelfSignupFinalNotesDTO.ts`
- `SelfSignupMemberFormDTO.ts`

`SelfSignupMemberFormDTO.ts` apenas compoe os schemas menores. Validacoes
condicionais ficam no DTO da própria etapa.

## UI e Fluxo

Fluxo esperado:

1. Confirmacao por telefone.
2. Etapa 1 de 5: Dados Básicos.
3. Etapa 2 de 5: Vida Espiritual.
4. Etapa 3 de 5: Ministérios e Servir.
5. Etapa 4 de 5: Habilidades Profissionais e Práticas.
6. Etapa 5 de 5: Observações Finais e revisão.
7. Aceite legal e login Google.

O rascunho deve ser salvo apenas em `localStorage`, chaveado por `churchId`.
Não criar coleção Firestore para rascunho porque os dados são pessoais e ainda
não autenticados.

## API, Use Case e Firestore

Manter a rota publica atual:

```http
POST /api/public/churches/:churchId/self-signups
```

Payload atualizado:

```ts
{
  googleToken: string;
  fullName: string;
  phone: string;
  acceptedTerms: true;
  ministryIds: string[];
  confirmNoMinistry: boolean;
  memberForm: {
    basicData;
    spiritualJourney;
    serviceProfile;
    professionalProfile;
    finalNotes;
  };
}
```

Persistir em `members/{memberId}` os dados complementares e manter as colecoes
atuais para vinculos:

- `memberChurches`
- `memberMinistries`
- `legalConsents`

## Testes

Testes minimos:

- DTOs por secao validam regras condicionais.
- DTO composto rejeita payload incompleto.
- Finalizacao cria membro com dados completos.
- Finalizacao atualiza membro existente sem apagar vinculos.
- Mapper preserva datas e objetos aninhados.
- Rascunho local salva, restaura e limpa apos sucesso.
- Ministérios inválidos para a igreja seguem rejeitados.
