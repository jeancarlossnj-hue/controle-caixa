from flask import Flask, request, jsonify, session, render_template
from bancodedados import criar_tabelas
criar_tabelas()
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

        cursor.execute("""
            INSERT INTO vendas (
                nome_cliente, telefone_cliente, descricao_produto, valor_total,
                forma_pagamento, valor_dinheiro, valor_cartao, valor_pix,
                valor_vale, garantia, data_venda, nome_vendedor
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            data['nome_cliente'], data['telefone_cliente'], data['descricao_produto'],
            data['valor_total'], data['forma_pagamento'], data['valor_dinheiro'],
            data['valor_cartao'], data['valor_pix'], data['valor_vale'],
            data['garantia'], data_venda, nome_vendedor
        ))

        conn.commit()
        conn.close()
        return jsonify({'mensagem': 'Venda registrada com sucesso!'}), 200

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
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, usuario, senha, cargo FROM usuarios;")
        rows = cur.fetchall()

        # ✅ Converter as linhas para dicionário (compatível com PostgreSQL)
        logins = []
        for row in rows:
            logins.append({
                "id": row[0],
                "usuario": row[1],
                "senha": row[2],
                "cargo": row[3]
            })

        cur.close()
        conn.close()

        return jsonify(logins)

    except Exception as e:
        print("❌ Erro ao buscar logins:", e)
        return jsonify({"erro": str(e)}), 500


# ===================================
# 🔹 OBTER VENDAS
# ===================================
@app.route('/obter_vendas', methods=['GET'])
def obter_vendas():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, nome_cliente, telefone_cliente, descricao_produto, forma_pagamento,
                    valor_total, COALESCE(custo_produto, '-') as custo_produto,
                    COALESCE(nome_vendedor, '-') as nome_vendedor,
                    data_venda, garantia
            FROM vendas ORDER BY data_venda DESC
        """)
        vendas = cursor.fetchall()
        conn.close()
        return jsonify(vendas), 200
    except Exception as e:
        return jsonify({"mensagem": f"Erro: {e}"}), 500


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
# 🔹 EXECUÇÃO DO SERVIDOR
# ===================================
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
