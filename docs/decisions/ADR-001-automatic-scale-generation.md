# ADR-001 — Geração automática de escalas

- **Status:** aceito
- **Data:** 2026-10-02
- **Escopo:** primeira versão da geração automática de escalas

## Contexto

O Central Connect precisa ajudar administradores e responsáveis por escalas a distribuir membros entre funções de um culto. A mesma pessoa pode estar habilitada para mais de um ministério, mas não pode atuar em dois ministérios no mesmo culto. Também existem disponibilidade por dia, limite de escalas consecutivas, conflitos de horário e quantidades ideais por função.

Uma abordagem ingênua — gerar cada ministério isoladamente ou ordenar nomes alfabeticamente — pode consumir candidatos raros, duplicar pessoas e produzir uma distribuição injusta. Também não é aceitável deixar regras importantes apenas no frontend.

## Decisão

Implementaremos a geração para um culto por vez, com seleção manual dos ministérios e uma alocação global. O algoritmo será orientado por restrições e por escassez:

1. validar igreja, permissões e vínculos;
2. eliminar candidatos fora da função, do ministério ou da disponibilidade;
3. bloquear duplicidade no culto e conflito de mesma data/horário;
4. processar primeiro funções com menos alternativas;
5. preservar candidatos versáteis para o papel em que são mais necessários;
6. respeitar o limite global de consecutividade relativo às oportunidades de disponibilidade;
7. equilibrar pela participação recente e pelo tempo desde a última participação;
8. usar aleatoriedade estável somente em empate completo.

A quantidade por função é ideal. A falta de candidatos não impede rascunho, mas deixa a função explicitamente incompleta e exige confirmação adicional para publicação.

## Invariantes

O servidor deve garantir que:

- uma pessoa não esteja em duas funções do mesmo culto;
- uma pessoa não esteja em dois ministérios do mesmo culto;
- uma pessoa só seja atribuída a uma função autorizada;
- exista no máximo uma escala por ministério e culto;
- o gerador automático nunca viole disponibilidade, consecutividade ou conflito de horário;
- salvar e publicar revalidem o estado atual, mesmo que o frontend já tenha validado.

Inclusão manual pode confirmar indisponibilidade, excesso de consecutividade ou conflito de mesma data e horário. Os demais invariantes são bloqueios absolutos.

## Prévia e persistência

A geração inicial não persiste atribuições. Ela retorna uma prévia revisável. O usuário pode ajustar a prévia, salvar como rascunho e depois publicar. Regenerar significa solicitar uma nova proposta e pode substituir ajustes manuais anteriores; a interface deve avisar antes dessa ação.

Ao completar escala existente, preservam-se atribuições já salvas e preenchem-se somente vagas. Para uma regeneração completa, o usuário escolhe entre preservar ou substituir; substituir requer confirmação.

## Permissões

Na primeira versão, `scale:write` permite gerar, editar, salvar, publicar e despublicar. Membros comuns não acessam escalas publicadas. A separação de uma permissão futura `scale:publish` fica como evolução, não como requisito atual.

## Alternativas rejeitadas

- **Gerar ministério por ministério:** rejeitado porque não resolve a disputa por pessoas habilitadas em múltiplos ministérios.
- **Preencher sempre a quantidade ideal:** rejeitado porque quantidade ideal não deve impedir escala quando não há pessoas suficientes.
- **Ordenar por nome:** rejeitado porque cria favorecimento sistemático e não promove equilíbrio.
- **Permitir qualquer duplicidade com aviso:** rejeitado para o gerador; regras estruturais não podem ser violadas automaticamente.
- **Gerar em lote nesta etapa:** rejeitado para reduzir complexidade e permitir validar o algoritmo em um culto controlado.
- **Participantes fixos na primeira versão:** rejeitado por complexidade; será reavaliado quando houver necessidade operacional comprovada.

## Consequências

O algoritmo precisa consultar histórico, disponibilidade, vínculos e escalas existentes em uma operação consistente. A aplicação deve expor resultados de prévia e motivos de incompletude, e o banco deve proteger invariantes relevantes com validações transacionais e constraints quando aplicável.

O comportamento fica mais explicável para o usuário, mas a implementação exige uma etapa explícita de planejamento de candidatos e uma transação final de salvamento/publicação. Métricas de equilíbrio e regras de duração parcial ficam para decisões futuras.

## Referência funcional

As regras detalhadas, mensagens e critérios de aceite estão em [Geração automática de escalas](../product/automatic-scale-generation.md).
