---
name: nova-feature
description: Implementa uma feature de ponta a ponta com a equipe de agentes (plano, banco, backend, testes, revisão, docs). Use para cada item do ROADMAP.
argument-hint: [item do ROADMAP ou descrição da feature]
disable-model-invocation: true
---

Feature: **$ARGUMENTS**

Siga as etapas **em ordem**. Pare nos pontos marcados com ⏸ e espere a minha resposta.

1. **Entender.** Leia `CLAUDE.md`, `docs/ROADMAP.md`, a spec e os ADRs relacionados. Confirme que a feature está no ROADMAP. Se não estiver, pergunte.
2. **Planejar.** Delegue ao `architect`: plano técnico por camada, contratos exatos da spec, arquivos a criar e ADRs novos, se houver.
   ⏸ Mostre o plano resumido e espere aprovação.
3. **Branch.** `git switch main && git switch -c feat/<nome-curto>`.
4. **Banco** (só se a feature mexer em schema ou seed). Delegue ao `db-architect`.
5. **Implementação.** Delegue ao `backend-dev` (ou ao `frontend-dev` se for tela), passando o plano aprovado.
6. **Testes.** Delegue ao `test-writer`. Se ele relatar bugs, devolva ao `backend-dev`/`frontend-dev` para corrigir e rode os testes de novo.
7. **Revisão.** Delegue ao `code-reviewer`. Corrija todos os 🔴 (via `backend-dev`/`frontend-dev`) e rode a revisão de novo até **APROVADO**. Liste os 🟡 e 🟢 para mim.
8. **Docs.** Delegue ao `doc-writer` a atualização do README do serviço e dos diagramas afetados.
9. **Fechamento.** Commits pequenos no padrão Conventional Commits. Marque o item no `docs/ROADMAP.md`.
   ⏸ Mostre o resumo (o que foi feito, como testar, pendências 🟡) e pergunte se pode fazer o merge na `main`.
10. **Merge.** Após aprovação: `git switch main && git merge --no-ff feat/<nome-curto>`.

Ao final, lembre-me de usar `/clear` antes da próxima feature.
