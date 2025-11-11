from app import get_connection

def migrar_tabela_assistencias():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            ALTER TABLE assistencias
                ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50),
                ADD COLUMN IF NOT EXISTS custo_servico DECIMAL(10,2),
                ALTER COLUMN status SET DEFAULT 'pendente';
        """)
        conn.commit()
        cur.close()
        conn.close()
        print("✅ Migração executada com sucesso! Colunas atualizadas.")
    except Exception as e:
        print("❌ Erro ao migrar:", e)

if __name__ == "__main__":
    migrar_tabela_assistencias()
