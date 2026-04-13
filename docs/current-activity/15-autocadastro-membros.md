# Atividade 15: Auto Cadastro de Membros

## 📋 User Story

**Como** pessoa interessada em participar da escala de uma igreja,
**quero** me auto cadastrar por um link publico com login Google,
**para** entrar no sistema de forma rapida e ja ficar vinculado a igreja correta.

---

## ✅ Critérios de Aceitação

- [ ] Criar uma tela publica de auto cadastro de membros (sem exigir autenticacao previa)
- [ ] A tela de auto cadastro deve receber a igreja de forma obrigatoria por **route param** (ex: `/signup/[churchId]`), nao por query param
- [ ] Se `churchId` for invalido, inexistente ou inativo, exibir estado de erro amigavel e impedir finalizacao
- [ ] Disponibilizar um ponto no sistema para gerar/copiar o link de auto cadastro da igreja e exibir o QRCode correspondente
- [ ] O formulario deve iniciar com o campo de telefone como primeira etapa
- [ ] Ao informar telefone valido, consultar se o membro ja existe globalmente (independente de igreja)
- [ ] Somente apos a etapa do telefone, exibir os demais campos do formulario (email opcional)
- [ ] Se o membro ja existir, preencher automaticamente os campos conhecidos para edicao/confirmacao
- [ ] O CTA final deve ter texto amigavel orientado a acao com Google (ex: "Continuar com Google para finalizar")
- [ ] Ao acionar o CTA, executar o fluxo normal de autenticacao Google
- [ ] Apos autenticar, se o membro nao existir, criar cadastro e vincular a igreja do link
- [ ] Apos autenticar, se o membro ja existir, atualizar dados informados e vincular a igreja caso ainda nao esteja vinculada
- [ ] Definir o `role` do usuario automaticamente conforme configuracao padrao de auto cadastro da igreja
- [ ] O campo de cargo padrao deve ser obrigatorio na configuracao da igreja para habilitar auto cadastro
- [ ] Garantir idempotencia de vinculacao (nao duplicar relacionamento usuario-igreja)
- [ ] Registrar e tratar mensagens de sucesso/erro para cada etapa critica (telefone, Google, vinculacao)

---

## 🧩 Definições Funcionais: Cargo Padrão da Igreja

- [ ] Criar o campo `defaultSelfSignupUserRoleId` (ou nome equivalente) na entidade Igreja referenciando `UserRole` (`src/domain/entities/UserRole.ts`)
- [ ] O campo deve ser usado **somente** para usuarios que entram via fluxo de auto cadastro publico
- [ ] O campo deve ser exibido no formulario de igreja (criacao e edicao) como selecao obrigatoria de um `UserRole`
- [ ] Valor padrao inicial recomendado: role de menor privilegio cadastrada como `UserRole` de sistema
- [ ] Para igrejas antigas sem valor salvo, aplicar fallback para o menor privilegio ate ocorrer atualizacao
- [ ] Ao concluir auto cadastro, o role efetivo do usuario na igreja deve vir desse `UserRole` configurado (nao do payload do cliente)
- [ ] O backend deve ignorar qualquer tentativa do frontend de enviar role manual no auto cadastro
- [ ] Alterar o campo na igreja deve afetar apenas proximos auto cadastros (nao reprocessar usuarios ja vinculados)
- [ ] Validar integridade: o `defaultSelfSignupUserRoleId` deve existir e estar ativo no momento da vinculacao

---

## 🎯 Definição de Pronto (DoD)

- [ ] Adicionar novo campo em Igreja: `defaultSelfSignupRole` (ou nome equivalente no padrao do projeto)
- [ ] Permitir editar esse campo no formulario de igreja
- [ ] Persistir esse campo no dominio, DTOs, repositorios e API de igreja
- [ ] Criar pagina publica de auto cadastro com rota usando `churchId` em path
- [ ] Implementar endpoint/acao para busca de membro por telefone em escopo global
- [ ] Implementar fluxo de formulario em duas etapas (telefone -> dados adicionais)
- [ ] Integrar finalizacao com login Google existente
- [ ] Implementar caso de uso de "criar ou atualizar membro e vincular igreja"
- [ ] Aplicar atribuicao automatica de role com base no campo padrao da igreja
- [ ] Criar funcionalidade de gerar QRCode do link de auto cadastro por igreja
- [ ] Garantir validacoes de seguranca e multitenancy sem expor dados sensiveis
- [ ] Cobrir cenarios principais em testes (novo membro, membro existente, igreja invalida)
- [ ] Codigo implementado
- [ ] Testado manualmente
- [ ] Sem erros no console
- [ ] Build passando
- [ ] Lint passando
