# Atividade 11: Gerenciamento de Escalas

## 📋 User Story

**Como** usuário administrador ou líder de ministério,
**quero** criar e gerenciar escalas ministeriais para cada culto,
**para** organizar a participação dos membros nos cultos da igreja.

---

## ✅ Critérios de Aceitação

- [ ] Tela de listagem de escalas com filtros por culto e/ou ministério
- [ ] Tela de criação de nova escala
- [ ] Cada escala obrigatoriamente associada a um culto (Service)
- [ ] Cada escala obrigatoriamente associada a um ministério (Ministry)
- [ ] Não permitir criar mais de uma escala para o mesmo culto + ministério (validação de duplicata)
- [ ] Ao criar escala, permitir selecionar membros que estão asociados ao ministério escolhido
- [ ] Ao adicionar membro à escala, permitir selecionar apenas as funções (MinistryRole) daquele ministério
- [ ] Permitir adicionar múltiplos membros à mesma escala
- [ ] Permitir remover membros de uma escala
- [ ] Permitir editar uma escala existente
- [ ] Permitir excluir uma escala existente
- [ ] Escala possui status "draft" (rascunho) ou "published" (publicada)
- [ ] Permissões: SCALE_READ, SCALE_WRITE, SCALE_DELETE

---

## 🎯 Definição de Pronto (DoD)

- [ ] Entidade Scale criada com campos: churchId, serviceId, ministryId, status, notes
- [ ] Entidade ScaleMember criada com campos: scaleId, memberId, ministryRoleId, notes
- [ ] Repositories implementados para Scale e ScaleMember
- [ ] DTOs de validação criados (CreateScale, AddMemberToScale, ListScales)
- [ ] Use Cases implementados (Create, List, Update, Delete Scale; Add, Remove Member)
- [ ] APIs REST criadas (/scales, /scales/[id], /scales/[id]/members)
- [ ] Permissões adicionadas ao enum
- [ ] Hooks de feature implementados (useScales, useScaleForm)
- [ ] Componentes UI implementados
- [ ] Páginas criadas (/scales, /scales/new, /scales/[id]/edit)
- [ ] Código implementado
- [ ] Testado manualmente
- [ ] Sem erros no console
- [ ] Build passando
- [ ] Lint passando
