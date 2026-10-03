# Geração automática de escalas

**Status:** decisão de produto aprovada para a primeira versão  
**Escopo:** um culto por vez  
**Última revisão:** 2026-10-02

Este documento descreve o comportamento esperado da geração automática de escalas. Ele é a referência funcional para produto, design, backend, frontend e testes.

## 1. Objetivo

Permitir que um usuário autorizado gere uma prévia de escala para um culto específico, escolhendo os ministérios envolvidos, com o mínimo de trabalho manual e sem violar as regras de disponibilidade, autorização, conflito e distribuição equilibrada.

O algoritmo deve ajudar o responsável pela escala, não substituir sua capacidade de revisar e ajustar a prévia antes de salvar ou publicar.

## 2. Escopo da primeira versão

Incluído:

- geração para um culto específico;
- seleção manual dos ministérios que participarão do culto;
- uma alocação global considerando todos os ministérios selecionados;
- prévia antes de persistir a escala;
- ajustes manuais antes de salvar;
- salvamento como rascunho;
- publicação após revisão;
- uma escala por ministério em cada culto;
- preservação das regras de igreja para escalas consecutivas;
- indicação clara de funções incompletas e ausência de candidatos.

Fora do escopo inicial:

- geração em lote para vários cultos;
- geração automática a partir de modelos de culto;
- substitutos automáticos;
- notificações aos membros;
- acesso de membros comuns às escalas publicadas;
- participantes fixos ou reservas permanentes;
- histórico avançado de versões e restauração;
- análise de sobreposição parcial baseada em duração;
- dashboards de pendências ou relatórios de cobertura.

Modelos de culto poderão futuramente criar cultos em lote, mas a geração de escalas continuará sendo uma etapa posterior e explícita.

## 3. Fluxo do usuário

1. O usuário abre os detalhes de um culto.
2. Seleciona os ministérios desejados.
3. Solicita a geração automática.
4. O sistema valida autorização, disponibilidade e conflitos e monta uma prévia.
5. A prévia mostra cada ministério, suas funções, quantidade ideal e pessoas selecionadas.
6. O usuário pode ajustar manualmente os membros.
7. O usuário salva como rascunho ou publica após revisar.
8. O sistema recalcula as validações no servidor no momento de salvar e publicar.

Salvar não deve fechar obrigatoriamente a tela de detalhes do culto. Depois de salvo, a escala deve continuar acessível no contexto do culto.

## 4. Candidatos elegíveis

Uma pessoa só pode ser candidata quando todas estas condições forem verdadeiras:

- está vinculada à igreja do culto;
- está vinculada ao ministério;
- está vinculada à função específica;
- sua disponibilidade inclui o dia da semana do culto;
- não existe conflito de horário bloqueante;
- ainda não foi escolhida em outra função ou ministério do mesmo culto.

A autorização é sempre derivada do vínculo do membro com a função. Pertencer apenas ao ministério não torna a pessoa elegível para todas as funções.

## 5. Disponibilidade e escalas consecutivas

A disponibilidade é uma lista de dias permitidos. Na criação de um membro, todos os dias começam selecionados. O algoritmo nunca deve escolher automaticamente alguém fora dessa lista.

A regra de escalas consecutivas é global por igreja e usa `maxConsecutiveScalesPerMember`. Ela é avaliada nas oportunidades em que o membro poderia servir, e não em todos os dias do calendário. Assim, se uma pessoa só está disponível aos domingos, duas participações em domingos consecutivos atingem o limite antes do terceiro domingo; um culto na quarta-feira não interrompe nem conta nessa sequência.

Um culto sem escala não representa participação e quebra a sequência. A sequência considera o histórico existente, inclusive registros antigos, sem tentar corrigir ou revalidar retroativamente esses registros.

O gerador não viola automaticamente o limite. Uma inclusão manual que ultrapasse a regra exige confirmação explícita e deve informar qual regra foi descumprida.

## 6. Conflitos e invariantes do culto

São bloqueios absolutos no gerador automático e na inclusão manual:

- uma pessoa em duas funções no mesmo culto;
- uma pessoa em dois ministérios no mesmo culto;
- uma pessoa em uma função para a qual não está autorizada;
- uma pessoa não vinculada ao ministério da função;
- mais de uma escala do mesmo ministério para o mesmo culto.

Para a primeira versão, dois cultos no mesmo dia com horários de início diferentes são permitidos. O conflito de horário bloqueante ocorre quando a pessoa já está escalada em outro culto com a mesma data e o mesmo horário de início. Uma inclusão manual nesse conflito exige confirmação; o gerador automático nunca deve fazê-la.

## 7. Cobertura e distribuição

A quantidade configurada para uma função é ideal, não bloqueante. Se não houver pessoas suficientes, a função permanece incompleta e a escala pode ser salva como rascunho. A publicação de uma escala incompleta exige uma confirmação explícita, com indicação das funções sem cobertura.

O algoritmo deve considerar todos os ministérios selecionados em uma única alocação. Isso é necessário porque uma pessoa pode ser elegível para funções em ministérios diferentes, mas só pode atuar em um ministério no culto.

Para reduzir escolhas ruins:

