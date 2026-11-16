# 0006. Dinheiro como Decimal

- Status: Aceita (a seção 3 da spec já marca a decisão; a regra RN-06 em si segue a ADR 1, ainda Proposta)
- Data: 2026-11-16
- Relacionado a: RN-06, seção 3 da spec, ADR 1 (política de renovação), ADR 5 (Clock e datas)

## Contexto

`custoMensal` e `valorPago` são dinheiro, e RN-06 compara um com o outro. A spec diz "ponto flutuante", mas float erra centavos (0.1 + 0.2 ≠ 0.3). O JSON deve continuar com número, como na [SPEC].

## Decisão

1. **Banco:** `NUMERIC(12,2)`; `Prisma.Decimal` só na borda.
2. **Domínio:** value object `Dinheiro` em TypeScript puro, sem importar Prisma. Guarda centavos em `bigint` e expõe `menorQue`, `igual` e `somar`. Ninguém usa `number` em cálculo.
3. **Conversão:** só no repositório Prisma, via string (`Prisma.Decimal` ↔ `Dinheiro`).
4. **RN-06:** `valorPago.menorQue(custoMensal)` dentro da `PoliticaRenovacao` (ADR 1).
5. **Saída JSON:** o mapeamento em `presentation` converte `Dinheiro` para `number` a partir da string de duas casas. É exato, pois o máximo (9.999.999.999,99) fica abaixo de 2^53. Sai `29.9`, o mesmo número JSON que `29.90`.
6. **Entrada** (`valorPago`, `custo`): o DTO exige número finito, maior que zero, com no máximo 2 casas e menor que 10^10. Caso contrário, `400`. Rejeitar zero é escolha nossa (a spec não diz).
7. O `valorPago` no corpo do evento também segue como número JSON.

## Alternativas consideradas

- **`number` / float:** erra centavos e deixa RN-06 pouco confiável.
- **Centavos inteiros no banco e na API:** exato, mas muda o contrato (`2990` em vez de `29.90`) e viola a [SPEC]. Só usamos centavos dentro do VO.
- **`Prisma.Decimal` ou `decimal.js` no domínio:** acopla o domínio a Prisma ou a uma biblioteca, contra a regra de dependência.
- **String no JSON:** evita qualquer perda de precisão, mas muda o contrato.

## Consequências

- Positivas: cálculo e comparação exatos; domínio puro e testável sem banco; contrato intacto.
- Negativas: um VO, conversores e um validador de casas decimais a mais.
- Riscos aceitos: quem enviar 3 ou mais casas recebe `400`, em vez de arredondamento silencioso.
- Melhoria futura: aceitar string na entrada, se algum cliente precisar; várias moedas.
