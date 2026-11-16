# 0014. Seed idempotente e Docker Compose

- Status: Aceita
- Data: 2026-11-16
- Relacionado a: RNF-04, RNF-05, ADR 0011, seções Banco de dados e Segurança do CLAUDE.md

## Contexto

O RNF-04 ([SPEC]) exige um script de inicialização com pelo menos 10 clientes, 5 aplicativos e 5 assinaturas. O RNF-05 ([DECISÃO]) pede que tudo suba localmente com um `docker compose up`. O ambiente é Linux, com Postgres, RabbitMQ e Redis, e o repositório não pode guardar segredos.

## Decisão

- **Seed do Cadastramento** com `upsert` e códigos fixos, então pode rodar várias vezes sem duplicar. Cria pelo menos 10 clientes, 5 aplicativos e 5 assinaturas. Roda com `prisma db seed`.
- **Docker Compose** sobe a infraestrutura e os serviços. As portas de Postgres, RabbitMQ e Redis são publicadas só em `127.0.0.1`. Imagens com versão fixa (sem `latest`, sem `^`). As migrations rodam antes de o serviço iniciar. Senhas e URLs vêm do `.env`, e só o `.env.example` vai para o Git.

## Alternativas consideradas

- **Seed com `insert` simples:** duplica registros ou falha ao repetir, e quebra a repetibilidade. Descartada.
- **Portas em `0.0.0.0`:** expõe banco, broker e cache à rede local. Descartada por segurança.
- **Imagens `latest`:** o ambiente muda sem aviso entre execuções. Descartada.

## Consequências

- Positivas: ambiente reproduzível com um comando; seed pode ser repetido sem limpar o banco; nenhuma porta de infraestrutura exposta fora da máquina.
- Negativas: os códigos fixos precisam ser mantidos junto com o seed; atualizar versões de imagem é manual.
- Riscos aceitos: o `upsert` sobrescreve os dados do seed se alguém os alterar à mão.
- Melhoria futura: a estratégia de testes (unitários sem banco, e2e com Supertest) poderia virar uma ADR própria.
