import sqlite3

conn = sqlite3.connect('sistema_seguranca.db')
cursor = conn.cursor()

# ============================
#  Tabela de usuários
# ============================
cursor.execute('''
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_usuario TEXT NOT NULL,
    senha TEXT NOT NULL,
    funcao TEXT NOT NULL CHECK (funcao IN ('Funcionario', 'Gerente', 'Dono'))
)
''')
print("Tabela 'usuarios' criada com sucesso com a coluna 'funcao'.")

# ============================
#  Tabela de vendas (ATUALIZADA)
# ============================
cursor.execute('''
CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_cliente TEXT NOT NULL,
    telefone_cliente TEXT NOT NULL,
    descricao_produto TEXT NOT NULL,
    valor_total REAL NOT NULL,
    forma_pagamento TEXT NOT NULL,
    valor_dinheiro REAL,
    valor_cartao REAL,
    valor_pix REAL,
    valor_vale REAL,
    garantia INTEGER,
    data_venda TEXT,
    custo_produto REAL,           -- COLUNA ADICIONADA
    nome_vendedor TEXT            -- COLUNA ADICIONADA
)
''')
print("Tabela 'vendas' criada com sucesso.")

# ============================
#  Tabela de assistencias (ATUALIZADA)
# ============================
cursor.execute('''
CREATE TABLE IF NOT EXISTS assistencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_cliente TEXT NOT NULL,
    telefone_cliente TEXT NOT NULL,
    marca_aparelho TEXT NOT NULL,
    modelo_aparelho TEXT NOT NULL,
    descricao_defeito TEXT NOT NULL,
    servico_realizar TEXT NOT NULL,
    valor_servico REAL NOT NULL,
    forma_pagamento TEXT NOT NULL,
    valor_dinheiro REAL,
    valor_cartao REAL,
    valor_pix REAL,
    valor_vale REAL,
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
    data_cadastro TEXT NOT NULL,
    id_funcionario INTEGER,
    status TEXT DEFAULT 'pendente',
    data_conclusao TEXT,
    observacoes TEXT,
    custo_servico REAL,           -- COLUNA ADICIONADA
    nome_vendedor TEXT,           -- COLUNA ADICIONADA
    FOREIGN KEY(id_funcionario) REFERENCES usuarios(id)
)
''')
print("Tabela 'assistencias' criada com sucesso.")

# ============================
#  Tabela de saídas
# ============================
cursor.execute('''
CREATE TABLE IF NOT EXISTS saidas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    motivo TEXT NOT NULL,
    valor REAL NOT NULL,
    data DATE NOT NULL,
    funcionario TEXT NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)''')
print("Tabela 'saidas' criada com sucesso.")

# Salvar alterações e fechar conexão
conn.commit()
conn.close()