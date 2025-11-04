// ==========================================
// 🌐 CONFIGURAÇÃO GERAL DE API
// ==========================================
const API_BASE = window.location.origin; // Detecta automaticamente (local ou Railway)

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formulario-tarefas');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // ✅ Corrigidos para coincidir com o HTML
            const registroUsuario = document.getElementById('register-username').value.trim();
            const registroSenha = document.getElementById('register-password').value.trim();
            const registroFuncao = document.getElementById('user-role').value.trim();

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
                        // ✅ Exibe mensagem visual de sucesso
                        const msg = document.getElementById('msg-sucesso');
                        msg.classList.remove('hidden');
                        msg.textContent = "✅ Usuário cadastrado com sucesso!";

                        carregarLogins();
                        form.reset();

                        // ⏳ Fecha o modal após 2 segundos
                        setTimeout(() => {
                            msg.classList.add('hidden');
                            const modalCadastro = document.getElementById('modal-cadastro');
                            if (modalCadastro) {
                                modalCadastro.classList.add('hidden');
                            }
                        }, 2000);
                    }
                })
                .catch(error => {
                    console.error('❌ Erro ao registrar usuário:', error);
                    alert('Erro ao registrar. Verifique sua conexão.');
                });
        });
    }

    // 🔄 Carregar logins existentes (sem mudanças)
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
    const botaoCancelar = document.getElementById('cancel-cadastro');
    if (botaoCancelar) {
        botaoCancelar.addEventListener('click', () => {
            const modalCadastro = document.getElementById('modal-cadastro');
            if (modalCadastro) {
                modalCadastro.classList.add('hidden');
            }
        });
    }

    carregarLogins();
});



// ==========================================
// 👤 LOGIN E LOGOUT
// ==========================================
const SENHA_PADRAO = "luzdomundo";

// Função para verificar o login padrão local
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

        // Captura dos elementos do formulário
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const errorBox = document.getElementById("login-error");
        const spinner = document.getElementById("loading-spinner");
        const botaoLogin = document.getElementById("login-button");

        // Limpa mensagens e ativa o estado de carregamento
        errorBox.classList.add("hidden");
        spinner.classList.remove("hidden");

        if (botaoLogin) {
            botaoLogin.disabled = true;
            botaoLogin.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Verificando...';
        }

        // 🧩 Verifica login padrão local
        const acessoPadrao = verificarAcessoPadrao(username, password);
        if (acessoPadrao && acessoPadrao.success) {
            spinner.classList.add("hidden");
            if (botaoLogin) {
                botaoLogin.disabled = false;
                botaoLogin.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Entrar';
            }

            localStorage.setItem("loggedInUser", acessoPadrao.username);
            localStorage.setItem("userRole", acessoPadrao.role);
            localStorage.setItem("isDefaultUser", "true");

            // Mostra mensagem antes de redirecionar
            errorBox.textContent = "✅ Acesso autorizado como Administrador.";
            errorBox.style.color = "green";
            errorBox.classList.remove("hidden");

            setTimeout(() => window.location.href = "index.html", 1000);
            return;
        }

        // 🔄 Caso não seja o login padrão, verifica no servidor
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            spinner.classList.add("hidden");

            if (botaoLogin) {
                botaoLogin.disabled = false;
                botaoLogin.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Entrar';
            }

            if (res.status === 401 || !data.success) {
                errorBox.textContent = "❌ Usuário ou senha incorretos.";
                errorBox.style.color = "red";
                errorBox.classList.remove("hidden");
                return;
            }

            if (data.success) {
                localStorage.setItem("loggedInUser", data.username);
                localStorage.removeItem("isDefaultUser");

                // Consulta cargo do usuário logado
                const infoRes = await fetch(`${API_BASE}/verificar_cargo`, {
                    method: "GET",
                    credentials: "include"
                });

                const info = await infoRes.json();
                localStorage.setItem("userRole", info.success ? info.cargo : "Funcionario");

                errorBox.textContent = "✅ Login realizado com sucesso!";
                errorBox.style.color = "green";
                errorBox.classList.remove("hidden");

                setTimeout(() => window.location.href = "index.html", 1000);
            }
        } catch (err) {
            spinner.classList.add("hidden");
            if (botaoLogin) {
                botaoLogin.disabled = false;
                botaoLogin.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Entrar';
            }
            errorBox.textContent = "⚠️ Erro de conexão. Verifique sua internet.";
            errorBox.style.color = "orange";
            errorBox.classList.remove("hidden");
            console.error("Erro:", err);
        }
    });
}


