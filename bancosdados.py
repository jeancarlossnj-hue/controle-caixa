import os

import psycopg2

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set.")


def main():
    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS usuarios (
                    id SERIAL PRIMARY KEY,
                    nome_usuario TEXT NOT NULL,
                    senha TEXT NOT NULL,
                    funcao TEXT NOT NULL CHECK (funcao IN ('Funcionario', 'Gerente', 'Dono'))
                )
                """
            )
            print("Tabela 'usuarios' pronta.")

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS vendas (
                    id SERIAL PRIMARY KEY,
                    nome_cliente TEXT NOT NULL,
                    telefone_cliente TEXT NOT NULL,
                    descricao_produto TEXT NOT NULL,
                    valor_total NUMERIC NOT NULL,
                    forma_pagamento TEXT NOT NULL,
                    valor_dinheiro NUMERIC,
                    valor_cartao NUMERIC,
                    valor_pix NUMERIC,
                    valor_vale NUMERIC,
                    garantia INTEGER,
                    data_venda TIMESTAMP,
                    custo_produto NUMERIC,
                    nome_vendedor TEXT
                )
                """
            )
            print("Tabela 'vendas' pronta.")

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS assistencias (
                    id SERIAL PRIMARY KEY,
                    nome_cliente TEXT NOT NULL,
                    telefone_cliente TEXT NOT NULL,
                    marca_aparelho TEXT NOT NULL,
                    modelo_aparelho TEXT NOT NULL,
                    descricao_defeito TEXT NOT NULL,
                    servico_realizar TEXT NOT NULL,
                    valor_servico NUMERIC NOT NULL,
                    forma_pagamento TEXT NOT NULL,
                    valor_dinheiro NUMERIC,
                    valor_cartao NUMERIC,
                    valor_pix NUMERIC,
                    valor_vale NUMERIC,
                    periodo_garantia INTEGER NOT NULL,
                    aparelho_liga TEXT,
                    tela_quebrada TEXT,
                    exibe_imagem TEXT,
                    camera_funciona TEXT,
                    wifi_bluetooth TEXT,
                    som_funciona TEXT,
                    botoes_funcionam TEXT,
                    dano_liquido TEXT,
                    outra_assistencia TEXT,
                    gaveta_sim TEXT,
                    com_capinha TEXT,
                    data_cadastro TIMESTAMP NOT NULL,
                    id_funcionario INTEGER,
                    status TEXT DEFAULT 'pendente',
                    data_conclusao TIMESTAMP,
                    observacoes TEXT,
                    custo_servico NUMERIC,
                    nome_vendedor TEXT,
                    CONSTRAINT fk_assistencias_usuarios FOREIGN KEY (id_funcionario) REFERENCES usuarios(id)
                )
                """
            )
            print("Tabela 'assistencias' pronta.")

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS saidas (
                    id SERIAL PRIMARY KEY,
                    motivo TEXT NOT NULL,
                    valor NUMERIC NOT NULL,
                    data DATE NOT NULL,
                    funcionario TEXT NOT NULL,
                    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            print("Tabela 'saidas' pronta.")
if __name__ == "__main__":
    main()
