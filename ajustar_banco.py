import psycopg2

# 🔧 Substitua pela sua string de conexão do Railway
DATABASE_URL = "postgresql://usuario:senha@containers-us-west-XX.railway.app:XXXX/railway"

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    print("🧩 Adicionando coluna forma_pagamento...")
    cur.execute("ALTER TABLE assistencias ADD COLUMN IF NOT EXISTS forma_pagamento TEXT;")

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Coluna adicionada com sucesso!")

except Exception as e:
    print("❌ Erro ao modificar tabela:", e)
