# 0001. Política de renovação como Strategy

- Status: Proposta (depende da confirmação do professor sobre RN-05/RN-06)
- Data: 2026-11-16
- Relacionado a: RN-03, RN-04, RN-05, RN-06, RN-08, P-01, ADR 3 (topologia dos eventos), ADR 5 (Clock), ADR 6 (Decimal)

## Contexto

Um pagamento estende a validade da assinatura (RN-03). A spec diz que a regra de extensão muda com frequência e deve ser trocável sem mexer no resto do código (RN-04, [SPEC]). Mas não diz quanto o pagamento estende, nem o que fazer com pagamento atrasado ou de valor menor (P-01). Por isso adotamos RN-05 e RN-06, que são [DECISÃO] e ainda aguardam confirmação do professor.

O `PagamentoServicoCadastramento` chega ao Cadastramento pelo RabbitMQ, que garante entrega ao menos uma vez. O mesmo pagamento pode chegar duas vezes, e a spec não trata disso. Datas são dias de calendário em `America/Sao_Paulo` (RN-08), e dinheiro é `Decimal`.

## Decisão

1. `PoliticaRenovacao` é uma interface do `domain/` do Cadastramento, em TypeScript puro (sem `@nestjs/*`, Prisma ou RabbitMQ). Ela recebe a assinatura, o `custoMensal`, o `valorPago`, a `dataPagamento` e o "hoje", e devolve a nova `fimVigencia` ou "não estende".
2. A implementação é escolhida por configuração (variável de ambiente) e ligada só no `*.module.ts`, por um token de injeção (`POLITICA_RENOVACAO`). Trocar a regra = escrever uma classe de infraestrutura/domínio e mudar a configuração.
3. Regras iniciais (`PoliticaRenovacaoPadrao`):
   - `valorPago < custoMensal` (comparado como `Decimal`, nunca `number`): registra, mas não estende (RN-06).
   - Assinatura ativa (`fimVigencia > hoje`): `fimVigencia + 30 dias` (RN-05).
   - Assinatura vencida: `dataPagamento + 30 dias` (RN-05).
4. "Hoje" vem do `Clock` injetável, nunca de `new Date()` direto. O caso de uso passa o valor para a política, que fica pura e testável.
5. Reentrega: o `messageId` do RabbitMQ é o código do pagamento. O Cadastramento guarda os IDs já processados (tabela própria, no seu banco) e ignora duplicatas, então não estende duas vezes. A verificação do ID e a atualização da `fimVigencia` ocorrem na mesma transação. O corpo do evento não muda ([SPEC]).

## Alternativas consideradas

- **if/else no caso de uso:** simples no começo, mas cada mudança de regra mexe no caso de uso e nos testes dele. Viola o espírito de RN-04.
- **Política no banco (regras em tabela/JSON):** permitiria mudar sem deploy, mas cria uma linguagem de regras para interpretar, esconde a lógica fora do código tipado e é exagero para o escopo da disciplina.
- **Feature flags:** boas para ligar ou desligar comportamento, não para modelar regras com parâmetros e datas. Espalham condicionais pelo código e exigem uma ferramenta a mais.
- **Reentrega sem controle (aceitar duplicatas):** descartada porque estenderia a vigência duas vezes por um único pagamento.

## Consequências

- Positivas: a regra muda em uma classe e na configuração; a política é testável sem banco nem broker; o domínio segue livre de framework; a duplicata não gera dupla extensão.
- Negativas: uma interface, um token e uma tabela de IDs processados a mais; a troca da política exige reiniciar o serviço.
- Riscos aceitos: RN-05/RN-06 podem mudar quando o professor responder, o que exige só ajustar `PoliticaRenovacaoPadrao` e seus testes. Pagamentos em ordem diferente da chegada podem gerar `fimVigencia` diferente (consistência eventual, a tratar na ADR 3).
- Melhoria futura: `PoliticaRenovacao` por plano ou aplicativo; Outbox para o lado do Pagamentos (ADR 3); limpeza (TTL) dos IDs processados.
