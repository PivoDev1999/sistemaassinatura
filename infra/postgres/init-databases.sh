#!/bin/sh
# Cria o banco do ServicoPagamentos. O banco "cadastro" e criado por POSTGRES_DB.
# Cada servico tem o seu proprio banco (RNF-01, ADR 0011).
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
  CREATE DATABASE pagamentos;
SQL
