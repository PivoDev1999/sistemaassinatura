# 0002. Cache e consistência no AssinaturasValidas

- Status: Aceita (a consistência eventual de P-05 é prevista pela própria spec; nada aqui depende do professor. O contrato do endpoint interno é detalhado na ADR 4)
- Data: 2026-11-16
- Relacionado a: P-03, P-04, P-05, P-06, P-08, RNF-03, RN-02, RN-08, ADR 0001, ADR 3 (topologia dos eventos), ADR 4 (endpoint interno), ADR 5 (Clock)

## Contexto

O `ServicoAssinaturasValidas` precisa responder rápido e rodar em várias instâncias (RNF-03). Ele não pode ler o banco do Cadastramento (RNF-01), então usa cache e, quando falta dado, consulta o Cadastramento.

A spec aponta três problemas. P-04: se o cache guardar `true`, a assinatura vence sem pagamento e o cache continua dizendo `true` (só o pagamento limpa o cache). P-06: com cache em memória, cada instância teria o seu, e todas precisariam receber a invalidação. P-05: os dois eventos do pagamento chegam juntos. O AssinaturasValidas pode invalidar o cache, consultar o Cadastramento antes de ele gravar a nova data e guardar o valor antigo. A spec pede o registro dessa corrida em ADR.

## Decisão

1. **Redis compartilhado** por todas as instâncias. A instância não guarda estado de assinatura; qualquer uma responde igual (P-06).
2. **O cache guarda a `fimVigencia`** (data `YYYY-MM-DD`), nunca um booleano (P-04). Chave por `codass`.
3. **A validade é calculada na consulta**: `fimVigencia > hoje`, com "hoje" vindo do `Clock` injetável em `America/Sao_Paulo` (RN-02, RN-08). Assim a assinatura que vence passa a responder `false` sozinha.
4. **TTL curto, cerca de 60 s**, configurável por variável de ambiente. É a rede de segurança contra qualquer invalidação perdida.
5. **Cache miss**: o serviço chama `GET /servcad/interno/vigencia/:codass`, que devolve `{ codass, fimVigencia }` (P-03). O cliente HTTP tem timeout; o contrato completo, o tratamento de falha e o caso de assinatura inexistente (`false`, P-08) ficam na ADR 4. A porta do cache e a do cliente HTTP são interfaces da camada `application/`; Redis e HTTP ficam em `infrastructure/`.
6. **Atualização por evento**: ao consumir o evento de pagamento, a instância remove a chave do `codass` no Redis (não grava valor novo). Como há uma fila só e o Redis é comum, uma instância basta (topologia na ADR 3).
7. **P-05 aceita como consistência eventual**: se o cache for repopulado com a data antiga entre a invalidação e a gravação no Cadastramento, o valor errado vive no máximo um TTL (~60 s). Não há mecanismo extra de ordenação.

## Alternativas consideradas

- **Cache em memória por instância:** é rápido, mas cada instância fica com um cache diferente e todas precisariam receber a invalidação (P-06). Com a fila de competing consumers, só uma instância receberia o evento, e as demais ficariam desatualizadas.
- **Guardar booleano:** reproduz o bug de P-04. A assinatura venceria e o cache seguiria dizendo `true`.
- **Pub/sub de invalidação em todas as instâncias:** resolve o cache em memória, mas exige uma fila ou canal por instância e mais código. O Redis compartilhado já resolve o problema com menos peças.
- **Write-through (gravar a nova `fimVigencia` ao receber o evento):** o corpo do evento (valor, data do pagamento) não traz a nova `fimVigencia`, que depende da política (ADR 0001). Calculá-la aqui duplicaria a regra de renovação em outro serviço. Também não elimina a corrida.
- **Sem cache:** toda consulta iria ao Cadastramento. Acopla a disponibilidade e a latência dos dois serviços e contraria RNF-03.

## Consequências

- Positivas: o bug de P-04 deixa de existir; qualquer instância responde igual; escalar horizontalmente é só subir mais instâncias; o domínio fica puro (a regra `fimVigencia > hoje` é testável com `Clock` falso e cache em memória nos testes).
- Negativas: o Redis vira dependência crítica do serviço; há um hop HTTP no cache miss; mais uma configuração (TTL).
- Riscos aceitos: após um pagamento, a consulta pode devolver a data antiga por até ~60 s (P-05). Se o Redis cair, o serviço degrada para consultar o Cadastramento a cada chamada (decisão de fallback a detalhar na ADR 4). Pagamento com valor menor que o `custoMensal` não estende (ADR 0001), então a invalidação nesse caso é inofensiva.
- Melhoria futura: invalidar de novo depois de o Cadastramento confirmar a gravação (por exemplo, evento "vigência atualizada"); cache negativo curto para `codass` inexistente; TTL por proximidade do vencimento.
