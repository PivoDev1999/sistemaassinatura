# 0013. Linguagem ubíqua em português

- Status: Aceita
- Data: 2026-11-16
- Relacionado a: seção Idioma do CLAUDE.md, ADR 0001, ADR 0007

## Contexto

A spec foi escrita em português e define nomes que aparecem nos contratos: `codass`, `fimVigencia`, `custoMensal`, `valorPago` e os eventos `PagamentoServicoCadastramento` e `PagamentoServicoAssinaturaValida`. O código, a spec e as conversas com o professor precisam usar as mesmas palavras. Ao mesmo tempo, o ecossistema (NestJS, Prisma, padrões de projeto) usa termos técnicos em inglês.

## Decisão

- **Domínio em português**, igual à spec: `Assinatura`, `Aplicativo`, `Cliente`, `fimVigencia`, `PoliticaRenovacao`. Vale para entidades, value objects, casos de uso e regras.
- **Termos técnicos em inglês:** `Repository`, `UseCase`, `Controller`, `Module`, `Clock`. Os dois idiomas se combinam, por exemplo `AssinaturaRepository` e `RegistrarPagamentoUseCase`.
- **Commits em inglês**, no padrão Conventional Commits (`feat(cadastramento): create subscription use case`).
- Conversa e documentação (specs, ADRs) em português.

## Alternativas consideradas

- **Tudo em inglês:** é o costume do mercado, mas exigiria traduzir a spec ([SPEC]) e manter um mapa entre o nome do contrato e o do código, o que gera confusão (a ADR 0007 já trata de uma inconsistência de nomes). Descartada.

## Consequências

- Positivas: o código lê como a spec; o vocabulário de negócio é o mesmo na fala, no contrato e na classe.
- Negativas: nomes mistos (`AssinaturaRepository`) soam estranhos para quem não conhece a convenção; acentos e cedilha ficam fora dos identificadores (`fimVigencia`, `PoliticaRenovacao`).
- Riscos aceitos: pequenas inconsistências, como o `custo` x `custoMensal` herdado da spec (ADR 0007).
- Melhoria futura: um glossário curto em `docs/`, se o vocabulário crescer.
