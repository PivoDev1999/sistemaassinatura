# 0011. Banco por serviço e Redis para cache

- Status: Aceita
- Data: 2026-11-16
- Relacionado a: RNF-01, RNF-03, ADR 0002 (cache e consistência), ADR 0004 (contrato interno de vigência)

## Contexto

O RNF-01 ([SPEC]) exige que cada serviço tenha seu próprio banco e que nenhum acesse o banco do outro. O CLAUDE.md já fixa Prisma e PostgreSQL. Além disso, o AssinaturasValidas roda em várias instâncias (RNF-03) e precisa de um cache que todas enxerguem, como decidido na ADR 0002.

## Decisão

- **Cadastramento e Pagamentos** têm cada um seu banco PostgreSQL (`CadastroGeral` e `Pagamentos`), seu próprio `schema.prisma` e suas próprias migrations (`prisma migrate dev`). Nunca se altera o banco à mão.
- Quando um serviço precisa de dado de outro, usa HTTP ou evento, como no endpoint interno de vigência da ADR 0004, e não acesso direto ao banco.
- **AssinaturasValidas** não tem banco relacional. Usa um **Redis** compartilhado entre as instâncias como cache, guardando a `fimVigencia` com TTL curto, conforme a ADR 0002.

## Alternativas consideradas

- **Um único banco com schemas separados:** simplifica a infraestrutura, mas deixa um serviço a uma credencial de distância do dado do outro. Fere o RNF-01 na prática. Descartada.
- **Cache em memória por instância:** já avaliada e descartada na ADR 0002, porque cada instância teria uma visão diferente.

## Consequências

- Positivas: isolamento real entre serviços; migrations e schema evoluem de forma independente; todas as instâncias do AssinaturasValidas compartilham o mesmo cache.
- Negativas: mais contêineres e mais configuração; não há join entre domínios; dados cruzados dependem de chamada HTTP ou evento.
- Riscos aceitos: consistência eventual entre os serviços (ver ADR 0002 e 0003).
- Melhoria futura: nenhuma prevista. Serviços em servidores de banco separados só se o ambiente de implantação pedir.
