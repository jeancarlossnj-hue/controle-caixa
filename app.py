from flask import Flask, request, jsonify, session, send_file, send_from_directory
from flask_cors import CORS
from datetime import datetime
import sqlite3
import os
from functools import wraps

app = Flask(__name__)
app.secret_key = "sua_chave_super_segura"  # troque por algo forte
CORS(app, supports_credentials=True)

# Rota para login com senha padrão (fallback)
@app.route("/login_default", methods=["POST"])
def login_default():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    # Senha padrão - você pode alterar aqui
    SENHA_PADRAO = "admin123"
    
    if username.lower() == "admin" and password == SENHA_PADRAO:
        session["user_id"] = 0  # ID especial para usuário padrão
        session["username"] = "Administrador"
        session["is_default"] = True
        return jsonify({
            "success": True, 
            "username": "Administrador",
            "is_default": True
        })
    
    return jsonify({"success": False, "message": "Credenciais padrão inválidas"}), 401


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Não autorizado"}), 401
        return f(*args, **kwargs)
    return decorated_function

# --- REGISTRAR VENDA ---
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
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()

        # Obter o nome do vendedor da sessão ou dos dados da requisição
        nome_vendedor = data.get('nome_vendedor')
        if not nome_vendedor and 'username' in session:
            nome_vendedor = session['username']

        # SEMPRE usar data e hora atual (não confiar no frontend)
        data_venda = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"Registrando venda com data: {data_venda}")  # Para debug

        cursor.execute('''
            INSERT INTO vendas (
                nome_cliente,
                telefone_cliente,
                descricao_produto,
                valor_total,
                forma_pagamento,
                valor_dinheiro,
                valor_cartao,
                valor_pix,
                valor_vale,
                garantia,
                data_venda,
                nome_vendedor
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['nome_cliente'],
            data['telefone_cliente'],
            data['descricao_produto'],
            data['valor_total'],
            data['forma_pagamento'],
            data['valor_dinheiro'],
            data['valor_cartao'],
            data['valor_pix'],
            data['valor_vale'],
            data['garantia'],
            data_venda,  # Usar sempre a data do servidor
            nome_vendedor
        ))

        conn.commit()
        conn.close()
        return jsonify({'mensagem': 'Venda registrada com sucesso!'})
    
    except Exception as e:
        print(f"Erro ao registrar venda: {str(e)}")  # Para debug
        return jsonify({'mensagem': f'Erro: {str(e)}'}), 500

# --- ATUALIZAR CUSTO ---
@app.route('/atualizar_custo/<int:id>', methods=['PUT'])
def atualizar_custo(id):
    try:
        data = request.get_json()
        custo = data.get('custo')
        if custo is None:
            return jsonify({"mensagem": "Custo não informado"}), 400

        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        cursor.execute("UPDATE vendas SET custo_produto = ? WHERE id = ?", (custo, id))
        conn.commit()
        conn.close()

        return jsonify({"mensagem": "Custo atualizado com sucesso!"}), 200
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao atualizar custo: {e}"}), 500

# --- OBTER VENDAS ---
@app.route('/obter_vendas', methods=['GET'])
def obter_vendas():
    try:
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        
        # Primeiro, vamos verificar a estrutura da tabela
        cursor.execute("PRAGMA table_info(vendas)")
        colunas = cursor.fetchall()
        print("=== ESTRUTURA DA TABELA VENDAS ===")
        for coluna in colunas:
            print(f"Coluna: {coluna[1]}, Tipo: {coluna[2]}")
        print("=================================")
        
        # Agora busque os dados com um SELECT mais explícito
        cursor.execute("""
        SELECT 
            id, 
            nome_cliente, 
            telefone_cliente, 
            descricao_produto,
            forma_pagamento, 
            valor_total, 
            IFNULL(custo_produto, '-') as custo_produto, 
            IFNULL(nome_vendedor, '-') as nome_vendedor,
            data_venda,  -- SEM o IFNULL aqui para debug
            garantia
        FROM vendas
        ORDER BY data_venda DESC
        """)

        vendas = []
        for row in cursor.fetchall():
            venda = {
                "id": row[0],
                "nome_cliente": row[1],
                "telefone_cliente": row[2],
                "descricao_produto": row[3],
                "forma_pagamento": row[4],
                "valor_total": row[5],
                "custo_produto": row[6],
                "nome_vendedor": row[7],
                "data_venda": row[8],  # Pode ser None
                "garantia": row[9]
            }
            print(f"Venda {venda['id']}: data_venda = {venda['data_venda']} (tipo: {type(venda['data_venda'])})")
            vendas.append(venda)
        
        conn.close()
        return jsonify(vendas), 200
    
    except Exception as e:
        print(f"Erro ao obter vendas: {e}")
        return jsonify({"mensagem": f"Erro ao obter vendas: {e}"}), 500


# --- EDITAR VENDA ---
@app.route('/editar_venda/<int:id>', methods=['PUT'])
def editar_venda(id):
    try:
        data = request.get_json()
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE vendas SET
                nome_cliente = ?,
                telefone_cliente = ?,
                descricao_produto = ?,
                valor_total = ?,
                forma_pagamento = ?,
                valor_dinheiro = ?,
                valor_cartao = ?,
                valor_pix = ?,
                valor_vale = ?,
                garantia = ?,
                custo_produto = ?,
                nome_vendedor = ?
            WHERE id = ?
        """, (
            data['nome_cliente'],
            data['telefone_cliente'],
            data['descricao_produto'],
            data['valor_total'],
            data['forma_pagamento'],
            data['valor_dinheiro'],
            data['valor_cartao'],
            data['valor_pix'],
            data['valor_vale'],
            data['garantia'],
            data.get('custo_produto', None),
            data.get('nome_vendedor', None),  # Novo campo
            id
        ))

        conn.commit()
        conn.close()
        return jsonify({"mensagem": "Venda editada com sucesso!"}), 200
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao editar venda: {e}"}), 500
# --- EXCLUIR VENDA ---
@app.route('/excluir_venda/<int:id>', methods=['DELETE'])
def excluir_venda(id):
    try:
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        cursor.execute("DELETE FROM vendas WHERE id = ?", (id,))
        conn.commit()
        conn.close()

        return jsonify({"mensagem": "Venda excluída com sucesso!"}), 200
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao excluir venda: {e}"}), 500

# -------------------------------------------------------------------------------
# Função para cadastrar um novo usuário 
def cadastrar_usuario(registro_usuario, registro_senha, registro_funcao):
    try:
        with sqlite3.connect('sistema_seguranca.db', timeout=10) as conn:
            cursor = conn.cursor()

            # Verificando se a tabela existe
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios';")
            if cursor.fetchone() is None:
                print("A tabela 'usuarios' não existe!")
            else:
                print("Conexão estabelecida com a tabela 'usuarios'.")

            # Inserir um novo usuário
            cursor.execute('''
                INSERT INTO usuarios (nome_usuario, senha, funcao)
                VALUES (?, ?, ?)
            ''', (registro_usuario, registro_senha, registro_funcao))

            conn.commit()
            print(f"Usuário {registro_usuario} cadastrado com sucesso!")

    except Exception as e:
        print(f"Erro ao cadastrar usuário: {e}")
        raise

# Rota para registrar novo usuário
@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()
    print("Dados recebidos no backend:", data)

    registro_usuario = data['registro_usuario']
    registro_senha = data['registro_senha']
    registro_funcao = data['registro_funcao']

    try:
        with sqlite3.connect('sistema_seguranca.db', timeout=10) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM usuarios WHERE nome_usuario = ?', (registro_usuario,))
            usuario_existente = cursor.fetchone()

        if usuario_existente:
            return jsonify({'message': 'Usuário já existe.'}), 400

        cadastrar_usuario(registro_usuario, registro_senha, registro_funcao)

        return jsonify({'message': 'Usuário registrado com sucesso.'}), 201

    except Exception as e:
        return jsonify({'message': f'Erro ao registrar usuário: {e}'}), 500

# Rota para obter todos os logins
@app.route("/obter_logins", methods=["GET"])
def obter_logins():
    try:
        with sqlite3.connect('sistema_seguranca.db', timeout=10) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, nome_usuario, senha, funcao FROM usuarios")

            logins = [
                {"id": row[0], "usuario": row[1], "senha": row[2], "cargo": row[3]}
                for row in cursor.fetchall()
            ]
        return jsonify(logins), 200

    except Exception as e:
        return jsonify({'message': f'Erro ao obter logins: {e}'}), 500

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    conn = sqlite3.connect('sistema_seguranca.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, nome_usuario FROM usuarios WHERE nome_usuario = ? AND senha = ?", (username, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        session["user_id"] = user[0]
        session["username"] = user[1]
        return jsonify({"success": True, "username": user[1]})
    else:
        return jsonify({"success": False, "message": "Usuário ou senha inválidos"}), 401


# --- Rota para verificar o cargo do usuário logado ---
@app.route("/verificar_cargo", methods=["GET"])
def verificar_cargo():
    try:
        if "username" not in session:
            return jsonify({"success": False, "mensagem": "Usuário não autenticado"}), 401

        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        cursor.execute("SELECT funcao FROM usuarios WHERE nome_usuario = ?", (session["username"],))
        resultado = cursor.fetchone()
        conn.close()

        if resultado:
            return jsonify({"success": True, "cargo": resultado[0]})
        else:
            return jsonify({"success": False, "mensagem": "Usuário não encontrado"}), 404
    except Exception as e:
        return jsonify({"success": False, "mensagem": f"Erro ao verificar cargo: {e}"}), 500


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})


# Rota para editar um usuário
@app.route('/editar_usuarios/<int:id>', methods=['PUT'])
def editar_usuarios(id):
    try:
        dados = request.get_json()
        nome_usuario = dados.get('nome_usuario')
        senha = dados.get('senha')
        funcao = dados.get('funcao')

        if not nome_usuario or not senha or not funcao:
            return jsonify({"message": "Dados incompletos"}), 400

        print(f"[DEBUG] Atualizando usuário {id} com: {nome_usuario}, {senha}, {funcao}")

        with sqlite3.connect('sistema_seguranca.db', timeout=10) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE usuarios
                SET nome_usuario = ?, senha = ?, funcao = ?
                WHERE id = ?
            """, (nome_usuario, senha, funcao, id))
            conn.commit()

        return jsonify({"message": "Usuário atualizado com sucesso."}), 200

    except Exception as e:
        import traceback
        print("[ERRO AO EDITAR USUÁRIO]")
        traceback.print_exc()
        return jsonify({"message": f"Erro ao atualizar usuário: {str(e)}"}), 500

# Rota para deletar um usuário
@app.route('/usuarios/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
    try:
        with sqlite3.connect('sistema_seguranca.db', timeout=10) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM usuarios WHERE id = ?", (id,))
            usuario = cursor.fetchone()

            if usuario is None:
                return jsonify({"message": "Usuário não encontrado."}), 404

            cursor.execute("DELETE FROM usuarios WHERE id = ?", (id,))
            conn.commit()

        return jsonify({"message": "Usuário excluído com sucesso."}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Erro ao excluir usuário."}), 500

# -----------------------------------------------

# Configuração do banco de dados
DATABASE = 'sistema_seguranca.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# --- ADICIONAR ASSISTÊNCIA ---
@app.route('/api/assistencias', methods=['POST'])
def adicionar_assistencia():
    try:
        dados = request.get_json()

        # --- 1️⃣ Validação dos campos obrigatórios ---
        required_fields = [
            'nome_cliente', 'telefone_cliente', 'marca_aparelho',
            'modelo_aparelho', 'descricao_defeito', 'servico_realizar',
            'valor_servico', 'forma_pagamento', 'periodo_garantia'
        ]
        if not all(key in dados for key in required_fields):
            return jsonify({'sucesso': False, 'mensagem': 'Dados incompletos'}), 400

        # --- 2️⃣ Nome do vendedor ---
        nome_vendedor = dados.get('nome_vendedor')
        if not nome_vendedor and 'username' in session:
            nome_vendedor = session['username']

        # --- 3️⃣ SEMPRE usar data e hora atual do servidor ---
        data_cadastro = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"=== REGISTRANDO NOVA ASSISTÊNCIA ===")
        print(f"Data/hora: {data_cadastro}")
        print(f"Cliente: {dados['nome_cliente']}")
        print(f"Aparelho: {dados['marca_aparelho']} {dados['modelo_aparelho']}")
        print(f"Garantia: {dados['periodo_garantia']} dias")
        print(f"=============================")

        # --- 4️⃣ Processar forma de pagamento ---
        forma_pagamento = dados.get('forma_pagamento')
        valor_total = float(dados.get('valor_servico', 0) or 0)

        valor_dinheiro = 0
        valor_cartao = 0
        valor_pix = 0
        valor_vale = 0

        # Pagamento único
        if forma_pagamento == 'cash':
            valor_dinheiro = valor_total
        elif forma_pagamento == 'card':
            valor_cartao = valor_total
        elif forma_pagamento == 'pix':
            valor_pix = valor_total
        elif forma_pagamento == 'voucher':
            valor_vale = valor_total

        # Pagamento combinado (quando existem partes)
        elif forma_pagamento == 'cash_card':
            valor_dinheiro = float(dados.get('valor_dinheiro', 0))
            valor_cartao = float(dados.get('valor_cartao', 0))
        elif forma_pagamento == 'cash_pix':
            valor_dinheiro = float(dados.get('valor_dinheiro', 0))
            valor_pix = float(dados.get('valor_pix', 0))
        elif forma_pagamento == 'card_pix':
            valor_cartao = float(dados.get('valor_cartao', 0))
            valor_pix = float(dados.get('valor_pix', 0))

        # --- 5️⃣ Inserir no banco ---
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
        INSERT INTO assistencias (
            nome_cliente, telefone_cliente, marca_aparelho, modelo_aparelho,
            descricao_defeito, servico_realizar, valor_servico, forma_pagamento,
            valor_dinheiro, valor_cartao, valor_pix, valor_vale, periodo_garantia,
            aparelho_liga, tela_quebrada, exibe_imagem, camera_funciona,
            wifi_bluetooth, som_funciona, botoes_funcionam, dano_liquido,
            outra_assistencia, gaveta_sim, com_capinha, data_cadastro,
            id_funcionario, status, nome_vendedor
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        checklist = dados.get('checklist', {})

        valores = (
            dados['nome_cliente'],
            dados['telefone_cliente'],
            dados['marca_aparelho'],
            dados['modelo_aparelho'],
            dados['descricao_defeito'],
            dados['servico_realizar'],
            valor_total,
            forma_pagamento,
            valor_dinheiro,
            valor_cartao,
            valor_pix,
            valor_vale,
            int(dados['periodo_garantia']),
            checklist.get('aparelho_liga'),
            checklist.get('tela_quebrada'),
            checklist.get('exibe_imagem'),
            checklist.get('camera_funciona'),
            checklist.get('wifi_bluetooth'),
            checklist.get('som_funciona'),
            checklist.get('botoes_funcionam'),
            checklist.get('dano_liquido'),
            checklist.get('outra_assistencia'),
            checklist.get('gaveta_sim'),
            checklist.get('com_capinha'),
            data_cadastro,  # Data e hora completa do servidor
            1,  # ID funcionário (ajustável)
            'pendente',
            nome_vendedor
        )

        cursor.execute(query, valores)
        conn.commit()

        id_assistencia = cursor.lastrowid
        print(f"Nova assistência inserida com ID: {id_assistencia}")
        
        return jsonify({
            'sucesso': True,
            'mensagem': 'Assistência cadastrada com sucesso!',
            'id': id_assistencia
        })

    except Exception as e:
        import traceback
        print("Erro ao adicionar assistência:", traceback.format_exc())
        return jsonify({'sucesso': False, 'mensagem': f'Erro inesperado: {str(e)}'}), 500
    finally:
        if 'conn' in locals():
            conn.close()


# --- OBTER ASSISTÊNCIAS ---
@app.route('/obter_assistencias', methods=['GET'])
def obter_assistencias():
    try:
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        
        # Primeiro, verifique a estrutura da tabela
        cursor.execute("PRAGMA table_info(assistencias)")
        colunas = cursor.fetchall()
        print("=== ESTRUTURA DA TABELA ASSISTENCIAS ===")
        for coluna in colunas:
            print(f"Coluna: {coluna[1]}, Tipo: {coluna[2]}")
        print("=================================")
        
        cursor.execute("""
            SELECT id, nome_cliente, telefone_cliente, marca_aparelho, modelo_aparelho,
                descricao_defeito, servico_realizar, forma_pagamento, valor_servico, 
                valor_dinheiro, valor_cartao, valor_pix, valor_vale,
                IFNULL(custo_servico, '-') as custo_servico, 
                COALESCE(status, 'pendente') as status, 
                periodo_garantia,
                aparelho_liga, tela_quebrada, exibe_imagem, camera_funciona, wifi_bluetooth,
                som_funciona, botoes_funcionam, dano_liquido, outra_assistencia,
                gaveta_sim, com_capinha, data_cadastro,
                IFNULL(nome_vendedor, '-') as nome_vendedor
            FROM assistencias
            ORDER BY data_cadastro DESC
        """)
        
        assistencias = []
        for row in cursor.fetchall():
            assistencia = {
                "id": row[0],
                "nome_cliente": row[1],
                "telefone_cliente": row[2],
                "marca_aparelho": row[3],
                "modelo_aparelho": row[4],
                "descricao_defeito": row[5],
                "servico_realizar": row[6],
                "forma_pagamento": row[7],
                "valor_servico": row[8],
                "valor_dinheiro": row[9],
                "valor_cartao": row[10],
                "valor_pix": row[11],
                "valor_vale": row[12],
                "custo_servico": row[13],
                "status": row[14],
                "periodo_garantia": row[15],
                "checklist": {
                    "aparelho_liga": row[16],
                    "tela_quebrada": row[17],
                    "exibe_imagem": row[18],
                    "camera_funciona": row[19],
                    "wifi_bluetooth": row[20],
                    "som_funciona": row[21],
                    "botoes_funcionam": row[22],
                    "dano_liquido": row[23],
                    "outra_assistencia": row[24],
                    "gaveta_sim": row[25],
                    "com_capinha": row[26]
                },
                "data_cadastro": row[27],
                "nome_vendedor": row[28]
            }
            print(f"Assistência {assistencia['id']}: data_cadastro = {assistencia['data_cadastro']}")
            assistencias.append(assistencia)
        
        conn.close()
        return jsonify(assistencias), 200
    
    except Exception as e:
        import traceback
        print("Erro detalhado:", traceback.format_exc())
        return jsonify({"mensagem": f"Erro ao obter assistências: {str(e)}"}), 500   

# --- EDITAR ASSISTÊNCIA ---
@app.route('/editar_assistencia/<int:id>', methods=['PUT'])
def editar_assistencia(id):
    try:
        data = request.get_json()
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE assistencias SET
                nome_cliente = ?,
                telefone_cliente = ?,
                marca_aparelho = ?,
                modelo_aparelho = ?,
                descricao_defeito = ?,
                servico_realizar = ?,
                valor_servico = ?,
                forma_pagamento = ?,
                valor_dinheiro = ?,
                valor_cartao = ?,
                valor_pix = ?,
                valor_vale = ?,
                periodo_garantia = ?,
                custo_servico = ?,
                nome_vendedor = ?
            WHERE id = ?
        """, (
            data['nome_cliente'],
            data['telefone_cliente'],
            data['marca_aparelho'],
            data['modelo_aparelho'],
            data['descricao_defeito'],
            data['servico_realizar'],
            data['valor_servico'],
            data['forma_pagamento'],
            data.get('valor_dinheiro', None),
            data.get('valor_cartao', None),
            data.get('valor_pix', None),
            data.get('valor_vale', None),
            data['periodo_garantia'],
            data.get('custo_servico', None),
            data.get('nome_vendedor', None),  # Novo campo
            id
        ))

        conn.commit()
        conn.close()
        return jsonify({"mensagem": "Assistência editada com sucesso!"}), 200
    except Exception as e:
        import traceback
        print("Erro ao editar assistência:", traceback.format_exc())
        return jsonify({"mensagem": f"Erro ao editar assistência: {str(e)}"}), 500

# --- ATUALIZAR CUSTO ASSISTÊNCIA ---
@app.route('/atualizar_custo_assistencia/<int:id>', methods=['PUT'])
def atualizar_custo_assistencia(id):
    try:
        data = request.get_json()
        custo_servico = data.get('custo_servico')
        status = data.get('status', 'concluido')
        
        if custo_servico is None:
            return jsonify({"mensagem": "Custo não informado"}), 400

        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE assistencias 
            SET custo_servico = ?, status = ?
            WHERE id = ?
        """, (custo_servico, status, id))
        
        conn.commit()
        conn.close()

        return jsonify({"mensagem": "Custo atualizado com sucesso!"}), 200
    except Exception as e:
        import traceback
        print("Erro ao atualizar custo assistência:", traceback.format_exc())
        return jsonify({"mensagem": f"Erro ao atualizar custo: {str(e)}"}), 500

# --- EXCLUIR ASSISTÊNCIA ---
@app.route('/excluir_assistencia/<int:id>', methods=['DELETE'])
def excluir_assistencia(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se a assistência existe
        cursor.execute("SELECT id FROM assistencias WHERE id = ?", (id,))
        if cursor.fetchone() is None:
            conn.close()
            return jsonify({"mensagem": "Assistência não encontrada"}), 404
            
        cursor.execute("DELETE FROM assistencias WHERE id = ?", (id,))
        conn.commit()
        conn.close()

        return jsonify({"mensagem": "Assistência excluída com sucesso!"}), 200
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao excluir assistência: {e}"}), 500

# Nome do banco
DB_NAME = "sistema_seguranca.db"

# Conexão com o banco
def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

# Criar tabela de saídas
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS saidas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            motivo TEXT NOT NULL,
            valor REAL NOT NULL,
            data TEXT NOT NULL,
            funcionario TEXT NOT NULL,
            data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Inicializar o banco
init_db()

# Rota: listar saídas
@app.route("/api/saidas", methods=["GET"])
def listar_saidas():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM saidas ORDER BY data DESC")
    rows = cursor.fetchall()
    conn.close()
    saidas = [dict(row) for row in rows]
    return jsonify(saidas)

# Rota: adicionar saída
@app.route("/api/saidas", methods=["POST"])
def adicionar_saida():
    try:
        dados = request.get_json()
        motivo = dados.get("motivo")
        valor = dados.get("valor")
        data = dados.get("data")
        funcionario = dados.get("funcionario")

        # Validação básica
        if not all([motivo, valor, data, funcionario]):
            return jsonify({"message": "Dados incompletos"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificação de duplicação (últimos 2 minutos)
        cursor.execute(
            "SELECT id FROM saidas WHERE motivo = ? AND valor = ? AND data = ? AND funcionario = ? AND datetime(data_registro) > datetime('now', '-2 minutes')",
            (motivo, valor, data, funcionario)
        )
        duplicata = cursor.fetchone()
        
        if duplicata:
            conn.close()
            return jsonify({"message": "Saída duplicada detectada!"}), 400

        cursor.execute(
            "INSERT INTO saidas (motivo, valor, data, funcionario) VALUES (?, ?, ?, ?)",
            (motivo, valor, data, funcionario)
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Saída adicionada com sucesso!"}), 201
        
    except Exception as e:
        return jsonify({"message": f"Erro ao adicionar saída: {str(e)}"}), 500

# Rota: editar saída
@app.route("/api/saidas/<int:saida_id>", methods=["PUT"])
def editar_saida(saida_id):
    try:
        dados = request.get_json()
        motivo = dados.get("motivo")
        valor = dados.get("valor")
        data = dados.get("data")
        funcionario = dados.get("funcionario")

        if not all([motivo, valor, data, funcionario]):
            return jsonify({"message": "Dados incompletos"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE saidas
            SET motivo = ?, valor = ?, data = ?, funcionario = ?
            WHERE id = ?
        """, (motivo, valor, data, funcionario, saida_id))
        conn.commit()
        conn.close()

        return jsonify({"message": "Saída atualizada com sucesso!"})
        
    except Exception as e:
        return jsonify({"message": f"Erro ao editar saída: {str(e)}"}), 500

# Rota: excluir saída
@app.route("/api/saidas/<int:saida_id>", methods=["DELETE"])
def excluir_saida(saida_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM saidas WHERE id = ?", (saida_id,))
        conn.commit()
        conn.close()

        return jsonify({"message": "Saída excluída com sucesso!"})
        
    except Exception as e:
        return jsonify({"message": f"Erro ao excluir saída: {str(e)}"}), 500

# --- OBTER RESUMO DE VENDAS CONCLUÍDAS POR DATA ---
@app.route('/obter_resumo_vendas_concluidas', methods=['GET'])
def obter_resumo_vendas_concluidas():
    try:
        data = request.args.get('data', datetime.now().strftime('%Y-%m-%d'))
        
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        
        # Buscar vendas concluídas do dia especificado (com custo preenchido)
        cursor.execute("""
            SELECT 
                COALESCE(SUM(valor_dinheiro), 0) as total_dinheiro,
                COALESCE(SUM(valor_cartao), 0) as total_cartao,
                COALESCE(SUM(valor_pix), 0) as total_pix,
                COALESCE(SUM(valor_vale), 0) as total_vale,
                COALESCE(SUM(valor_total), 0) as total_geral
            FROM vendas 
            WHERE date(data_venda) = ? AND custo_produto IS NOT NULL
        """, (data,))
        
        resultado = cursor.fetchone()
        
        resumo = {
            "total_dinheiro": resultado[0] if resultado else 0,
            "total_cartao": resultado[1] if resultado else 0,
            "total_pix": resultado[2] if resultado else 0,
            "total_vale": resultado[3] if resultado else 0,
            "total_geral": resultado[4] if resultado else 0
        }
        
        conn.close()
        return jsonify(resumo), 200
    
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao obter resumo de vendas concluídas: {str(e)}"}), 500

# --- OBTER RESUMO DE VENDAS CONCLUÍDAS POR PERÍODO ---
@app.route('/obter_resumo_vendas_concluidas_periodo', methods=['GET'])
def obter_resumo_vendas_concluidas_periodo():
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        
        # Buscar vendas concluídas do período especificado (com custo preenchido)
        cursor.execute("""
            SELECT 
                COALESCE(SUM(valor_dinheiro), 0) as total_dinheiro,
                COALESCE(SUM(valor_cartao), 0) as total_cartao,
                COALESCE(SUM(valor_pix), 0) as total_pix,
                COALESCE(SUM(valor_vale), 0) as total_vale,
                COALESCE(SUM(valor_total), 0) as total_geral
            FROM vendas 
            WHERE date(data_venda) BETWEEN ? AND ? AND custo_produto IS NOT NULL
        """, (data_inicio, data_fim))
        
        resultado = cursor.fetchone()
        
        resumo = {
            "total_dinheiro": resultado[0] if resultado else 0,
            "total_cartao": resultado[1] if resultado else 0,
            "total_pix": resultado[2] if resultado else 0,
            "total_vale": resultado[3] if resultado else 0,
            "total_geral": resultado[4] if resultado else 0
        }
        
        conn.close()
        return jsonify(resumo), 200
    
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao obter resumo de vendas concluídas: {str(e)}"}), 500
    
    
# ================================================================================

# --- OBTER RESUMO DE SAÍDAS POR PERÍODO ---
@app.route('/obter_resumo_saidas_periodo', methods=['GET'])
def obter_resumo_saidas_periodo():
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        
        # Buscar saídas do período especificado
        cursor.execute("""
            SELECT COALESCE(SUM(valor), 0) as total
            FROM saidas 
            WHERE date(data) BETWEEN ? AND ?
        """, (data_inicio, data_fim))
        
        resultado = cursor.fetchone()
        
        resumo = {
            "total": resultado[0] if resultado else 0
        }
        
        conn.close()
        return jsonify(resumo), 200
    
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao obter resumo de saídas: {str(e)}"}), 500
    
    
    
    # --- OBTER RESUMO DE ASSISTÊNCIAS POR PERÍODO ---
@app.route('/obter_resumo_assistencias_periodo', methods=['GET'])
def obter_resumo_assistencias_periodo():
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')

        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                COALESCE(SUM(valor_dinheiro), 0) as total_dinheiro,
                COALESCE(SUM(valor_cartao), 0) as total_cartao,
                COALESCE(SUM(valor_pix), 0) as total_pix,
                COALESCE(SUM(valor_vale), 0) as total_vale,
                COALESCE(SUM(valor_servico), 0) as total_geral
            FROM assistencias
            WHERE date(data_cadastro) BETWEEN ? AND ?
                AND custo_servico IS NOT NULL
        """, (data_inicio, data_fim))

        resultado = cursor.fetchone()
        conn.close()

        resumo = {
            "total_dinheiro": resultado[0],
            "total_cartao": resultado[1],
            "total_pix": resultado[2],
            "total_vale": resultado[3],
            "total_geral": resultado[4]
        }

        return jsonify(resumo), 200
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao obter resumo de assistências: {e}"}), 500
    
    

# --- OBTER RESUMO DE VENDAS PENDENTES POR PERÍODO ---
@app.route('/obter_resumo_vendas_pendentes_periodo', methods=['GET'])
def obter_resumo_vendas_pendentes_periodo():
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')

        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                COUNT(*),
                COALESCE(SUM(valor_dinheiro), 0),
                COALESCE(SUM(valor_cartao), 0),
                COALESCE(SUM(valor_pix), 0),
                COALESCE(SUM(valor_vale), 0)
            FROM vendas
            WHERE (custo_produto IS NULL OR custo_produto = '')
            AND DATE(data_venda) BETWEEN DATE(?) AND DATE(?)
        """, (data_inicio, data_fim))

        row = cursor.fetchone()
        conn.close()

        qtd, total_dinheiro, total_cartao, total_pix, total_vale = row
        total_geral = total_dinheiro + total_cartao + total_pix + total_vale

        return jsonify({
            "quantidade": qtd,
            "total_dinheiro": total_dinheiro,
            "total_cartao": total_cartao,
            "total_pix": total_pix,
            "total_vale": total_vale,
            "total_geral": total_geral
        })

    except Exception as e:
        return jsonify({"mensagem": f"Erro ao obter vendas pendentes: {str(e)}"}), 500


# --- OBTER RESUMO DE ASSISTÊNCIAS PENDENTES POR PERÍODO ---
@app.route('/obter_resumo_assistencias_pendentes_periodo', methods=['GET'])
def obter_resumo_assistencias_pendentes_periodo():
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')

        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                COUNT(*),
                COALESCE(SUM(valor_dinheiro), 0),
                COALESCE(SUM(valor_cartao), 0),
                COALESCE(SUM(valor_pix), 0),
                COALESCE(SUM(valor_vale), 0)
            FROM assistencias
            WHERE status = 'pendente'
            AND DATE(data_cadastro) BETWEEN DATE(?) AND DATE(?)
        """, (data_inicio, data_fim))

        row = cursor.fetchone()
        conn.close()

        qtd, total_dinheiro, total_cartao, total_pix, total_vale = row
        total_geral = total_dinheiro + total_cartao + total_pix + total_vale

        return jsonify({
            "quantidade": qtd,
            "total_dinheiro": total_dinheiro,
            "total_cartao": total_cartao,
            "total_pix": total_pix,
            "total_vale": total_vale,
            "total_geral": total_geral
        })

    except Exception as e:
        return jsonify({"mensagem": f"Erro ao obter assistências pendentes: {str(e)}"}), 500


# --- OBTER VENDEDORES ---
@app.route('/obter_vendedores', methods=['GET'])
def obter_vendedores():
    try:
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT DISTINCT nome_usuario FROM usuarios ORDER BY nome_usuario")
        
        vendedores = [row[0] for row in cursor.fetchall()]
        
        conn.close()
        return jsonify(vendedores), 200
    
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao obter vendedores: {e}"}), 500
    
    
# --- OBTER LUCRO DE VENDAS POR PERÍODO ---
@app.route('/obter_lucro_vendas_periodo', methods=['GET'])
def obter_lucro_vendas_periodo():
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        
        # Calcular lucro (valor_total - custo_produto) apenas para vendas concluídas
        cursor.execute("""
            SELECT 
                COALESCE(SUM(valor_total - COALESCE(custo_produto, 0)), 0) as lucro_total,
                COALESCE(SUM(valor_total), 0) as total_vendas,
                COALESCE(SUM(COALESCE(custo_produto, 0)), 0) as total_custo
            FROM vendas 
            WHERE date(data_venda) BETWEEN ? AND ? 
            AND custo_produto IS NOT NULL
        """, (data_inicio, data_fim))
        
        resultado = cursor.fetchone()
        
        resumo = {
            "lucro_total": resultado[0] if resultado else 0,
            "total_vendas": resultado[1] if resultado else 0,
            "total_custo": resultado[2] if resultado else 0
        }
        
        conn.close()
        return jsonify(resumo), 200
    
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao obter lucro de vendas: {str(e)}"}), 500

# --- OBTER LUCRO DE ASSISTÊNCIAS POR PERÍODO ---
@app.route('/obter_lucro_assistencias_periodo', methods=['GET'])
def obter_lucro_assistencias_periodo():
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        
        # Calcular lucro (valor_servico - custo_servico) apenas para assistências concluídas
        cursor.execute("""
            SELECT 
                COALESCE(SUM(valor_servico - COALESCE(custo_servico, 0)), 0) as lucro_total,
                COALESCE(SUM(valor_servico), 0) as total_servicos,
                COALESCE(SUM(COALESCE(custo_servico, 0)), 0) as total_custo
            FROM assistencias 
            WHERE date(data_cadastro) BETWEEN ? AND ? 
            AND custo_servico IS NOT NULL
            AND status = 'concluido'
        """, (data_inicio, data_fim))
        
        resultado = cursor.fetchone()
        
        resumo = {
            "lucro_total": resultado[0] if resultado else 0,
            "total_servicos": resultado[1] if resultado else 0,
            "total_custo": resultado[2] if resultado else 0
        }
        
        conn.close()
        return jsonify(resumo), 200
    
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao obter lucro de assistências: {str(e)}"}), 500
    
    
    
# --- OBTER LUCRO POR VENDEDOR POR PERÍODO ---
@app.route('/obter_lucro_vendedores_periodo', methods=['GET'])
def obter_lucro_vendedores_periodo():
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        conn = sqlite3.connect('sistema_seguranca.db')
        cursor = conn.cursor()
        
        # Buscar lucro de vendas por vendedor
        cursor.execute("""
            SELECT 
                nome_vendedor,
                COALESCE(SUM(valor_total - COALESCE(custo_produto, 0)), 0) as lucro_vendas,
                COALESCE(SUM(valor_total), 0) as total_vendas,
                COALESCE(SUM(COALESCE(custo_produto, 0)), 0) as custo_vendas,
                COUNT(*) as qtd_vendas
            FROM vendas 
            WHERE date(data_venda) BETWEEN ? AND ? 
            AND custo_produto IS NOT NULL
            AND nome_vendedor IS NOT NULL
            GROUP BY nome_vendedor
        """, (data_inicio, data_fim))
        
        lucro_vendas = cursor.fetchall()
        
        # Buscar lucro de assistências por vendedor
        cursor.execute("""
            SELECT 
                nome_vendedor,
                COALESCE(SUM(valor_servico - COALESCE(custo_servico, 0)), 0) as lucro_assistencias,
                COALESCE(SUM(valor_servico), 0) as total_assistencias,
                COALESCE(SUM(COALESCE(custo_servico, 0)), 0) as custo_assistencias,
                COUNT(*) as qtd_assistencias
            FROM assistencias 
            WHERE date(data_cadastro) BETWEEN ? AND ? 
            AND custo_servico IS NOT NULL
            AND status = 'concluido'
            AND nome_vendedor IS NOT NULL
            GROUP BY nome_vendedor
        """, (data_inicio, data_fim))
        
        lucro_assistencias = cursor.fetchall()
        
        # Combinar os resultados
        vendedores = {}
        
        # Processar vendas
        for vendedor, lucro_v, total_v, custo_v, qtd_v in lucro_vendas:
            if vendedor not in vendedores:
                vendedores[vendedor] = {
                    'lucro_vendas': 0,
                    'total_vendas': 0,
                    'custo_vendas': 0,
                    'qtd_vendas': 0,
                    'lucro_assistencias': 0,
                    'total_assistencias': 0,
                    'custo_assistencias': 0,
                    'qtd_assistencias': 0
                }
            vendedores[vendedor].update({
                'lucro_vendas': lucro_v,
                'total_vendas': total_v,
                'custo_vendas': custo_v,
                'qtd_vendas': qtd_v
            })
        
        # Processar assistências
        for vendedor, lucro_a, total_a, custo_a, qtd_a in lucro_assistencias:
            if vendedor not in vendedores:
                vendedores[vendedor] = {
                    'lucro_vendas': 0,
                    'total_vendas': 0,
                    'custo_vendas': 0,
                    'qtd_vendas': 0,
                    'lucro_assistencias': 0,
                    'total_assistencias': 0,
                    'custo_assistencias': 0,
                    'qtd_assistencias': 0
                }
            vendedores[vendedor].update({
                'lucro_assistencias': lucro_a,
                'total_assistencias': total_a,
                'custo_assistencias': custo_a,
                'qtd_assistencias': qtd_a
            })
        
        # Calcular totais e métricas
        resultado = []
        for vendedor, dados in vendedores.items():
            lucro_total = dados['lucro_vendas'] + dados['lucro_assistencias']
            total_geral = dados['total_vendas'] + dados['total_assistencias']
            qtd_total = dados['qtd_vendas'] + dados['qtd_assistencias']
            
            # Calcular meta (exemplo: baseado no lucro médio por venda/assistência)
            lucro_medio = lucro_total / qtd_total if qtd_total > 0 else 0
            meta_percentual = min(120, max(50, (lucro_medio / 100) * 100))  # Exemplo simplificado
            
            resultado.append({
                'vendedor': vendedor,
                'lucro_total': lucro_total,
                'lucro_vendas': dados['lucro_vendas'],
                'lucro_assistencias': dados['lucro_assistencias'],
                'total_vendas': dados['total_vendas'],
                'total_assistencias': dados['total_assistencias'],
                'qtd_vendas': dados['qtd_vendas'],
                'qtd_assistencias': dados['qtd_assistencias'],
                'qtd_total': qtd_total,
                'meta_percentual': round(meta_percentual, 1)
            })
        
        # Ordenar por lucro total (decrescente)
        resultado.sort(key=lambda x: x['lucro_total'], reverse=True)
        
        conn.close()
        return jsonify(resultado), 200
    
    except Exception as e:
        import traceback
        print("Erro ao obter lucro por vendedor:", traceback.format_exc())
        return jsonify({"mensagem": f"Erro ao obter lucro por vendedor: {str(e)}"}), 500    
    # ================================================================================
# ROTAS PARA SERVIR ARQUIVOS ESTÁTICOS - ADICIONE ISSO NO FINAL DO ARQUIVO
# ================================================================================

@app.route('/')
def serve_index():
    return send_file('index.html')

@app.route('/login.html')
def serve_login():
    return send_file('login.html')

@app.route('/dashboard.html')
def serve_dashboard():
    return send_file('dashboard.html')

@app.route('/tbvendas.html')
def serve_tbvendas():
    return send_file('tbvendas.html')

@app.route('/tbassistencia.html')
def serve_tbassistencia():
    return send_file('tbassistencia.html')

@app.route('/tblogin.html')
def serve_tblogin():
    return send_file('tblogin.html')

@app.route('/tbsaidas.html')
def serve_tbsaidas():
    return send_file('tbsaidas.html')

# Rota genérica para outros arquivos (CSS, JS, etc)
@app.route('/<path:filename>')
def serve_static(filename):
    if os.path.exists(filename):
        return send_file(filename)
    else:
        return "Arquivo não encontrado", 404

# ================================================================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)

