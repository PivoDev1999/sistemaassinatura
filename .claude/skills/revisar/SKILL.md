---
name: revisar
description: Roda testes e lint e pede revisão ao agente code-reviewer das mudanças atuais, antes de um commit ou merge.
disable-model-invocation: true
---

1. Rode `git status` e descubra quais apps e pacotes mudaram.
2. Para cada app alterado, rode os testes (`pnpm --filter <app> test`) e o lint (`pnpm lint`). Mostre o resumo (passou/falhou).
3. Delegue ao agente `code-reviewer` a revisão das mudanças (`git diff main...HEAD`, ou `git diff` se estiver na `main`).
4. Mostre o resultado agrupado (🔴 🟡 🟢) e o veredito. Pergunte quais itens devo corrigir. **Não corrija nada sem a minha resposta.**
