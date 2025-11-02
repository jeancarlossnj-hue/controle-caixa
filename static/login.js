// ==========================================
// 🌐 CONFIGURAÇÃO GERAL DE API
// ==========================================
const API_BASE = window.location.origin; // Detecta automaticamente (local ou Railway)

document.addEventListener('DOMContentLoaded', function () {
    // ==========================================
    // 🧾 CADASTRO DE NOVOS USUÁRIOS
    // ==========================================
    const form = document.getElementById('formulario-tarefas');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const registroUsuario = document.getElementById('registro-usuario').value;
            const registroSenha = document.getElementById('registro-senha').value;
            const registroFuncao = document.getElementById('registro-funcao').value;

            // Buscar logins existentes
            fetch(`${API_BASE}/obter_logins`)
                .then(response => response.json())
                .then(logins => {
                    const existeUsuarioRepetido = logins.some(login =>
                        login.usuario.toLowerCase() === registroUsuario.toLowerCase() &&
                        login.senha === registroSenha
                    );

                    if (existeUsuarioRepetido) {
                        alert("⚠️ Já existe um usuário com esse nome e senha. Por favor, escolha outro.");
                        return;
                    }

                    // Registrar novo usuário
                    return fetch(`${API_BASE}/registrar`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            registro_usuario: registroUsuario,
                            registro_senha: registroSenha,
                            registro_funcao: registroFuncao.charAt(0).toUpperCase() + registroFuncao.slice(1)
                        })
                    });
                })
                .then(response => response ? response.json() : null)
                .then(data => {
                    if (!data) return;
                    if (data.message === 'Usuário registrado com sucesso.') {
                        alert('✅ Registro bem-sucedido!');
                        carregarLogins();
                        form.reset();
                    } else {
                        alert(`⚠️ ${data.message}`);
                    }
                })
                .catch(error => {
                    console.error('❌ Erro ao registrar usuário:', error);
                    alert('Erro ao registrar. Verifique sua conexão.');
                });
        });
    }

    // ==========================================
    // 📋 CARREGAR USUÁRIOS EXISTENTES
    // ==========================================
    function carregarLogins() {
        fetch(`${API_BASE}/obter_logins`)
            .then(response => response.json())
            .then(logins => {
                const tabela = document.getElementById("usuarios-table");
                if (!tabela) return;

                tabela.innerHTML = "";
                logins.forEach(login => {
                    const linha = document.createElement("tr");
                    linha.innerHTML = `
                        <td class="px-4 py-3">${login.usuario}</td>
                        <td class="px-4 py-3">${login.senha}</td>
                        <td class="px-4 py-3">${login.cargo}</td>
                        <td class="px-4 py-3 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                            <button class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded transition"
                                onclick="abrirModalEditar(${login.id}, '${login.usuario}', '${login.senha}', '${login.cargo}')">
                                Editar
                            </button>
                            <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                                onclick="excluirUsuario(${login.id})">
                                Excluir
                            </button>
                        </td>
                    `;
                    tabela.appendChild(linha);
                });
            })
            .catch(error => console.error("❌ Erro ao carregar usuários:", error));
    }
    carregarLogins();

    // ==========================================
    // ✏️ EDIÇÃO DE USUÁRIOS
    // ==========================================
    let usuarioEditandoId = null;

    window.abrirModalEditar = function (id, usuario, senha, funcao) {
        usuarioEditandoId = id;
        document.getElementById("input-usuario").value = usuario;
        document.getElementById("input-senha").value = senha;
        document.getElementById("input-funcao").value = funcao;
        document.getElementById("modal-editar").classList.remove("hidden");
    };

    window.fecharModalEditar = function () {
        document.getElementById("modal-editar").classList.add("hidden");
        usuarioEditandoId = null;
    };

    window.salvarEdicao = function (event) {
        event.preventDefault();

        const usuario = document.getElementById("input-usuario").value.trim();
        const senha = document.getElementById("input-senha").value.trim();
        const funcao = document.getElementById("input-funcao").value;

        fetch(`${API_BASE}/obter_logins`)
            .then(response => response.json())
            .then(logins => {
                const usuarioDuplicado = logins.some(login =>
                    login.usuario.toLowerCase() === usuario.toLowerCase() &&
                    login.senha === senha &&
                    login.id !== usuarioEditandoId
                );

                if (usuarioDuplicado) {
                    alert("⚠️ Já existe outro usuário com este nome e senha.");
                    return;
                }

                // Atualizar usuário
                fetch(`${API_BASE}/editar_usuarios/${usuarioEditandoId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome_usuario: usuario, senha, funcao })
                })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        fecharModalEditar();
                        carregarLogins();
                    })
                    .catch(error => console.error("Erro ao editar usuário:", error));
            })
            .catch(error => {
                console.error("Erro ao verificar duplicidade:", error);
                alert("Erro ao verificar duplicidade.");
            });
    };

    // ==========================================
    // 🗑️ EXCLUSÃO DE USUÁRIOS
    // ==========================================
    window.excluirUsuario = function (id) {
        if (confirm("Tem certeza que deseja excluir este usuário?")) {
            fetch(`${API_BASE}/usuarios/${id}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    carregarLogins();
                })
                .catch(error => console.error("Erro ao excluir usuário:", error));
        }
    };
});

// ==========================================
// 👤 LOGIN E LOGOUT
// ==========================================
const SENHA_PADRAO = "luzdomundo";

function verificarAcessoPadrao(username, password) {
    if (username.toLowerCase() === "luzdomundo" && password === SENHA_PADRAO) {
        return { success: true, username: "Administrador", isDefault: true, role: "Gerente" };
    }
    return null;
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const errorBox = document.getElementById("login-error");
        const spinner = document.getElementById("loading-spinner");

        // Verifica se é o acesso padrão
        const acessoPadrao = verificarAcessoPadrao(username, password);
        if (acessoPadrao && acessoPadrao.success) {
            localStorage.setItem("loggedInUser", acessoPadrao.username);
            localStorage.setItem("isDefaultUser", "true");
            localStorage.setItem("userRole", "Gerente");
            window.location.href = "index.html";
            return;
        }

        // Exibe carregando
        errorBox.classList.add("hidden");
        spinner.classList.remove("hidden");

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            spinner.classList.add("hidden");

            if (data.success) {
                localStorage.setItem("loggedInUser", data.username);
                localStorage.removeItem("isDefaultUser");

                const infoRes = await fetch(`${API_BASE}/verificar_cargo`, {
                    method: "GET",
                    credentials: "include"
                });
                const info = await infoRes.json();

                localStorage.setItem("userRole", info.success ? info.cargo : "Funcionario");
                window.location.href = "index.html";
            } else {
                errorBox.textContent = data.message || "Usuário ou senha incorretos.";
                errorBox.classList.remove("hidden");
            }
        } catch (err) {
            spinner.classList.add("hidden");
            errorBox.textContent = "Erro de conexão. Verifique sua internet.";
            errorBox.classList.remove("hidden");
            console.error("Erro:", err);
        }
    });
}
