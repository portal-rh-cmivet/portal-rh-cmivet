/*************************************************
 * PORTAL RH CMIVET
 * termometro.js
 * Versão 7.0 Enterprise
 *************************************************/

/*************************************************
 * AUTENTICAÇÃO
 *************************************************/

const TOKEN = Auth.getToken();

const USER = Auth.getUser() || {};

/*************************************************
 * SEM LOGIN
 *************************************************/

if (!TOKEN) {

    window.location.href = "login.html";

}

/*************************************************
 * INICIALIZAÇÃO
 *************************************************/

document.addEventListener(

    "DOMContentLoaded",

    iniciarPagina

);

async function iniciarPagina() {

    try {

        await Auth.protegerPagina();

        carregarUsuario();

        configurarMenu();

        configurarLogout();

        configurarFormulario();

        await verificarTermometroHoje();

      }

    catch (erro) {

        console.error(erro);

        Auth.logout();

    }

}
  /*************************************************
 * DADOS DO USUÁRIO
 *************************************************/

function carregarUsuario() {

    const primeiroNome =
        (USER.nome || "")
            .split(" ")[0];

    const iniciais =
        (USER.nome || "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(nome => nome[0])
            .join("")
            .toUpperCase();

    const welcome =
        document.getElementById(
            "welcome"
        );

    const userName =
        document.getElementById(
            "userName"
        );

    const userRole =
        document.getElementById(
            "userRole"
        );

    const avatar =
        document.getElementById(
            "avatar"
        );

    if (welcome) {

        welcome.textContent =
            `Olá, ${primeiroNome}`;

    }

    if (userName) {

        userName.textContent =
            USER.nome || "";

    }

    if (userRole) {

        userRole.textContent =
            USER.cargo ||
            USER.perfil ||
            "";

    }

    if (avatar) {

        avatar.textContent =
            iniciais || "--";

    }

}

/*************************************************
 * MENU
 *************************************************/

function configurarMenu() {

    const adminLink =
        document.getElementById(
            "adminLink"
        );

    if (!adminLink) return;

    adminLink.hidden =
        String(USER.perfil)
            .toLowerCase() !==
        "admin";

}

/*************************************************
 * LOGOUT
 *************************************************/

function configurarLogout() {

    const botao =
        document.getElementById(
            "logout"
        );

    if (!botao) return;

    botao.addEventListener(

        "click",

        () => {

            Auth.logout();

        }

    );

}
  /*************************************************
 * FORMULÁRIO
 *************************************************/

function configurarFormulario() {

    const formulario =
        document.getElementById(
            "thermometerForm"
        );

    if (!formulario) return;

    formulario.addEventListener(

        "submit",

        enviarTermometro

    );

}

/*************************************************
 * VERIFICA SE O COLABORADOR JÁ RESPONDEU HOJE
 *************************************************/

async function verificarTermometroHoje() {

    const status = document.getElementById("statusTermometro");
    const formulario = document.getElementById("thermometerForm");

    if (!status) return;

    try {

        const resposta = await API.verificarTermometroHoje(TOKEN);

        console.log("Resposta completa:", JSON.stringify(resposta));
        console.log("Resposta objeto:", resposta);

        if (!resposta.sucesso) {

            throw new Error(
                resposta.erro || "Erro ao verificar."
            );

        }

        // A API retorna: respondeu
        if (resposta.respondeu === true) {

            console.log("Usuário já respondeu hoje.");

            status.textContent = "✅ Respondido hoje";
            status.className = "badge success";

            if (formulario) {
                formulario.style.display = "none";
            }

        } else {

            console.log("Usuário ainda NÃO respondeu hoje.");

            status.textContent = "🟡 Pendente";
            status.className = "badge warning";

            if (formulario) {
                formulario.style.display = "block";
            }

        }

    }

    catch (erro) {

        console.error("Erro ao verificar termômetro:", erro);

        status.textContent = "⚠ Erro ao consultar";
        status.className = "badge error";

    }

  /*************************************************
 * ENVIO DO TERMÔMETRO
 *************************************************/

async function enviarTermometro(event) {

    event.preventDefault();

    const mensagem =
        document.getElementById(
            "thermometerMessage"
        );

    const botao =
        document.getElementById(
            "sendThermometer"
        );

    const humor =
        obterValor(
            "input[name='humor']:checked"
        );

    const energia =
        document.getElementById(
            "energia"
        ).value;

    const observacao =
        document.getElementById(
            "observacao"
        ).value.trim();

    mensagem.textContent = "";

    mensagem.className = "";

    botao.disabled = true;

    botao.textContent =
        "Enviando...";

    try {

       const resposta =
    await API.salvarTermometro({

        token: TOKEN,

        humor: humor,

        energia: energia,

        observacao: observacao

    });

        if (!resposta.sucesso) {

            throw new Error(

                resposta.erro ||

                "Não foi possível registrar."

            );

        }

        mensagem.textContent =
            "✅ Resposta registrada com sucesso.";

        mensagem.classList.add(
            "success"
        );

        document.getElementById(
            "thermometerForm"
        ).reset();

        await verificarTermometroHoje();

    }

    catch (erro) {

        console.error(erro);

        mensagem.textContent =
            erro.message;

        mensagem.classList.add(
            "error"
        );

    }

    finally {

        botao.disabled = false;

        botao.textContent =
            "Enviar Resposta";

    }

}
  /*************************************************
 * UTILITÁRIOS
 *************************************************/

function obterValor(seletor) {

    const elemento =
        document.querySelector(
            seletor
        );

    return elemento
        ? elemento.value
        : "";

}

function $(id) {

    return document.getElementById(
        id
    );

}

function mostrarMensagem(id, texto, classe = "") {

    const elemento = $(id);

    if (!elemento) return;

    elemento.textContent = texto;

    elemento.className = classe;

}

function habilitarBotao(id, habilitado = true) {

    const botao = $(id);

    if (!botao) return;

    botao.disabled = !habilitado;

}

function limparFormulario() {

    const formulario =
        document.getElementById(
            "thermometerForm"
        );

    if (!formulario) return;

    formulario.reset();

}

function formatarData(data) {

    if (!data) return "";

    return new Intl.DateTimeFormat(

        "pt-BR",

        {

            dateStyle: "short",

            timeStyle: "short"

        }

    ).format(

        new Date(data)

    );

}

function escapeHtml(texto) {

    if (!texto) return "";

    return String(texto)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}
  /*************************************************
 * ERROS GLOBAIS
 *************************************************/

window.addEventListener(

    "unhandledrejection",

    function(event) {

        console.error(

            "Promise rejeitada:",

            event.reason

        );

    }

);

window.addEventListener(

    "error",

    function(event) {

        console.error(

            "Erro JavaScript:",

            event.error

        );

    }

);

/*************************************************
 * FIM DO ARQUIVO
 *************************************************/
