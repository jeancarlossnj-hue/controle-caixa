from flask import Flask, request, jsonify, session, render_template
from bancosdados import criar_tabelas
from flask_cors import CORS
from datetime import datetime
from functools import wraps
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import sqlite3

print("🔍 DATABASE_URL carregada:", os.getenv("DATABASE_URL"))


# ===================================
# 🔹 CONFIGURAÇÃO INICIAL DO FLASK
# ===================================
app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.getenv("SECRET_KEY", "sua_chave_super_segura")
CORS(app, supports_credentials=True)
criar_tabelas()
# ===================================
# 🔹 CONEXÃO COM O BANCO POSTGRESQL (RAILWAY)
# ===================================
DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    """Retorna conexão com PostgreSQL"""
    if not DATABASE_URL:
        raise Exception("❌ Variável DATABASE_URL não configurada no Railway!")
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

# ===================================
# 🔹 ROTA PRINCIPAL
# ===================================
@app.route('/')
def index():
    return render_template('index.html')

# ===================================
# 🔹 TESTE DE CONEXÃO AO BANCO
# ===================================
@app.route('/test_db')
def test_db():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT NOW();")
        data = cur.fetchone()

        # ✅ converte o timestamp em string JSON compatível
        timestamp = str(list(data.values())[0]) if isinstance(data, dict) else str(data[0])

        cur.close()
        conn.close()
        return jsonify({"status": "ok", "timestamp": timestamp})
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)})


# Página inicial
@app.route('/')
@app.route('/index')
@app.route('/index.html')
def index_page():
    return render_template('index.html')

# Página de login
@app.route('/login')
@app.route('/login.html')
def login_page():
    return render_template('login.html')

# Página do dashboard
@app.route('/dashboard')
@app.route('/dashboard.html')
def dashboard_page():
    return render_template('dashboard.html')

# Tabelas e telas secundárias
@app.route('/tbassistencia')
@app.route('/tbassistencia.html')
def tbassistencia_page():
    return render_template('tbassistencia.html')

@app.route('/tbvendas')
@app.route('/tbvendas.html')
def tbvendas_page():
    return render_template('tbvendas.html')

@app.route('/tbsaidas')
@app.route('/tbsaidas.html')
def tbsaidas_page():
    return render_template('tbsaidas.html')

@app.route('/tblogin')
@app.route('/tblogin.html')
def tblogin_page():
    return render_template('tblogin.html')


# ===================================
#    DECORADOR DE LOGIN
# ===================================
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Não autorizado"}), 401
        return f(*args, **kwargs)
    return decorated_function




# ===================================
# 🔹 ROTA DE LOGIN PADRÃO
# ===================================
@app.route("/login_default", methods=["POST"])
def login_default():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    SENHA_PADRAO = "admin123"

    if username.lower() == "admin" and password == SENHA_PADRAO:
        session["user_id"] = 0
        session["username"] = "Administrador"
        session["is_default"] = True
        return jsonify({"success": True, "username": "Administrador", "is_default": True})

    return jsonify({"success": False, "message": "Credenciais inválidas"}), 401


# ===================================
# 🔹 REGISTRAR VENDA
# ===================================
@app.route('/registrar_venda', methods=['POST', 'OPTIONS'])
def registrar_venda():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

    try:
        data = request.get_json()
        conn = get_connection()
        cursor = conn.cursor()

        nome_vendedor = data.get('nome_vendedor') or session.get('username', 'Desconhecido')
        data_venda = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # 🔹 Inserir a venda SEM custo (NULL)
        cursor.execute("""
            INSERT INTO vendas (
                nome_cliente, telefone_cliente, descricao_produto, valor_total,
                forma_pagamento, valor_dinheiro, valor_cartao, valor_pix,
                valor_vale, garantia, data_venda, nome_vendedor, custo_produto
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NULL)
        """, (
            data['nome_cliente'], data['telefone_cliente'], data['descricao_produto'],
            data['valor_total'], data['forma_pagamento'], data['valor_dinheiro'],
            data['valor_cartao'], data['valor_pix'], data['valor_vale'],
            data['garantia'], data_venda, nome_vendedor
        ))

        conn.commit()
        conn.close()
        return jsonify({'mensagem': 'Venda registrada como pendente com sucesso!'}), 200

    except Exception as e:
        print(f"Erro ao registrar venda: {str(e)}")
        return jsonify({'mensagem': f'Erro: {str(e)}'}), 500


# ===================================
# 🔹 ATUALIZAR CUSTO DE PRODUTO
# ===================================
@app.route('/atualizar_custo/<int:id>', methods=['PUT'])
def atualizar_custo(id):
    try:
        data = request.get_json()
        custo = data.get('custo')
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("UPDATE vendas SET custo_produto = %s WHERE id = %s", (custo, id))
        conn.commit()
        conn.close()
        return jsonify({"mensagem": "Custo atualizado com sucesso!"})
    except Exception as e:
        return jsonify({"mensagem": f"Erro: {e}"}), 500