// ==========================================
// ✏️ EDIÇÃO DE USUÁRIOS
// ==========================================
let usuarioEditandoId = null;

// Abre o modal com os dados do usuário
window.abrirModalEditar = function (id, usuario, senha, funcao) {
    usuarioEditandoId = id;
    document.getElementById("input-usuario").value = usuario;
    document.getElementById("input-senha").value = senha;
    document.getElementById("input-funcao").value = funcao;
    document.getElementById("modal-editar").classList.remove("hidden");
};

// Fecha o modal sem salvar
window.fecharModalEditar = function () {
    document.getElementById("modal-editar").classList.add("hidden");
    usuarioEditandoId = null;
};

// Salva as alterações no servidor
window.salvarEdicao = async function (event) {
    event.preventDefault();
    if (!usuarioEditandoId) return alert("Usuário não selecionado!");

    const usuario = document.getElementById("input-usuario").value.trim();
    const senha = document.getElementById("input-senha").value.trim();
    const funcao = document.getElementById("input-funcao").value.trim();

    try {
        const res = await fetch(`${API_BASE}/editar_usuarios/${usuarioEditandoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome_usuario: usuario,
                senha: senha,
                funcao: funcao
            })
        });

        const data = await res.json();
        alert(data.message || "✅ Usuário atualizado com sucesso!");
        window.fecharModalEditar();

        // Recarrega a lista de usuários
        fetch(`${API_BASE}/obter_logins`)
            .then(response => response.json())
            .then(logins => {
                const tabela = document.getElementById("usuarios-table");
                tabela.innerHTML = "";
                logins.forEach(login => {
                    const linha = document.createElement("tr");
                    linha.innerHTML = `
                        <td class="px-4 py-3">${login.usuario}</td>
                        <td class="px-4 py-3">${login.senha}</td>
                        <td class="px-4 py-3">${login.cargo}</td>
                        <td class="px-4 py-3">
                            <button class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded transition"
                                onclick="abrirModalEditar(${login.id}, '${login.usuario}', '${login.senha}', '${login.cargo}')">
                                Editar
                            </button>
                            <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                                onclick="excluirUsuario(${login.id})">
                                Excluir
                            </button>
                        </td>`;
                    tabela.appendChild(linha);
                });
            });
    } catch (err) {
        console.error("❌ Erro ao editar usuário:", err);
        alert("Erro ao atualizar usuário.");
    }
};

// ==========================================
// 🗑️ EXCLUSÃO DE USUÁRIOS
// ==========================================
window.excluirUsuario = async function (id) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
        const res = await fetch(`${API_BASE}/usuarios/${id}`, { method: "DELETE" });
        const data = await res.json();
        alert(data.message || "Usuário excluído com sucesso!");

        // Recarrega tabela
        fetch(`${API_BASE}/obter_logins`)
            .then(response => response.json())
            .then(logins => {
                const tabela = document.getElementById("usuarios-table");
                tabela.innerHTML = "";
                logins.forEach(login => {
                    const linha = document.createElement("tr");
                    linha.innerHTML = `
                        <td class="px-4 py-3">${login.usuario}</td>
                        <td class="px-4 py-3">${login.senha}</td>
                        <td class="px-4 py-3">${login.cargo}</td>
                        <td class="px-4 py-3">
                            <button class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded transition"
                                onclick="abrirModalEditar(${login.id}, '${login.usuario}', '${login.senha}', '${login.cargo}')">
                                Editar
                            </button>
                            <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                                onclick="excluirUsuario(${login.id})">
                                Excluir
                            </button>
                        </td>`;
                    tabela.appendChild(linha);
                });
            });
    } catch (err) {
        console.error("❌ Erro ao excluir usuário:", err);
        alert("Erro ao excluir usuário.");
    }
};
