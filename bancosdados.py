import os
import psycopg2
from psycopg2 import sql

# ================================
# 🔹 CONEXÃO COM O BANCO DE DADOS
# ================================
def get_connection():
    """Retorna uma conexão PostgreSQL via variável de ambiente DATABASE_URL"""
    DATABASE_URL = os.getenv("DATABASE_URL")

    if not DATABASE_URL:
        raise Exception("❌ A variável DATABASE_URL não foi encontrada!")
    return psycopg2.connect(DATABASE_URL)


# ================================
# 🔹 CRIAÇÃO DAS TABELAS
# ================================
def criar_tabelas():
    conn = get_connection()
    cur = conn.cursor()

    # ================================
    # 🧩 Tabela de usuários
    # ================================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome_usuario VARCHAR(100) NOT NULL UNIQUE,
            senha VARCHAR(100) NOT NULL,
            funcao VARCHAR(50) NOT NULL
        );
    """)

    # ================================
    # 🧾 Tabela de vendas
    # ================================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS vendas (
            id SERIAL PRIMARY KEY,
            nome_cliente VARCHAR(100),
            telefone_cliente VARCHAR(50),
            descricao_produto TEXT,
            valor_total DECIMAL(10, 2),
            forma_pagamento VARCHAR(50),
            valor_dinheiro DECIMAL(10, 2),
            valor_cartao DECIMAL(10, 2),
            valor_pix DECIMAL(10, 2),
            valor_vale DECIMAL(10, 2),
            custo_produto DECIMAL(10, 2),
            garantia VARCHAR(50),
            data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            nome_vendedor VARCHAR(100)
        );
    """)

    # ================================
    # 🔧 Tabela de assistências
    # ================================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS assistencias (
            id SERIAL PRIMARY KEY,
            nome_cliente VARCHAR(100),
            telefone_cliente VARCHAR(50),
            marca_aparelho VARCHAR(50),
            modelo_aparelho VARCHAR(50),
            descricao_defeito TEXT,
            servico_realizado TEXT,
            valor_servico DECIMAL(10, 2),
            garantia VARCHAR(50),
            status VARCHAR(50) DEFAULT 'Em andamento',
            nome_vendedor VARCHAR(100),
            data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # ================================
    # 💸 Tabela de saídas
    # ================================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS saidas (
            id SERIAL PRIMARY KEY,
            descricao_saida TEXT NOT NULL,
            valor_saida DECIMAL(10, 2) NOT NULL,
            data_saida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            nome_vendedor VARCHAR(100)
        );
    """)

    conn.commit()
    conn.close()
    print("✅ Tabelas criadas com sucesso no PostgreSQL!")


if __name__ == "__main__":
    criar_tabelas()