@app.route('/obter_logins', methods=['GET'])
def obter_logins():
    import traceback
    import psycopg2.extras

    try:
        print("🟡 Iniciando leitura de usuários...")
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        print("🟢 Conexão estabelecida com sucesso!")

        cur.execute("SELECT id, nome_usuario, senha, funcao FROM usuarios")
        rows = cur.fetchall()
        print(f"📋 {len(rows)} usuários encontrados.")

        logins = []
        for r in rows:
            logins.append({
                "id": r.get("id"),
                "usuario": r.get("nome_usuario"),
                "senha": r.get("senha"),
                "cargo": r.get("funcao")
            })

        cur.close()
        conn.close()
        print("✅ Logins retornados com sucesso.")
        return jsonify(logins)

    except Exception as e:
        print("❌ Erro ao buscar logins:", e)
        traceback.print_exc()
        return jsonify({"erro": str(e)}), 500



# ===================================
# 🔹 OBTER VENDAS
# ===================================
@app.route('/obter_vendas', methods=['GET'])
def obter_vendas():
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)  # ✅ retorna dicts

        cur.execute("""
        SELECT id, nome_cliente, telefone_cliente, descricao_produto, forma_pagamento,
            valor_total, custo_produto,
            COALESCE(nome_vendedor, '-') as nome_vendedor,
            data_venda, COALESCE(garantia, '30') as garantia
        FROM vendas
        ORDER BY data_venda DESC
        """)

        vendas = cur.fetchall()

        cur.close()
        conn.close()
        return jsonify(vendas), 200

    except Exception as e:
        print("❌ Erro ao obter vendas:", e)
        return jsonify({"mensagem": f"Erro: {e}"}), 500



# ===================================
# 🔹 EDITAR VENDA
# ===================================
@app.route('/editar_venda/<int:id>', methods=['PUT'])
def editar_venda(id):
    try:
        data = request.get_json()
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE vendas
            SET nome_cliente=%s, telefone_cliente=%s, descricao_produto=%s,
                valor_total=%s, forma_pagamento=%s, valor_dinheiro=%s,
                valor_cartao=%s, valor_pix=%s, valor_vale=%s,
                garantia=%s, custo_produto=%s, nome_vendedor=%s
            WHERE id=%s
        """, (
            data.get('nome_cliente'), data.get('telefone_cliente'),
            data.get('descricao_produto'), data.get('valor_total'),
            data.get('forma_pagamento'), data.get('valor_dinheiro'),
            data.get('valor_cartao'), data.get('valor_pix'),
            data.get('valor_vale'), data.get('garantia'),
            data.get('custo_produto'), data.get('nome_vendedor'),
            id
        ))

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"mensagem": "Venda atualizada com sucesso!"}), 200

    except Exception as e:
        print("❌ Erro ao editar venda:", e)
        return jsonify({"mensagem": f"Erro: {e}"}), 500


# ===================================
# 🔹 EXCLUIR VENDA
# ===================================
@app.route('/excluir_venda/<int:id>', methods=['DELETE'])
def excluir_venda(id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM vendas WHERE id = %s", (id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"mensagem": "Venda excluída com sucesso!"}), 200
    except Exception as e:
        print("❌ Erro ao excluir venda:", e)
        return jsonify({"mensagem": f"Erro: {e}"}), 500



# ===================================
# 🔹 OBTER VENDEDORES (para selects e modais)
# ===================================
@app.route('/obter_vendedores', methods=['GET'])
def obter_vendedores():
    import traceback
    import psycopg2.extras

    try:
        print("🟡 Buscando vendedores cadastrados...")
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Busca apenas o nome dos usuários cadastrados
        cur.execute("SELECT nome_usuario FROM usuarios ORDER BY nome_usuario ASC")
        rows = cur.fetchall()

        vendedores = [r["nome_usuario"] for r in rows if r.get("nome_usuario")]

        cur.close()
        conn.close()
        print(f"✅ {len(vendedores)} vendedores retornados.")
        return jsonify(vendedores), 200

    except Exception as e:
        print("❌ Erro ao buscar vendedores:", e)
        traceback.print_exc()
        return jsonify({"erro": str(e)}), 500


# ===================================
# 🔹 REGISTRAR ASSISTÊNCIA
# ===================================
@app.route('/registrar_assistencia', methods=['POST'])
def registrar_assistencia():
    try:
        data = request.get_json()
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO assistencias (
                nome_cliente, telefone_cliente, marca_aparelho, modelo_aparelho,
                descricao_defeito, servico_realizado, valor_servico, forma_pagamento,
                garantia, nome_vendedor, status, data_registro
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'pendente', NOW())
        """, (
            data.get('nome_cliente'),
            data.get('telefone_cliente'),
            data.get('marca_aparelho'),
            data.get('modelo_aparelho'),
            data.get('descricao_defeito'),
            data.get('servico_realizado'),
            data.get('valor_servico'),
            data.get('forma_pagamento'),
            data.get('garantia'),
            data.get('nome_vendedor')
        ))

        conn.commit()
        cur.close(); conn.close()
        return jsonify({'sucesso': True, 'mensagem': 'Assistência registrada (pendente).'}), 200
    except Exception as e:
        print(f"❌ Erro ao registrar assistência: {e}")
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500


