# 0004. Contrato interno de vigência e assinatura inexistente

- Status: Aceita (a spec já foi atualizada em P-03 e P-08 e nada aqui depende do professor)
- Data: 2026-11-16
- Relacionado a: P-03, P-04, P-08, RNF-01, RNF-03, ADR 0002, ADR 0003

## Contexto

O `ServicoAssinaturasValidas` não pode ler o banco do Cadastramento (RNF-01). Em cache miss ele precisa da `fimVigencia`, porque o cache guarda a data e nunca um booleano (P-04, ADR 0002). A spec define só `GET /assinvalidas/:codass`, que devolve `true`/`false`, e nenhum endpoint para a consulta entre serviços (P-03). A ADR 0002 deixou para esta ADR o contrato do endpoint, o timeout, a falha do Cadastramento, a assinatura inexistente (P-08) e o fallback com Redis fora do ar.

## Decisão

1. **Endpoint interno** `GET /servcad/interno/vigencia/:codass` no Cadastramento (decisão do tech lead, P-03). Resposta 200: `{ "codass": ..., "fimVigencia": "YYYY-MM-DD" }`. Assinatura inexistente: 404. É rota fora dos contratos [SPEC] públicos, marcada como interna no Swagger e sem uso pelo painel.
2. **O endpoint público não muda**: `GET /assinvalidas/:codass` segue devolvendo `true`/`false`. A validade é calculada com `fimVigencia > hoje` (`Clock`, ADR 0002).
3. **Assinatura inexistente**: o 404 do endpoint interno vira `false` no `/assinvalidas`, nunca 404 (P-08). Nada é gravado no cache; não há cache negativo por ora.
4. **Cliente HTTP** em `infrastructure/` do AssinaturasValidas, atrás de uma porta em `application/` (por exemplo `ConsultaVigencia`). Timeout curto, configurável por variável de ambiente (por exemplo `CADASTRAMENTO_TIMEOUT_MS`, padrão 2000). A porta distingue "encontrada", "inexistente" e "indisponível".
5. **Falha do Cadastramento** (timeout, 5xx, conexão recusada): o `/assinvalidas` responde **503** com erro de indisponibilidade, e **nada é gravado no cache**, para não cachear dado falso. Sem retry no pedido e sem responder `false` por engano: `false` só significa "inexistente ou vencida".
6. **Redis fora do ar**: o serviço degrada e consulta o Cadastramento a cada chamada, sem cache. Erros de leitura e escrita no Redis são logados e não derrubam o pedido. Se o Cadastramento também falhar, vale o item 5.

## Alternativas consideradas

- **SAV ler o banco do Cadastramento:** proibido por RNF-01. Descartada.
- **Réplica local alimentada por eventos:** os eventos de pagamento não trazem a `fimVigencia`, que depende da política (ADR 0001); a réplica duplicaria a regra de renovação e exigiria carga inicial e sincronização. Muito pesada para o escopo. Descartada.
- **gRPC:** ganho de desempenho irrelevante aqui, mais tooling (proto, geração de código) e foge do restante do projeto, que é HTTP/JSON. Descartada.
- **Expor a data no endpoint público:** quebra o contrato [SPEC] (`true`/`false`). Descartada.
- **Responder `false` quando o Cadastramento falha:** um app bloquearia clientes com assinatura válida por causa de uma falha de infraestrutura, e o erro ficaria invisível. Descartada em favor do 503.

## Consequências

- Positivas: contrato público intacto; RNF-01 preservado; o cache recebe só dados verdadeiros; a falha aparece de forma explícita; o domínio continua puro, e os testes usam uma porta falsa em memória.
- Negativas: surge uma rota interna a mais para manter; há acoplamento de disponibilidade com o Cadastramento em cache miss.
- Riscos aceitos: a rota interna não tem autenticação, e a proteção vem de a rede do Compose não ser exposta (ela fica fora dos contratos [SPEC]); com Redis fora do ar, a carga no Cadastramento sobe; códigos inexistentes consultados repetidamente voltam sempre ao Cadastramento (sem cache negativo).
- Melhoria futura: cache negativo curto para `codass` inexistente; circuit breaker no cliente; token ou rede privada para a rota interna; retry com backoff curto.
