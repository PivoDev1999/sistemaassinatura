# 0010. Monorepo pnpm e packages/contracts

- Status: Aceita
- Data: 2026-11-16
- Relacionado a: RNF-01, ADR 0003 (broker e eventos), ADR 0007 (`custo` x `custoMensal`)

## Contexto

O sistema tem três serviços NestJS e um painel Next.js que trocam JSON em HTTP e eventos pelo broker. Rotas, campos e corpos de evento são [SPEC] e precisam ser idênticos dos dois lados. A ADR 0003 fixa o corpo dos eventos e a ADR 0007 isola o mapeamento de `custo` e `custoMensal`; ambos precisam de um lugar comum para os tipos.

## Decisão

Um monorepo com pnpm workspaces: `apps/` para os quatro aplicativos e `packages/contracts` para os tipos compartilhados. O pacote guarda os DTOs dos endpoints e os corpos dos eventos, e só isso. Não leva regra de negócio, entidades do domínio, clientes Prisma nem código de infraestrutura. Cada app o consome como dependência do workspace. Versões fixadas no `package.json`.

## Alternativas consideradas

- **Repositórios separados por serviço:** isolam mais, mas exigem publicar e versionar pacotes, e aumentam o esforço para um trabalho acadêmico com um único desenvolvedor. Descartada.
- **Contratos duplicados em cada serviço:** não cria dependência, mas os tipos divergem sem aviso e quebram o contrato da spec. Descartada.

## Consequências

- Positivas: uma única definição dos contratos; o compilador acusa divergência entre produtor, consumidor e painel; um `pnpm install` e um conjunto de comandos para tudo.
- Negativas: acoplamento de versão dos tipos de evento. Mudar o corpo de um evento exige atualizar produtor e consumidores juntos.
- Riscos aceitos: o RNF-01 continua valendo. Só tipos são compartilhados, nunca o banco nem o acesso a ele. Se o pacote crescer com lógica, esse limite se perde.
- Melhoria futura: versionar os eventos, se algum dia os serviços forem implantados de forma independente.
