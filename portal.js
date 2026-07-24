/*************************************************
 * PORTAL RH CMIVET
 * portal.js
 * Versão 7.0
 *************************************************/

/*************************************************
 * CONFIGURAÇÃO
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
    iniciarPortal
);

async function iniciarPortal() {

    try {

        await Auth.protegerPagina();

        carregarUsuario();

        configurarMenu();

        configurarLogout();

        await carregarDashboard();

    }

    catch (erro) {

        console.error(erro);

        Auth.logout();

    }

}

/*************************************************
 * DASHBOARD
 *************************************************/

async function carregarDashboard() {

    await Promise.all([

        carregarComunicados(),

        verificarTermometroHoje()

    ]);

}

/*************************************************
 * DADOS DO USUÁRIO
 *************************************************/

function carregarUsuario() {

    if (!USER) return;

    const primeiroNome =
        (USER.nome || "")
            .split(" ")[0];

    const iniciais =
        (USER.nome || "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(p => p[0])
            .join("")
            .toUpperCase();

    const welcome =
        document.getElementById("welcome");

    const userName =
        document.getElementById("userName");

    const userRole =
        document.getElementById("userRole");

    const avatar =
        document.getElementById("avatar");

    if (welcome) {

        welcome.textContent =
            `Bem-vindo, ${primeiroNome}`;

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
        document.getElementById("adminLink");

    if (!adminLink) return;

    adminLink.hidden =
        String(USER.perfil)
            .toLowerCase() !== "admin";

}

/*************************************************
 * LOGOUT
 *************************************************/

function configurarLogout() {

    const btn =
        document.getElementById("logout");

    if (!btn) return;

    btn.addEventListener(
        "click",
        () => Auth.logout()
    );

}
/*************************************************
 * COMUNICAÇÃO COM API
 *************************************************/

async function post(dados) {

    try {

        const resposta = await fetch(

            CONFIG.API_URL,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(dados)

            }

        );

        if (!resposta.ok) {

            throw new Error(

                "Erro HTTP " + resposta.status

            );

        }

        return await resposta.json();

    }

    catch (erro) {

        console.error(

            "Erro na API:",

            erro

        );

        throw erro;

    }

}

/*************************************************
 * COMUNICADOS
 *************************************************/

async function carregarComunicados() {

    try {

        const resposta = await fetch(

            `${CONFIG.API_URL}?action=comunicados&t=${Date.now()}`

        );

        const dados = await resposta.json();

        const lista =

            Array.isArray(dados)

                ? dados

                : [];

        renderizarComunicados(lista);

    }

    catch (erro) {

        console.error(erro);

        renderizarComunicados([]);

    }

}

/*************************************************
 * RENDERIZA COMUNICADOS
 *************************************************/

function renderizarComunicados(lista) {

    const container =

        document.getElementById(

            "announcements"

        );

    if (!container) return;

    if (!lista.length) {

        container.innerHTML =

            `

            <div class="empty">

                Nenhum comunicado disponível.

            </div>

            `;

        atualizarStatusComunicados(0);

        return;

    }

    container.innerHTML =

        lista

        .slice(0, 6)

        .map(item => `

            <article class="card">

                <h3>

                    ${escapeHtml(item.titulo || "")}

                </h3>

                <p>

                    ${escapeHtml(item.descricao || "")}

                </p>

            </article>

        `)

        .join("");

    atualizarStatusComunicados(

        lista.length

    );

}

/*************************************************
 * STATUS DOS COMUNICADOS
 *************************************************/

function atualizarStatusComunicados(total) {

    const status =

        document.getElementById(

            "statusComunicados"

        );

    if (!status) return;

    if (total === 0) {

        status.textContent =

            "Nenhum comunicado";

        return;

    }

    if (total === 1) {

        status.textContent =

            "1 comunicado";

        return;

    }

    status.textContent =

        `${total} comunicados`;

}
/*************************************************
 * TERMÔMETRO EMOCIONAL
 *************************************************/

async function verificarTermometroHoje() {

    const status =

        document.getElementById(

            "statusTermometro"

        );

    if (!status) return;

    try {

        const resposta =

            await API.verificarTermometroHoje(

                TOKEN

            );

        if (

            resposta.sucesso &&

            resposta.respondeu

        ) {

            status.textContent =

                "Respondido hoje";

        }

        else {

            status.textContent =

                "Pendente";

        }

    }

    catch (erro) {

        console.error(erro);

        status.textContent =

            "Indisponível";

    }

}

/*************************************************
 * ABRIR TERMÔMETRO
 *************************************************/

function abrirTermometro() {

    window.location.href =

        "termometro.html";

}

/*************************************************
 * ATUALIZA STATUS
 *************************************************/

async function atualizarStatusTermometro() {

    try {

        const resposta =

            await API.verificarTermometroHoje(

                TOKEN

            );

        const card =

            document.getElementById(

                "statusTermometro"

            );

        if (!card) return;

        if (

            resposta.sucesso &&

            resposta.respondeu

        ) {

            card.textContent =

                "Respondido hoje";

        }

        else {

            card.textContent =

                "Pendente";

        }

    }

    catch (erro) {

        console.error(erro);

    }

}

/*************************************************
 * RESUMO DOS ÚLTIMOS 90 DIAS
 *************************************************/

async function carregarResumoTermometro() {

    if (

        String(USER.perfil)

            .toLowerCase()

            !== "admin"

    ) {

        return;

    }

    try {

        const resposta =

            await API.resumoTermometro90(

                TOKEN

            );

        if (

            !resposta.sucesso

        ) {

            return;

        }

        console.log(

            "Resumo Termômetro:",

            resposta

        );

    }
      /*************************************************
 * UTILITÁRIOS
 *************************************************/

function $(id) {

    return document.getElementById(id);

}

/*************************************************
 * MENSAGENS
 *************************************************/

function showMessage(id, texto) {

    const elemento = $(id);

    if (!elemento) return;

    elemento.textContent = texto;

}

/*************************************************
 * LOADING
 *************************************************/

function setLoading(id, ativo = true) {

    const elemento = $(id);

    if (!elemento) return;

    if (ativo) {

        elemento.classList.add("loading");

    }

    else {

        elemento.classList.remove("loading");

    }

}

/*************************************************
 * FORMATAR DATA
 *************************************************/

function formatDate(data) {

    if (!data) {

        return "";

    }

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

/*************************************************
 * ESCAPAR HTML
 *************************************************/

function escapeHtml(texto) {

    if (!texto) {

        return "";

    }

    return String(texto)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}

/*************************************************
 * CAPITALIZAR
 *************************************************/

function capitalize(texto) {

    if (!texto) {

        return "";

    }

    return texto.charAt(0).toUpperCase() +

        texto.slice(1).toLowerCase();

}

/*************************************************
 * PRIMEIRO NOME
 *************************************************/

function primeiroNome(nome) {

    if (!nome) {

        return "";

    }

    return nome

        .trim()

        .split(" ")[0];

}

/*************************************************
 * INICIAIS
 *************************************************/

function obterIniciais(nome) {

    if (!nome) {

        return "--";

    }

    return nome

        .trim()

        .split(" ")

        .filter(Boolean)

        .slice(0, 2)

        .map(p => p[0])

        .join("")

        .toUpperCase();

}

/*************************************************
 * DATA ATUAL
 *************************************************/

function hoje() {

    return new Date()

        .toLocaleDateString(

            "pt-BR"

        );

}

/*************************************************
 * DATA/HORA
 *************************************************/

function agora() {

    return new Date()

        .toLocaleString(

            "pt-BR"

        );

}

/*************************************************
 * LOG
 *************************************************/

function log(...dados) {

    if (

        CONFIG.DEBUG

    ) {

        console.log(

            ...dados

        );

    }

}
  /*************************************************
 * MÓDULOS DO PORTAL
 *************************************************/

/*************************************************
 * CAFÉ COM RH
 *************************************************/

async function carregarCafeRH() {

    try {

        log("Carregando Café com RH...");

    }

    catch (erro) {

        console.error(erro);

    }

}

/*************************************************
 * BIBLIOTECA RH
 *************************************************/

async function carregarBiblioteca() {

    try {

        log("Carregando Biblioteca...");

    }

    catch (erro) {

        console.error(erro);

    }

}

/*************************************************
 * UNIVERSIDADE CMIVET
 *************************************************/

async function carregarUniversidade() {

    try {

        log("Carregando Universidade...");

    }

    catch (erro) {

        console.error(erro);

    }

}

/*************************************************
 * AVALIAÇÕES
 *************************************************/

async function carregarAvaliacoes() {

    try {

        log("Carregando Avaliações...");

    }

    catch (erro) {

        console.error(erro);

    }

}

/*************************************************
 * BENEFÍCIOS
 *************************************************/

async function carregarBeneficios() {

    try {

        log("Carregando Benefícios...");

    }

    catch (erro) {

        console.error(erro);

    }

}

/*************************************************
 * PERFIL
 *************************************************/

async function carregarPerfil() {

    try {

        log("Carregando Perfil...");

    }

    catch (erro) {

        console.error(erro);

    }

}

/*************************************************
 * ADMINISTRAÇÃO
 *************************************************/

async function carregarAdministracao() {

    if (

        String(USER.perfil)

            .toLowerCase()

            !== "admin"

    ) {

        return;

    }

    try {

        log("Carregando Administração...");

    }

    catch (erro) {

        console.error(erro);

    }

}
  /*************************************************
 * NAVEGAÇÃO
 *************************************************/

function abrirPagina(pagina) {

    if (!pagina) {

        return;

    }

    window.location.href = pagina;

}

/*************************************************
 * RECARREGAR DASHBOARD
 *************************************************/

async function atualizarDashboard() {

    try {

        await carregarDashboard();

    }

    catch (erro) {

        console.error(erro);

    }

}

/*************************************************
 * ATUALIZAR DADOS DO USUÁRIO
 *************************************************/

async function atualizarUsuario() {

    try {

        carregarUsuario();

    }

    catch (erro) {

        console.error(erro);

    }

}

/*************************************************
 * EVENTOS
 *************************************************/

function configurarEventos() {

    const sair =

        document.getElementById("logout");

    if (sair) {

        sair.addEventListener(

            "click",

            () => Auth.logout()

        );

    }

}

/*************************************************
 * ATALHOS DO DASHBOARD
 *************************************************/

function configurarAtalhos() {

    document

        .querySelectorAll(

            "[data-link]"

        )

        .forEach(botao => {

            botao.addEventListener(

                "click",

                function () {

                    abrirPagina(

                        this.dataset.link

                    );

                }

            );

        });

}

/*************************************************
 * INICIALIZAÇÃO FINAL
 *************************************************/

async function iniciarSistema() {

    try {

        configurarEventos();

        configurarAtalhos();

        await atualizarDashboard();

    }

    catch (erro) {

        console.error(erro);

    }

}

/*************************************************
 * ERROS GLOBAIS
 *************************************************/

window.addEventListener(

    "error",

    function (event) {

        console.error(

            "Erro:",

            event.error

        );

    }

);

window.addEventListener(

    "unhandledrejection",

    function (event) {

        console.error(

            "Promise rejeitada:",

            event.reason

        );

    }

);

/*************************************************
 * EXECUÇÃO
 *************************************************/

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await iniciarSistema();

    }

);

/*************************************************
 * FIM DO ARQUIVO
 *************************************************/
  

    catch (erro) {

        console.error(

            erro

        );

    }

}
