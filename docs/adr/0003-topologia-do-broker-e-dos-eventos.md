# 0003. Topologia do broker e dos eventos

- Status: Aceita (nada aqui depende do professor; RN-05/RN-06 afetam só a ADR 0001)
- Data: 2026-11-16
- Relacionado a: RNF-01, RNF-02, RNF-03, P-05, P-06, seções 6.2 e 6.4 da spec, ADR 0001, ADR 0002

## Contexto

A comunicação de pagamentos é assíncrona, via broker (RNF-02, [SPEC]). Ao registrar um pagamento, o `ServicoPagamentos` publica dois eventos de mesmo corpo, `PagamentoServicoCadastramento` e `PagamentoServicoAssinaturaValida` (6.2), com o corpo `{ dia, mes, ano, codass, valorPago }` (6.4). A spec fixa nomes e corpo, mas não a topologia nem a garantia de entrega. O `ServicoAssinaturasValidas` roda em várias instâncias (RNF-03), e o RabbitMQ entrega ao menos uma vez, então há duplicatas, reentregas e ordem não garantida entre mensagens. Gravar no banco e publicar no broker não é uma operação atômica (dual write).

## Decisão

1. **RabbitMQ** como broker.
2. **Dois eventos, uma fila para cada**, com os nomes e o corpo exatos da spec ([SPEC], sem acrescentar campos). Convenção do projeto, pois a spec não fixa: exchange padrão (direct), fila com o mesmo nome do evento, `PagamentoServicoCadastramento` e `PagamentoServicoAssinaturaValida`.
3. **Uma única fila para todas as instâncias do AssinaturasValidas** (competing consumers): cada mensagem vai para uma instância só. Basta, porque a invalidação é feita no Redis compartilhado (P-06, ADR 0002).
4. **Ack manual** depois de processar com sucesso. Em falha, a mensagem volta para nova tentativa.
5. **Retry limitado e DLQ**: após um número máximo de tentativas (configurável, por exemplo 3), a mensagem vai para uma dead-letter queue por fila (convenção: `<fila>.dlq`), para inspeção manual.
6. **Consumidores idempotentes**: o `messageId` do RabbitMQ é o código do pagamento. O Cadastramento guarda os IDs já processados e ignora duplicatas (ADR 0001). No AssinaturasValidas, remover a chave do cache já é idempotente (ADR 0002).
7. **Duplicadas e fora de ordem são toleradas** (consistência eventual). Não há mecanismo de ordenação.
8. **Dual write**: o Pagamentos grava no seu banco e só depois publica os dois eventos, com log e retry da publicação. Outbox fica como melhoria futura (decisão do tech lead).

## Alternativas consideradas

- **Evento único com dois consumidores (fanout ou mesma fila):** a spec exige dois eventos com nomes distintos. Com a mesma fila, os consumidores disputariam a mensagem. Com fanout, cada serviço teria de filtrar e o acoplamento aumentaria. Descartada por contrariar a spec e por acoplar os consumidores.
- **Kafka:** poderoso para log de eventos e ordenação, mas é pesado para o escopo, exige mais infraestrutura e o CLAUDE.md já fixa RabbitMQ. Descartada.
- **HTTP síncrono entre serviços:** viola RNF-02 e acopla a disponibilidade do Pagamentos à dos consumidores. Descartada.
- **Outbox agora:** elimina a janela do dual write, mas pede tabela, relay/poller e mais código, o que é exagero para o escopo. Adiada, não descartada.

## Consequências

- Positivas: cumpre RNF-02 e a spec ao pé da letra; consumidores independentes; AssinaturasValidas escala só subindo instâncias; falhas permanentes ficam isoladas na DLQ em vez de travar a fila.
- Negativas: mais filas e configuração de retry/DLQ; o Cadastramento precisa da tabela de IDs processados; o RabbitMQ vira dependência crítica.
- Riscos aceitos: se o serviço cair entre gravar e publicar, o pagamento fica gravado sem evento (a publicação com retry reduz o risco, mas não o elimina). Pagamentos fora de ordem podem gerar `fimVigencia` diferente (ADR 0001). Entre invalidação e gravação, o cache pode guardar a data antiga por até ~60 s (P-05, ADR 0002). Mensagens na DLQ exigem tratamento manual.
- Melhoria futura: Outbox no ServicoPagamentos; reprocessamento automático da DLQ; evento de confirmação "vigência atualizada" para reinvalidar o cache; limpeza (TTL) dos IDs processados.
