// Quando a página for carregada, registra evento de envio do formulário de cadastro, se existir
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formulario-tarefas'); // Tenta pegar o formulário de cadastro

    if (form) {
        // Evento de envio do formulário
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const registroUsuario = document.getElementById('register-username').value.trim();
            const registroSenha = document.getElementById('register-password').value.trim();
            const registroFuncao = document.getElementById('user-role').value;

            // Primeiro, buscar os usuários existentes para verificação
            fetch("http://127.0.0.1:5000/obter_logins")
                .then(response => response.json())
                .then(logins => {
                    // Verifica se já existe usuário com mesmo nome e senha
                    const existeUsuarioRepetido = logins.some(login =>
                        login.usuario.toLowerCase() === registroUsuario.toLowerCase() &&
                        login.senha === registroSenha
                    );

                    if (existeUsuarioRepetido) {
                        alert("Já existe um usuário com esse nome e senha. Por favor, escolha outro.");
                        return; // Sai, não faz o cadastro
                    }

                    // Se não existir, faz o registro normalmente
                    fetch('http://127.0.0.1:5000/registrar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            registro_usuario: registroUsuario,
                            registro_senha: registroSenha,
                            registro_funcao: registroFuncao.charAt(0).toUpperCase() + registroFuncao.slice(1)
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.message === 'Usuário registrado com sucesso.') {
                                alert('Registro bem-sucedido!');
                                carregarLogins(); // Atualiza a tabela
                                form.reset();     // Limpa o formulário
                            } else {
                                alert(data.message);
                            }
                        })
                        .catch(error => console.error('Erro:', error));
                })
                .catch(error => {
                    console.error('Erro ao buscar usuários:', error);
                    alert('Não foi possível verificar usuários existentes.');
                });
        });

    }
});


// Função que carrega e exibe os usuários cadastrados na tabela
function carregarLogins() {
    fetch("http://127.0.0.1:5000/obter_logins") // Requisição GET para obter os logins
        .then(response => response.json())
        .then(logins => {
            const tabela = document.getElementById("usuarios-table"); // Elemento <tbody> da tabela
            tabela.innerHTML = ""; // Limpa a tabela antes de adicionar os dados

            // Para cada login, cria uma nova linha na tabela
            logins.forEach(login => {
                const linha = document.createElement("tr");

                linha.innerHTML = `
                    <td class="px-4 py-3">${login.usuario}</td>
                    <td class="px-4 py-3">${login.senha}</td> <!-- Exibe a senha -->
                    <td class="px-4 py-3">${login.cargo}</td>
                    <td class="px-4 py-3">
                        <div class="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                        <!-- Botão para abrir o modal de edição -->
                        <button 
                        class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded w-full sm:w-auto transition"
                        onclick="abrirModalEditar(${login.id}, '${login.usuario}', '${login.senha}', '${login.cargo}')"
                        >
                        Editar
                        </button>

                        <!-- Botão para excluir o usuário -->
                        <button 
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded w-full sm:w-auto transition"
                        onclick="excluirUsuario(${login.id})"
                        >
                        Excluir
                        </button>
                        </div>
                        </td>

                `;

                tabela.appendChild(linha); // Adiciona a linha à tabela
            });
        })
        .catch(error => {

        });
}


// Quando a página for carregada, chama a função para carregar os logins
document.addEventListener('DOMContentLoaded', function () {
    carregarLogins();
});


// Variável global para armazenar o ID do usuário em edição
let usuarioEditandoId = null;

// Função que abre o modal de edição e preenche os campos com os dados do usuário
function abrirModalEditar(id, usuario, senha, funcao) {
    usuarioEditandoId = id; // Guarda o ID do usuário atual

    // Preenche os campos do formulário de edição
    document.getElementById("input-usuario").value = usuario;
    document.getElementById("input-senha").value = senha;
    document.getElementById("input-funcao").value = funcao;

    // Mostra o modal
    document.getElementById("modal-editar").classList.remove("hidden");
}

// Função para fechar o modal de edição e limpar o ID
function fecharModalEditar() {
    document.getElementById("modal-editar").classList.add("hidden");
    usuarioEditandoId = null;
}


