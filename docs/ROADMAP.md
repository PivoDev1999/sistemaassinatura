# Roteiro — Sistema de Controle de Assinaturas

Marque `[x]` ao concluir. Use `/status` para saber onde parou e `/nova-feature <item>` para executar um item.

## Fase 0 — Documentação e decisões
- [x] Spec revisada (`docs/specs/sistema-assinaturas.md`)
- [x] `CLAUDE.md`, agentes e `.claude/settings.json`
- [x] Skills `/adr`, `/nova-feature`, `/revisar`, `/status`
- [ ] ADRs 1 a 4 (política de renovação, cache, broker, endpoint interno)
- [ ] ADRs 5 a 8 (datas, dinheiro, custo×custoMensal, autenticação)
- [ ] ADRs 9 a 14 (registros curtos)

## Fase 1 — Fundação
- [x] Monorepo pnpm, TypeScript strict, ESLint + Prettier na raiz
- [ ] Regra de dependência verificada por lint (domain/application sem framework)
- [ ] `packages/contracts` com DTOs dos endpoints e corpo dos eventos
- [ ] `docker-compose.yml`: PostgreSQL (bancos `cadastro` e `pagamentos`) feito; faltam RabbitMQ e Redis, portas em 127.0.0.1
- [x] Os 3 apps NestJS vazios com pastas da Clean Architecture, `/health` e Swagger
- [ ] `.env.example` e `README.md` inicial

## Fase 2 — ServicoCadastramento
- [x] Schema Prisma + migrations + seed (10 clientes, 5 apps, 5 assinaturas, usuário)
- [x] `GET /servcad/clientes` e `GET /servcad/aplicativos`
- [x] `PATCH /servcad/aplicativos/:idAplicativo`
- [ ] `POST /servcad/assinaturas` (RN-01, RN-07)
- [ ] `GET /servcad/assinaturas/:tipo`, `/asscli/:codcli`, `/assapp/:codapp` (RN-02)
- [ ] `GET /servcad/interno/vigencia/:codass`
- [ ] `POST /servcad/auth/login` [EXTRA]

## Fase 3 — ServicoPagamentos
- [ ] Schema Prisma + migrations
- [ ] `POST /registrarpagamento` (validação de dia/mes/ano)
- [ ] Publicação dos 2 eventos no RabbitMQ (messageId = código do pagamento)

## Fase 4 — Renovação por eventos (Cadastramento)
- [ ] `PoliticaRenovacao` (Strategy) + implementação inicial (RN-04, RN-05, RN-06)
- [ ] Consumidor de `PagamentoServicoCadastramento` com idempotência
- [ ] Fila de mensagens com falha (DLQ)

## Fase 5 — ServicoAssinaturasValidas
- [ ] `GET /assinvalidas/:codass` com cache Redis guardando `fimVigencia` + TTL (P-04, P-05, P-08)
- [ ] Consumidor de `PagamentoServicoAssinaturaValida` (invalidação)
- [ ] Rodando com 3 instâncias no Compose (RNF-03)

## Fase 6 — Frontend (Next.js) [EXTRA]
- [ ] Projeto Next.js + Tailwind + login
- [ ] Clientes e Aplicativos (edição de custo)
- [ ] Assinaturas (filtro, criação, por cliente, por aplicativo)
- [ ] Simulador do banco e Verificador de assinatura

## Fase 7 — Qualidade e entrega
- [ ] Teste e2e do fluxo completo: criar assinatura → pagar → eventos → cache atualizado
- [ ] README final, diagramas C4, AsyncAPI dos eventos
- [ ] GitHub Actions (lint + testes)
- [ ] Ensaio da apresentação
