# Backlog de ADRs

Lista de decisões de arquitetura que merecem ADR, levantada pelo agente `architect` a partir de `docs/specs/sistema-assinaturas.md` e do `CLAUDE.md`. Nenhuma ADR foi escrita ainda. Numerar como `0001...` na ordem de redação abaixo.

## Prioridade

As ADRs 1 a 4 são as essenciais. Depois vêm 5 a 8. O Grupo B pode ser enxuto (1 a 2 parágrafos cada).

## Grupo A: decisões abertas

| # | ADR | Decisão em jogo | Alternativas | Por que precisa de ADR |
|---|---|---|---|---|
| 1 | ✅ escrito em [0001-politica-de-renovacao-como-strategy.md](0001-politica-de-renovacao-como-strategy.md) (Proposta). Política de renovação como Strategy (RN-04, RN-05, RN-06, P-01) | `PoliticaRenovacao` como interface do domínio, implementação escolhida por configuração. Regras iniciais: +30 dias se ativa, `dataPagamento + 30` se vencida, valor < `custoMensal` não estende. | if/else no caso de uso; política no banco; feature flags | Ponto central da disciplina (trocar a regra mexendo em uma classe e na configuração). RN-05/06 estão marcadas "confirmar com o professor", então nasce como *proposta*. Definir também a reentrega do mesmo pagamento (estender duas vezes?). |
| 2 | ✅ escrito em [0002-cache-e-consistencia-no-assinaturas-validas.md](0002-cache-e-consistencia-no-assinaturas-validas.md) (Aceita). Cache e consistência no AssinaturasValidas (P-04, P-05, P-06, RNF-03) | Redis compartilhado entre instâncias, guardando `fimVigencia` (não booleano), validade calculada na consulta, TTL curto (~60 s), invalidação por evento, consistência eventual na corrida de P-05. | cache em memória por instância; guardar booleano; pub/sub em todas as instâncias; write-through; sem cache | Dois bugs conhecidos da spec. P-05 pede ADR explicitamente. Pode ser dividida em duas (cache + TTL; corrida/consistência eventual). |
| 3 | ✅ escrito em [0003-topologia-do-broker-e-dos-eventos.md](0003-topologia-do-broker-e-dos-eventos.md) (Aceita). Topologia do broker e dos eventos (RNF-02, 6.2, 6.4, P-06) | RabbitMQ; dois eventos de mesmo corpo para filas distintas; uma fila para todas as instâncias do AssinaturasValidas (competing consumers); ack, retry, DLQ; duplicados e fora de ordem; Outbox ou aceitar dual write. | evento único com dois consumidores; Kafka; HTTP síncrono; Outbox | A spec fixa nomes e corpo dos eventos, mas não a topologia nem a garantia de entrega. |
| 4 | Contrato interno `GET /servcad/assinvalidas/:codass` e assinatura inexistente (P-03, P-08) | Criar o endpoint interno, `false` (e não 404) para inexistente no `/assinvalidas`, cliente HTTP com timeout e tratamento de falha. | SAV ler o banco do Cadastramento (proibido por RNF-01); réplica local via eventos; gRPC | O endpoint não existe na spec. O cache precisa da `fimVigencia`, mas a spec fala em `true/false`. Sugestão: manter o booleano no endpoint público e expor a data em rota interna distinta. |
| 5 | Tempo e datas: `Clock`, dias de calendário, `America/Sao_Paulo` (RN-08, RN-01, RN-02) | `DATE` sem hora no banco, `YYYY-MM-DD` no JSON, `Clock` como porta, validação de datas impossíveis (31/02) no `dia/mes/ano` do pagamento. | `Date` UTC com hora; Luxon, date-fns-tz, Temporal | Erros de fuso na virada do dia afetam `fimVigencia > hoje`. |
| 6 | Dinheiro como Decimal (spec seção 3) | `NUMERIC(12,2)` / `Prisma.Decimal`; serialização como número no JSON sem perder precisão; comparação de `valorPago` com `custoMensal` (RN-06). | float; inteiros em centavos | Marcado [DECISÃO] na spec. O `CLAUDE.md` já fixa Decimal; a parte nova é serialização e comparação. |
| 7 | Inconsistência `custo` x `custoMensal` (P-02) | Seguir literalmente cada endpoint (GET devolve `custo`; PATCH recebe `custo` e devolve `custoMensal`), com mapeamento isolado em `presentation` / `packages/contracts`. | normalizar para um nome (viola [SPEC]); aceitar ambos na entrada | Preserva o contrato e mantém o domínio coerente. Pendente de confirmação. |
| 8 | Autenticação só no frontend (P-07, [EXTRA], hash de senha) | Endpoints da spec abertos; login protege só o painel; onde vive o `Usuario`; bcrypt; sessão/JWT no Next.js. | proteger todas as APIs (quebra o contrato); serviço novo de login | A spec não diz onde fica o `Usuario` nem como autenticar. Define também o que ficou fora do escopo. |

## Grupo B: registros de decisão já tomada

| # | ADR | Resumo |
|---|---|---|
| 9 | Clean Architecture e regra de dependência | `domain/` sem framework; wiring só nos `*.module.ts` com tokens. Alternativas: NestJS em camadas por módulo; hexagonal livre. |
| 10 | Monorepo pnpm e `packages/contracts` | Alternativas: repositórios separados; contratos duplicados. Consequência: acoplamento de versão dos tipos de evento (RNF-01 continua valendo, só os tipos são compartilhados). |
| 11 | Banco por serviço (Prisma + PostgreSQL, RNF-01) e Redis para cache | Alternativa: um banco com schemas separados, que fere RNF-01. |
| 12 | Status calculado, não armazenado (RN-02) | Alternativa: coluna `status` com job de vencimento. Relaciona-se com a ADR 2. |
| 13 | Linguagem ubíqua em português no código | Alternativa: tudo em inglês. |
| 14 | Seed idempotente (RNF-04) e Docker Compose (RNF-05) | Seed com `upsert` e códigos fixos; Compose com portas em 127.0.0.1, versões fixas e migrations antes do serviço. Opcional: ADR separada de estratégia de testes. |

## Riscos e decisões do tech lead

Respostas às perguntas em aberto levantadas pelo `architect`. As ADRs ainda não foram escritas.

| # | Pergunta | Decisão | ADR afetada |
|---|---|---|---|
| 1 | RN-05/RN-06 sem confirmação do professor | A ADR 1 nasce com status **Proposta** até o professor confirmar RN-05/RN-06. | 1 |
| 2 | O endpoint interno pode devolver a `fimVigencia`? | Sim. `GET /servcad/interno/vigencia/:codass` retorna `{ codass, fimVigencia }`. P-03 atualizado na spec. | 4 (e 2) |
| 3 | Outbox ou aceitar o dual write? | Publicar após gravar, com log e retry. Outbox fica como **melhoria futura**, documentada na ADR 3. | 3 |
| 4 | Idempotência dos eventos | `messageId` do RabbitMQ = código do pagamento. O Cadastramento guarda os IDs já processados. O corpo do evento não muda. | 1 e 3 |
| 5 | Onde fica o `Usuario`? | No ServicoCadastramento, com `POST /servcad/auth/login` [EXTRA], usado só pelo Next.js. | 8 |
