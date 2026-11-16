# 0007. Inconsistência `custo` x `custoMensal`

- Status: Proposta (a spec marca P-02 como pendente: "seguir o texto literalmente em cada endpoint até o professor confirmar"; as linhas dos endpoints levam ⚠️)
- Data: 2026-11-16
- Relacionado a: P-02, RN-06, seção 3 da spec, ADR 6 (dinheiro como Decimal), CLAUDE.md regra de ouro 1

## Contexto

A entidade `Aplicativo` tem o campo `custoMensal` (seção 3), e RN-06 usa esse nome. Mas os endpoints de aplicativos divergem:

| Endpoint | Campo |
|---|---|
| `GET /servcad/aplicativos` | saída `[{codigo, nome, custo}]` |
| `PATCH /servcad/aplicativos/:idAplicativo` | entrada `{custo}` |
| `PATCH /servcad/aplicativos/:idAplicativo` | saída `{codigo, nome, custoMensal}` |

Pode ser erro de digitação da spec, mas ainda não há confirmação do professor. Contratos [SPEC] são intocáveis, então não escolhemos um lado por conta própria.

## Decisão

1. **Cada endpoint segue a spec ao pé da letra**, com a tabela acima como referência: GET devolve `custo`, PATCH recebe `custo` e devolve `custoMensal`.
2. **O domínio usa um nome só: `custoMensal`**, coerente com a spec (seção 3), com RN-06 e com a ADR 6 (tipo `Dinheiro`). Nenhum `custo` em `domain/` ou `application/`.
3. **O mapeamento fica isolado** em `presentation` (DTOs e mappers do Controller) e nos tipos de `packages/contracts`, que terão um tipo por formato (por exemplo, `AplicativoListaDto` com `custo` e `AplicativoAtualizadoDto` com `custoMensal`). O caso de uso recebe e devolve `custoMensal`.
4. **Teste e2e de contrato por endpoint** (Supertest), que trava o nome do campo de cada rota. Se o professor confirmar outro nome, mudam só o mapper, o tipo e o teste.
5. Validação do valor (número, 2 casas, maior que zero) segue a ADR 6, qualquer que seja o nome do campo.

## Alternativas consideradas

- **Normalizar para um nome só (`custoMensal` em tudo):** deixa a API limpa, mas viola a [SPEC] e pode quebrar quem seguir o texto literal. Descartada.
- **Aceitar `custo` e `custoMensal` na entrada do PATCH:** contrato frouxo e ambíguo (e se vierem os dois, com valores diferentes?). Descartada.
- **Usar `custo` também no domínio:** espalha a inconsistência pelo código e destoa de RN-06. Descartada.

## Consequências

- Positivas: contrato preservado; domínio coerente; a correção, se vier, é local (mapper, tipo e teste).
- Negativas: dois DTOs quase iguais e um mapper a mais; o painel web precisa conhecer as duas formas (via `packages/contracts`).
- Riscos aceitos: se a spec tiver sido digitada errada, a API fica com uma inconsistência deliberada até a resposta do professor. O Swagger deve documentar isso, para não parecer bug.
- Melhoria futura: com a confirmação do professor, unificar o nome, atualizar a spec (P-02), os tipos e os testes, e mudar o status desta ADR para Aceita.
