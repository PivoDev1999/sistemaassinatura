# 0012. Status calculado, não armazenado

- Status: Aceita
- Data: 2026-11-16
- Relacionado a: RN-02, ADR 0002 (cache guarda `fimVigencia`), ADR 0005 (Clock e datas)

## Contexto

A RN-02 ([SPEC]) diz que a assinatura é ATIVA se `fimVigencia > hoje` e CANCELADA caso contrário, e que o status é calculado, não armazenado. Um status gravado ficaria desatualizado à meia-noite, quando a vigência vence sem nenhum evento. A ADR 0002 já aplica o mesmo princípio no cache, que guarda a `fimVigencia` e nunca um booleano.

## Decisão

O banco guarda apenas `fimVigencia` (tipo `DATE`). O status é derivado no domínio por um método da `Assinatura` que recebe o dia de hoje. Esse valor vem do `Clock` injetável, no fuso `America/Sao_Paulo` (ADR 0005), e nunca de `new Date()` solto. Nos endpoints, `ATIVA` e `CANCELADA` são calculados na hora da resposta e não existe coluna `status`. A comparação é estrita: no dia do `fimVigencia`, a assinatura já está CANCELADA.

## Alternativas consideradas

- **Coluna `status` atualizada por um job de vencimento:** duplica a informação, abre janela de inconsistência entre o vencimento e a execução do job, e exige agendador e tratamento de falha. Contraria a RN-02. Descartada.
- **Atualizar o status só ao consultar:** mistura leitura com escrita e continua guardando um dado derivado. Descartada.

## Consequências

- Positivas: uma única fonte da verdade; sem job; a regra fica em um ponto testável com `Clock` falso.
- Negativas: filtros por status (como listar assinaturas ativas) viram condição sobre `fimVigencia` e `hoje`, e não um simples `WHERE status`.
- Riscos aceitos: o resultado depende do `Clock`. Um fuso errado muda a resposta na virada do dia.
- Melhoria futura: índice em `fimVigencia`, se as consultas por status ficarem lentas.
