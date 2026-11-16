---
name: adr
description: Escreve um ADR (Architecture Decision Record) em docs/adr/ usando o agente architect. Use quando uma decisão de arquitetura precisar ser registrada.
argument-hint: [número do backlog ou título da decisão]
disable-model-invocation: true
---

Escreva o ADR para: **$ARGUMENTS**

1. **Contexto.** Leia `docs/adr/backlog.md` (decisões e respostas do tech lead), a spec e os ADRs já existentes em `docs/adr/`.
2. **Delegue ao agente `architect`** a escrita do arquivo `docs/adr/NNNN-titulo-em-kebab-case.md`, com o próximo número livre (0001, 0002...) e este formato:

   ```
   # NNNN. Título
   - Status: Proposta | Aceita | Substituída por NNNN
   - Data: AAAA-MM-DD
   - Relacionado a: RN-xx, P-xx, RNF-xx

   ## Contexto
   O problema e as forças em jogo (o que a spec exige, o que ela não diz).
   ## Decisão
   O que foi decidido, de forma direta e verificável.
   ## Alternativas consideradas
   Cada alternativa com o motivo de ter sido descartada.
   ## Consequências
   Positivas, negativas e riscos aceitos. O que fica como melhoria futura.
   ```

   Regras: no máximo uma página; use as respostas do tech lead registradas no backlog; status "Proposta" quando depender de confirmação do professor.
3. **Índice.** Atualize `docs/adr/README.md` (crie se não existir) com uma tabela: número, título, status.
4. **Backlog.** Marque o item como escrito em `docs/adr/backlog.md`.
5. Mostre o ADR para mim e **espere minha aprovação** antes do commit `docs(adr): NNNN titulo`.
