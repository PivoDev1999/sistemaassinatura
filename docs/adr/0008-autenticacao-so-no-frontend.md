# 0008. Autenticação só no frontend

- Status: Aceita
- Data: 2026-11-16
- Relacionado a: P-07, [EXTRA], RNF-01, ADR 0004

A spec não deixa P-07 pendente do professor: ela já recomenda que os endpoints "ficam abertos" e que o login proteja só o frontend. Por isso a decisão nasce Aceita.

## Contexto

A spec define a entidade `Usuario` (`usuario`, `senha`) e um único operador. A seção 8 [EXTRA] pede "Login" no painel, mas nenhum endpoint de login existe. A spec não diz onde o `Usuario` fica nem como autenticar. Os contratos [SPEC] não podem mudar.

## Decisão

- Os endpoints da spec continuam **abertos**. O login protege só o painel web.
- `Usuario` fica no **ServicoCadastramento**, no banco dele, com migration do Prisma no `schema.prisma` do serviço. A senha é guardada com **hash bcrypt**, nunca em texto.
- `POST /servcad/auth/login` é marcado **[EXTRA]**: fica fora dos contratos [SPEC] e é documentado no Swagger. Ele confere `usuario` e `senha` e responde 200 ou 401. Só o Next.js o chama.
- A sessão é do Next.js: após o login, o servidor do Next emite um **JWT assinado em cookie `httpOnly`** (`SameSite=Lax`, `Secure` em produção). O segredo de assinatura vem do `.env`.
- Um `middleware` do Next.js (App Router) verifica o cookie e redireciona para `/login` as rotas do painel sem sessão válida.
- O seed (idempotente, com `upsert`) cria um usuário de teste. Nome e senha vêm do `.env`, nunca do código. O `.env.example` traz só valores fictícios.

Por que o JWT fica no Next: o cookie `httpOnly` não é acessível por JavaScript do navegador (reduz o impacto de XSS). A verificação local no middleware dispensa chamar o backend a cada página, e o backend não precisa guardar estado de sessão.

## Alternativas consideradas

- **Proteger todas as APIs:** quebra os contratos [SPEC] e os apps e o banco não teriam como se autenticar (P-07). Descartada.
- **Serviço novo de login:** seria um quarto serviço, fora de "1 principal + 2 microsserviços", com banco e deploy extras para um único usuário. Descartada.
- **Usuário fixo no `.env`, sem tabela:** é mais simples, mas ignora a entidade `Usuario` da spec e o hash de senha. Descartada.
- **Sessão com ID guardado no servidor (Redis):** exige estado e mais código. Descartada pela simplicidade do JWT.

## Consequências

**Positivas:** contratos [SPEC] intactos; senha protegida por hash; sem serviço novo; sessão simples e testável.

**Negativas:** o ServicoCadastramento passa a ter uma rota [EXTRA] e uma tabela fora do domínio de assinaturas. O JWT não pode ser revogado antes de expirar (usar validade curta, por exemplo 8 h).

**Riscos aceitos:** todas as APIs ficam abertas. O ADR 0004 já aceitou isso para a rota interna; aqui vale para todas. Quem alcançar as portas HTTP pode chamar os endpoints sem login. A mitigação é de rede: Postgres, RabbitMQ e Redis publicados só em `127.0.0.1`, e o sistema roda localmente.

**Melhorias futuras:** autorização por papéis, refresh token, recuperação de senha, rate limit no login, autenticação entre serviços e nas APIs, caso a spec mude.

**Fora do escopo:** tudo o que está listado acima como melhoria futura. Também não há cadastro de usuários, pois a spec prevê um único operador.