1. priorizar funções com menos candidatos disponíveis;
2. reservar pessoas raras para funções em que são mais necessárias;
3. quando uma pessoa puder atuar em mais de um ministério, atribuí-la ao papel com menos alternativas;
4. nunca usar o desempate para retirar uma pessoa de um ministério apenas por ser versátil quando ainda houver outra alternativa adequada;
5. respeitar os bloqueios antes de qualquer critério de equilíbrio.

A ordem visual de funções (`displayOrder`) serve apenas para prévia, telas e imagem compartilhada. O algoritmo pode processar funções por escassez.

## 8. Equilíbrio e desempate

Depois das restrições e da cobertura, o gerador deve favorecer quem está há mais tempo sem participar. A recomendação para a primeira versão é considerar os últimos 30 dias e o mês corrente como horizonte de histórico.

O nome não pode ser o critério principal. Se todas as métricas forem realmente iguais, usar aleatoriedade controlada para evitar favorecimento sistemático por ordem alfabética. A escolha aleatória deve permanecer estável durante aquela geração e só mudar em uma nova geração explícita.

## 9. Prévia, edição e regeneração

A prévia deve informar, no mínimo:

- ministério e função;
- quantidade ideal;
- membros selecionados;
- funções incompletas;
- motivos pelos quais pessoas não são candidatas quando isso for relevante;
- alertas de disponibilidade, limite ou conflito.

O usuário pode trocar membros manualmente antes de salvar, respeitando os bloqueios absolutos. A regeneração é uma nova proposta: pode substituir os ajustes manuais anteriores e não precisa preservá-los na primeira versão. A interface deve avisar isso antes de regenerar para evitar perda inesperada de trabalho.

Para uma escala existente do ministério:

- ao completar uma escala incompleta, preservar os membros atuais e preencher somente os espaços vazios;
- ao gerar novamente uma escala já preenchida, oferecer preservar ou substituir;
- substituir exige confirmação explícita e revalidação no servidor.

## 10. Inclusão manual e confirmações

O servidor é a fonte da verdade. A interface pode antecipar validações, mas não pode transformar um bloqueio em permissão nem confiar em dados alterados no HTML.

Inclusões manuais que ultrapassem disponibilidade, limite de consecutividade ou conflito de mesma data e horário devem abrir confirmação obrigatória com:

- pessoa e culto envolvidos;
- regra descumprida;
- consequência esperada;
- ação explícita de confirmar ou cancelar.

Os quatro bloqueios absolutos da seção 6 nunca podem ser liberados por esse modal.

## 11. Rascunho e publicação

Rascunho é o estado de trabalho e pode conter funções incompletas. Publicar torna a escala disponível para os usuários administrativos autorizados e habilita o compartilhamento previsto pelo sistema.

Na primeira versão, membros comuns não acessam escalas publicadas. A separação de permissões recomendada é:

| Capacidade | Permissão inicial |
| --- | --- |
| Gerar, editar e salvar escalas | `scale:write` |
| Publicar e despublicar | `scale:write` |
| Gerenciar cultos | permissão própria de cultos/serviços |
| Consultar dados necessários à geração | leitura de cultos, ministérios, funções e membros |

Não é necessário criar `scale:publish` na primeira versão. A permissão pode ser separada futuramente caso a operação exija delegar publicação de forma independente. A UI nunca deve exibir ações sem que a autorização correspondente esteja presente.

## 12. Mensagens esperadas

As mensagens devem ser humanas e acionáveis. Exemplos:

- “Nenhuma pessoa elegível encontrada para esta função.”
- “A função ficou com 1 de 2 pessoas ideais. Você pode salvar como rascunho.”
- “Esta escolha ultrapassa o limite de escalas consecutivas de Ana. Deseja confirmar mesmo assim?”
- “João já está escalado em outro culto no mesmo dia e horário.”
- “Regenerar substituirá os ajustes manuais desta prévia.”

Não usar cor como único indicador. Alertas devem combinar texto, ícone, hierarquia e estado acessível.

## 13. Critérios de aceite

- Nenhum membro é automaticamente colocado fora de sua disponibilidade.
- Nenhum membro é automaticamente colocado em dois ministérios ou funções do mesmo culto.
- Nenhum membro é automaticamente colocado em dois cultos com a mesma data e horário de início.
- Funções com poucos candidatos são analisadas antes das funções com muitas alternativas.
- Pessoas elegíveis para vários ministérios são alocadas globalmente, sem duplicidade.
- O limite de consecutividade considera as oportunidades compatíveis com a disponibilidade do membro.
- Empates completos não favorecem nomes em ordem alfabética.
- A prévia aparece antes de qualquer persistência.
- O servidor revalida toda operação de salvar e publicar.
- Escalas incompletas podem ser salvas como rascunho e só são publicadas após confirmação.
- Uma segunda escala do mesmo ministério no mesmo culto não é criada.

## 14. Evoluções futuras

Após validar esta versão, podem ser avaliados geração em lote, modelos de culto, substitutos, notificações, histórico de versões, regras de duração e acesso de membros. Cada evolução deve preservar os invariantes deste documento ou registrar uma nova decisão explícita.