// Função que salva as alterações feitas no modal de edição
function salvarEdicao(event) {
    event.preventDefault(); // Impede envio padrão do formulário

    const usuario = document.getElementById("input-usuario").value.trim();
    const senha = document.getElementById("input-senha").value.trim();
    const funcao = document.getElementById("input-funcao").value;

    // Primeiro, busca todos os usuários para verificar duplicidade
    fetch("http://127.0.0.1:5000/obter_logins")
        .then(response => response.json())
        .then(logins => {
            const usuarioDuplicado = logins.some(login =>
                login.usuario.toLowerCase() === usuario.toLowerCase() &&
                login.senha === senha &&
                login.id !== usuarioEditandoId // Exclui o próprio usuário que está sendo editado
            );

            if (usuarioDuplicado) {
                alert("Já existe outro usuário com este nome e senha.");
                return; // Não prossegue com a edição
            }

            // Se não for duplicado, faz a edição normalmente
            fetch(`http://127.0.0.1:5000/editar_usuarios/${usuarioEditandoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome_usuario: usuario,
                    senha, funcao
                })
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message); // Mostra mensagem de sucesso
                    fecharModalEditar(); // Fecha o modal
                    carregarLogins();    // Recarrega a tabela
                })
                .catch(error => console.error("Erro ao editar usuário:", error));
        })
        .catch(error => {
            console.error("Erro ao buscar usuários:", error);
            alert("Erro ao verificar duplicidade.");
        });
}


// Função para excluir um usuário com confirmação
function excluirUsuario(id) {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
        fetch(`http://127.0.0.1:5000/usuarios/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);  // Mostra mensagem do backend
                carregarLogins();     // Recarrega a tabela
            })
            .catch(error => console.error("Erro ao excluir usuário:", error));
    }
}


// Função para armazenar informações do usuário logado
function setLoggedInUser(username) {
    localStorage.setItem('loggedInUser', username);
    updateWelcomeMessage();
}

function updateWelcomeMessage() {
    const username = localStorage.getItem('loggedInUser');
    const userNameElement = document.getElementById('user-name');
    const mobileUserNameElement = document.getElementById('mobile-user-name');

    if (username) {
        if (userNameElement) {
            userNameElement.textContent = username;
        }
        if (mobileUserNameElement) {
            mobileUserNameElement.textContent = username;
        }
    }
}

// Função para obter o usuário logado
function getLoggedInUser() {
    return localStorage.getItem('loggedInUser');
}

// Função para fazer logout (limpar dados do usuário)
function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

// Senha padrão de acesso (pode ser alterada)
const SENHA_PADRAO = "luzdomundo";

// Função para verificar acesso com senha padrão
function verificarAcessoPadrao(username, password) {
    // Verifica se é o usuário padrão e senha padrão
    if (username.toLowerCase() === "luzdomundo" && password === SENHA_PADRAO) {
        return {
            success: true,
            username: "Administrador",
            isDefault: true,
            role: "Gerente" // 🔥 Adiciona a role de gerente
        };
    }
    return null;
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        // Primeiro verifica o acesso padrão
        const acessoPadrao = verificarAcessoPadrao(username, password); // 🔥 Removido o parâmetro 'role'
        if (acessoPadrao && acessoPadrao.success) {
            localStorage.setItem("loggedInUser", acessoPadrao.username);
            localStorage.setItem("isDefaultUser", "true"); // Marca como usuário padrão
            localStorage.setItem("userRole", "Gerente"); // 🔥 SALVA COMO GERENTE no localStorage
            window.location.href = "index.html";
            return;
        }

        // Se não for acesso padrão, faz login normal
        fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem("loggedInUser", data.username);
                    localStorage.removeItem("isDefaultUser");

                    // 🟩 Obter o cargo do usuário e armazenar
                    fetch("http://127.0.0.1:5000/verificar_cargo", {
                        method: "GET",
                        credentials: "include"
                    })
                        .then(res => res.json())
                        .then(info => {
                            if (info.success) {
                                localStorage.setItem("userRole", info.cargo); // Ex: "Gerente" ou "Funcionario"
                            } else {
                                localStorage.setItem("userRole", "Funcionario"); // padrão
                            }
                            window.location.href = "index.html";
                        });
                } else {
                    alert(data.message || "Erro ao fazer login");
                }
            })

            .catch(err => console.error("Erro:", err));
    });
}

