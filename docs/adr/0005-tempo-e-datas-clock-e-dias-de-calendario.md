# 0005. Tempo e datas: Clock e dias de calendário

- Status: Aceita (RN-08 é [DECISÃO] do projeto e nada aqui depende do professor)
- Data: 2026-11-16
- Relacionado a: RN-01, RN-02, RN-08, RN-05, ADR 0001, ADR 0002, ADR 0004

## Contexto

A vigência da assinatura é medida em dias, não em instantes: RN-01 define `fimVigencia = hoje + 7 dias`, RN-02 define ATIVA como `fimVigencia > hoje`, e RN-08 diz que datas são dias de calendário, sem hora, em `America/Sao_Paulo`. O servidor roda em UTC (Docker em Linux), então entre 21h e 24h de Brasília o "hoje" em UTC já é o dia seguinte, e uma assinatura mudaria de status três horas cedo. Além disso, o pagamento chega como `{dia, mes, ano}` separados (6.4), o que permite datas impossíveis como 31/02. As ADRs 0001, 0002 e 0004 já dependem de um `Clock` injetável, e esta ADR o define.

## Decisão

1. **Tipo de data**: dia de calendário (`ano-mes-dia`), sem hora e sem fuso, em todas as camadas. No PostgreSQL a coluna é `DATE`. No JSON (e no Swagger) o formato é `YYYY-MM-DD`, como no exemplo da spec. Nos eventos, o corpo continua `{dia, mes, ano, ...}` ([SPEC]).
2. **`Clock` é uma porta**: interface TypeScript pura com um método `hoje()`, que devolve o dia de calendário atual. Fica em `domain/` (a política de renovação a usa) ou `application/`, nunca em `infrastructure/`. A implementação `RelogioDeSistema` fica em `infrastructure/` e calcula o dia em `America/Sao_Paulo` com `Intl.DateTimeFormat` nativo (`timeZone: 'America/Sao_Paulo'`, formato `en-CA` ou `formatToParts`). Nos testes usa-se um `RelogioFalso` com data fixa, ajustável por teste. A ligação é feita só no `*.module.ts`.
3. **"Hoje" vem sempre do `Clock`**, nunca de `new Date()` direto no código de domínio, aplicação ou apresentação. `new Date()` só aparece dentro de `RelogioDeSistema`. Uma regra de lint (`no-restricted-syntax`) pode reforçar isso.
4. **Status calculado**: ATIVA se `fimVigencia > hoje`, senão CANCELADA, comparando dia com dia (RN-02). Nunca é armazenado (ADR 0002).
5. **Aritmética de dias**: `+7` e `+30` são somas em dias de calendário (RN-01, RN-05), feitas sobre o valor `ano-mes-dia`, sem converter para instante e sem deslocamento por fuso. Um value object `Dia` (ou funções puras) concentra soma, comparação e formatação. Internamente pode usar `Date.UTC(ano, mes - 1, dia)` apenas como calculadora de calendário (UTC não tem horário de verão), nunca expondo a hora.
6. **Validação do pagamento**: no `POST /registrarpagamento`, `dia`, `mes` e `ano` devem ser inteiros e formar uma data real do calendário (rejeita 31/02, 29/02 em ano não bissexto, mês 13). A construção do `Dia` valida isso e lança erro de domínio; a camada `presentation` o traduz em **400** (erro de validação, mesmo formato dos demais erros de entrada). A spec não define o corpo do erro, então usa-se o padrão do NestJS (`statusCode`, `message`, `error`). Nada é gravado nem publicado quando a data é inválida.
7. **Prisma**: campos `DateTime @db.Date`. Na borda do repositório, converte-se entre `Date` (meia-noite UTC, como o Prisma entrega) e `Dia`, para o `Date` não vazar para o domínio.

## Alternativas consideradas

- **`Date` em UTC com hora:** o dia depende do fuso de quem lê, e a virada às 21h de Brasília quebra `fimVigencia > hoje`. A soma de 30 dias com hora ainda pode cair no dia errado. Descartada.
- **Luxon ou date-fns-tz:** resolvem fuso, mas adicionam dependência e uma API de instante com hora para um problema que só pede "que dia é hoje em São Paulo?". `Intl` nativo responde isso em poucas linhas. Descartada por ora.
- **Temporal:** é a API certa para `PlainDate`, mas ainda depende de polyfill em parte dos ambientes Node. Descartada agora; é candidata natural no futuro.
- **Guardar timestamp com fuso (`timestamptz`):** carrega hora que a spec não tem e reabre o problema do fuso na leitura. Descartada.
- **Validar só com `class-validator` (`@Min`/`@Max`):** aceitaria 31/02. A regra de calendário é do domínio (`Dia`), então ela vale também para o consumidor de eventos. Descartada como única barreira.

## Consequências

- Positivas: a virada do dia é correta em Brasília; os testes controlam o tempo (`RelogioFalso`); o domínio fica puro; não há dependência nova; as ADRs 0001, 0002 e 0004 usam o mesmo `Clock` e a mesma comparação.
- Negativas: um value object e uma conversão `Date` <-> `Dia` no repositório; é preciso disciplina para não usar `new Date()` fora do `Clock`.
- Riscos aceitos: o serviço depende dos dados de fuso do ICU do Node (`America/Sao_Paulo`), presentes nas imagens oficiais; o Brasil não tem horário de verão desde 2019, e o `Intl` já cuidaria disso se voltasse. Os serviços Cadastramento e AssinaturasValidas calculam "hoje" em relógios diferentes, e uma pequena defasagem do relógio da máquina só importa perto da meia-noite (consistência eventual, ADR 0002).
- Pendente: esta ADR não decide se um pagamento com data futura ou muito antiga é aceito. Isso fica em aberto (política de renovação, ADR 0001).
- Melhoria futura: migrar para `Temporal.PlainDate` quando estiver estável no Node LTS; regra de lint contra `new Date()`.
