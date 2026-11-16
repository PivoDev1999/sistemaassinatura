# 0009. Clean Architecture e regra de dependência

- Status: Aceita
- Data: 2026-11-16
- Relacionado a: ADR 0001 (política de renovação como Strategy), seção de estrutura do CLAUDE.md

## Contexto

Os três serviços NestJS precisam de regras de negócio testáveis sem banco, sem broker e sem framework. A ADR 0001 já depende disso: a `PoliticaRenovacao` é uma interface do domínio, e trocar a regra deve mexer em uma classe e na configuração. Sem uma regra de dependência explícita, o código tende a misturar Prisma e decorators do Nest com as regras.

## Decisão

Cada serviço segue quatro camadas em `src/`: `domain/`, `application/`, `infrastructure/` e `presentation/`.

- `domain/` é TypeScript puro: não importa `@nestjs/*`, Prisma, Redis nem RabbitMQ.
- `application/` importa só de `domain/` (um caso de uso por classe, mais portas e DTOs).
- `infrastructure/` e `presentation/` dependem de `application/` e `domain/`, nunca o contrário.
- A ligação entre interface e implementação acontece só nos `*.module.ts`, com tokens de injeção.
- Controllers são finos: validam a entrada, chamam um único caso de uso e mapeiam a saída para o contrato da spec.

## Alternativas consideradas

- **NestJS em camadas por módulo (controller, service, repository):** é o padrão do framework e mais rápido de começar, mas o service acaba importando Prisma e o domínio fica acoplado à infraestrutura. Descartada.
- **Arquitetura hexagonal livre, sem camadas fixas:** dá flexibilidade, mas sem pastas e regra definidas a disciplina se perde. Descartada pela falta de uma regra verificável.

## Consequências

- Positivas: domínio e casos de uso testados com repositórios em memória; trocar Prisma, Redis ou broker não toca as regras.
- Negativas: mais arquivos, interfaces e mapeamentos do que um CRUD direto.
- Riscos aceitos: a regra depende de revisão de código, pois o TypeScript não a impede sozinho.
- Melhoria futura: impor a regra com lint (por exemplo, restrição de imports por pasta).