# ===================================
# 🔹 OBTER ASSISTÊNCIAS
# ===================================
@app.route('/obter_assistencias', methods=['GET'])
def obter_assistencias():
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT id, nome_cliente, telefone_cliente, marca_aparelho, modelo_aparelho,
                   descricao_defeito, servico_realizado, valor_servico, forma_pagamento,
                   garantia, nome_vendedor, custo_servico,
                   CASE WHEN custo_servico IS NULL THEN 'pendente' ELSE 'concluido' END AS status,
                   data_registro
            FROM assistencias
            ORDER BY data_registro DESC
        """)
        assistencias = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(assistencias), 200
    except Exception as e:
        print(f"❌ Erro ao obter assistências: {e}")
        return jsonify({'mensagem': f'Erro: {e}'}), 500


# ===================================
# 🔹 ATUALIZAR CUSTO (MODAL)
# ===================================
@app.route('/atualizar_custo_assistencia/<int:id>', methods=['PUT'])
def atualizar_custo_assistencia(id):
    try:
        data = request.get_json()
        custo = data.get('custo_servico')
        conn = get_connection(); cur = conn.cursor()
        cur.execute("""
            UPDATE assistencias
                SET custo_servico = %s,
                    status = 'concluido'
                WHERE id = %s
        """, (custo, id))
        conn.commit(); cur.close(); conn.close()
        return jsonify({'mensagem': 'Custo salvo. Assistência concluída!'}), 200
    except Exception as e:
        print("❌ Erro ao atualizar custo:", e)
        return jsonify({'mensagem': f'Erro: {e}'}), 500


# ===================================
# 🔹 EDITAR ASSISTÊNCIA
# ===================================
@app.route('/editar_assistencia/<int:id>', methods=['PUT'])
def editar_assistencia(id):
    try:
        data = request.get_json()
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE assistencias
            SET nome_cliente=%s, telefone_cliente=%s, marca_aparelho=%s,
                modelo_aparelho=%s, descricao_defeito=%s, servico_realizado=%s,
                valor_servico=%s, forma_pagamento=%s, garantia=%s, nome_vendedor=%s
            WHERE id=%s
        """, (
            data.get('nome_cliente'), data.get('telefone_cliente'),
            data.get('marca_aparelho'), data.get('modelo_aparelho'),
            data.get('descricao_defeito'), data.get('servico_realizado'),
            data.get('valor_servico'), data.get('forma_pagamento'),
            data.get('garantia'), data.get('nome_vendedor'), id
        ))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'mensagem': 'Assistência atualizada com sucesso!'}), 200
    except Exception as e:
        print(f"❌ Erro ao editar assistência: {e}")
        return jsonify({'mensagem': f'Erro: {e}'}), 500


