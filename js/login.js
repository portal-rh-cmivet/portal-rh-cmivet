/**
 * =====================================================
 * PORTAL RH CMIVET
 * login.js
 * Controle da tela de Login
 * =====================================================
 */

document.addEventListener("DOMContentLoaded", iniciarLogin);

async function iniciarLogin() {

    // Se já existe sessão válida, entra direto
    try {

        if (Session.isLogged()) {

            const ok = await Auth.validarSessao();

            if (ok) {

                window.location.href = "portal.html";
                return;

            }

        }

    } catch (e) {

        console.error(e);

    }

    const form = document.getElementById("loginForm");

    if (!form) {

        console.error("Formulário de login não encontrado.");

        return;

    }

    form.addEventListener("submit", efetuarLogin);

}

/*************************************************
 * LOGIN
 *************************************************/

async function efetuarLogin(event) {

    event.preventDefault();

    const form = event.target;

    const email = form.email.value.trim();

    const senha = form.senha.value;

    const botao = form.querySelector("button");

    const mensagem = document.getElementById("loginMessage");

    mensagem.textContent = "";
    mensagem.className = "message";

    botao.disabled = true;
    botao.textContent = "Entrando...";

    try {

        const resposta = await Auth.login(email, senha);

        mensagem.textContent = "Login realizado com sucesso.";

        mensagem.classList.add("success");

        setTimeout(() => {

            window.location.href = "portal.html";

        }, 500);

    }

    catch (erro) {

        console.error(erro);

        mensagem.textContent = erro.message || "Falha no login.";

        mensagem.classList.add("error");

    }

    finally {

        botao.disabled = false;

        botao.textContent = "Entrar";

    }

}
