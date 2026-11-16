import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../src/infrastructure/prisma/generated/client.js';
import { aplicativos, clientes, montarAssinaturas } from '../src/infrastructure/seed/seed-data.js';

function exigir(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variavel de ambiente ${nome} nao definida (veja .env.example)`);
  return valor;
}

// Dia de calendario de hoje em America/Sao_Paulo (RN-08).
const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const dia = (valor: string) => new Date(`${valor}T00:00:00Z`);

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: exigir('CADASTRAMENTO_DATABASE_URL') }),
});

async function main() {
  for (const c of clientes) {
    await prisma.cliente.upsert({ where: { codigo: c.codigo }, update: { nome: c.nome, email: c.email }, create: c });
  }
  for (const a of aplicativos) {
    await prisma.aplicativo.upsert({ where: { codigo: a.codigo }, update: { nome: a.nome, custoMensal: a.custoMensal }, create: a });
  }
  const assinaturas = montarAssinaturas(hoje);
  for (const s of assinaturas) {
    const dados = { codCli: s.codCli, codApp: s.codApp, inicioVigencia: dia(s.inicioVigencia), fimVigencia: dia(s.fimVigencia) };
    // update vazio: o seed so cria. Nao sobrescreve vigencias renovadas por pagamento (RN-03).
    await prisma.assinatura.upsert({ where: { codigo: s.codigo }, update: {}, create: { codigo: s.codigo, ...dados } });
  }
  const senhaHash = await bcrypt.hash(exigir('SEED_SENHA'), 12);
  const usuario = exigir('SEED_USUARIO');
  await prisma.usuario.upsert({ where: { usuario }, update: { senhaHash }, create: { usuario, senhaHash } });

  // Nomes de tabela sao constantes (sem entrada externa), entao nao ha risco de injecao.
  // Codigos foram inseridos explicitamente: alinha as sequences para os proximos INSERTs nao colidirem.
  for (const tabela of ['cliente', 'aplicativo', 'assinatura']) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${tabela}"', 'codigo'), (SELECT MAX(codigo) FROM "${tabela}"))`,
    );
  }
  console.log(`Seed ok: ${clientes.length} clientes, ${aplicativos.length} aplicativos, ${assinaturas.length} assinaturas`);
}

main()
  .catch((erro: unknown) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