# ===================================
# 🔹 EXCLUIR ASSISTÊNCIA
# ===================================
@app.route('/excluir_assistencia/<int:id>', methods=['DELETE'])
def excluir_assistencia(id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM assistencias WHERE id = %s", (id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'mensagem': 'Assistência excluída com sucesso!'}), 200
    except Exception as e:
        print(f"❌ Erro ao excluir assistência: {e}")
        return jsonify({'mensagem': f'Erro: {e}'}), 500



# ===================================
# 🔹 CADASTRAR USUÁRIO
# ===================================
@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()
    usuario = data['registro_usuario']
    senha = data['registro_senha']
    funcao = data['registro_funcao']

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM usuarios WHERE nome_usuario = %s", (usuario,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'message': 'Usuário já existe.'}), 400

        cursor.execute("""
            INSERT INTO usuarios (nome_usuario, senha, funcao)
            VALUES (%s, %s, %s)
        """, (usuario, senha, funcao))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Usuário registrado com sucesso.'}), 201

    except Exception as e:
        return jsonify({'message': f'Erro: {e}'}), 500
    
        

# ===================================
# 🔹 LOGIN DO USUÁRIO
# ===================================
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"success": False, "message": "Preencha usuário e senha"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, nome_usuario, funcao 
            FROM usuarios 
            WHERE nome_usuario = %s AND senha = %s
        """, (username, password))

        user = cursor.fetchone()
        conn.close()

        if not user:
            return jsonify({"success": False, "message": "Usuário ou senha incorretos."}), 401

        # Lida tanto com dict quanto com tupla
        user_id = user["id"] if isinstance(user, dict) else user[0]
        user_name = user["nome_usuario"] if isinstance(user, dict) else user[1]
        user_funcao = user["funcao"] if isinstance(user, dict) else user[2]

        session["user_id"] = user_id
        session["username"] = user_name
        session["funcao"] = user_funcao

        return jsonify({
            "success": True,
            "username": user_name,
            "cargo": user_funcao
        }), 200

    except Exception as e:
        print(f"❌ Erro ao fazer login: {e}")
        return jsonify({"success": False, "message": f"Erro no servidor: {e}"}), 500



# ===================================
# 🔹 LOGOUT
# ===================================
@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})


# ===================================
# 🔹 VERIFICAR CARGO
# ===================================
@app.route("/verificar_cargo", methods=["GET"])
def verificar_cargo():
    if "username" not in session:
        return jsonify({"success": False, "mensagem": "Usuário não autenticado"}), 401

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT funcao FROM usuarios WHERE nome_usuario = %s", (session["username"],))
    result = cursor.fetchone()
    conn.close()

    if result:
        cargo = result["funcao"] if isinstance(result, dict) else result[0]
        return jsonify({"success": True, "cargo": cargo})
    return jsonify({"success": False, "mensagem": "Usuário não encontrado"}), 404


# ===================================
# 🔹 REGISTRAR SAÍDA
# ===================================
@app.route('/registrar_saida', methods=['POST'])
def registrar_saida():
    try:
        data = request.get_json()
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO saidas (descricao_saida, valor_saida, data_saida, nome_vendedor)
            VALUES (%s, %s, %s, %s)
        """, (
            data.get('motivo'),
            data.get('valor'),
            data.get('data'),
            data.get('funcionario')
        ))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'mensagem': 'Saída registrada com sucesso!'}), 200

    except Exception as e:
        print(f"❌ Erro ao registrar saída: {e}")
        return jsonify({'mensagem': f'Erro: {e}'}), 500



@app.route('/obter_saidas', methods=['GET'])
def obter_saidas():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, descricao_saida, valor_saida, data_saida, nome_vendedor
            FROM saidas
            ORDER BY data_saida DESC
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        saidas = [
            {
                "id": r[0],
                "descricao_saida": r[1],
                "valor_saida": float(r[2]),
                "data_saida": str(r[3]),
                "nome_vendedor": r[4]
            }
            for r in rows
        ]

        return jsonify(saidas), 200
    except Exception as e:
        print("❌ Erro ao buscar saídas:", e)
        return jsonify({"erro": str(e)}), 500


# ===================================
# 🔹 EXECUÇÃO E CRIAÇÃO DE TABELAS
# ===================================

@app.route("/init_db")
def init_db():
    try:
        from bancosdados import criar_tabelas
        criar_tabelas()
        return jsonify({
            "status": "sucesso",
            "mensagem": "✅ Tabelas criadas/verificadas com sucesso no PostgreSQL!"
        })
    except Exception as e:
        return jsonify({
            "status": "erro",
            "mensagem": str(e)
        })

@app.route('/editar_usuarios/<int:id>', methods=['PUT'])
def editar_usuario(id):
    import traceback
    import psycopg2.extras
    try:
        data = request.get_json()
        nome_usuario = data.get('nome_usuario')
        senha = data.get('senha')
        funcao = data.get('funcao')

        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            UPDATE usuarios
            SET nome_usuario = %s,
                senha = %s,
                funcao = %s
            WHERE id = %s
            RETURNING id;
        """, (nome_usuario, senha, funcao, id))

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "✅ Usuário atualizado com sucesso!"})

    except Exception as e:
        print("❌ Erro ao editar usuário:", e)
        traceback.print_exc()
        return jsonify({"erro": str(e)}), 500

@app.route('/usuarios/<int:id>', methods=['DELETE'])
def excluir_usuario(id):
    import traceback
    import psycopg2.extras
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("DELETE FROM usuarios WHERE id = %s RETURNING id;", (id,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if deleted:
            return jsonify({"message": "✅ Usuário excluído com sucesso!"})
        else:
            return jsonify({"message": "⚠️ Usuário não encontrado."}), 404

    except Exception as e:
        print("❌ Erro ao excluir usuário:", e)
        traceback.print_exc()
        return jsonify({"erro": str(e)}), 500


# ===================================
# 🔹 EXECUÇÃO DO SERVIDOR
# ===================================
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
