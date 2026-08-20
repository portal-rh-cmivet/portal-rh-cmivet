/*************************************************
 * PORTAL RH CMIVET
 * portal.js
 * Versão 8.0
 * Termômetro integrado ao Portal
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

        configurarModalTermometro();

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

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(dados)

            }

        );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP " +
                resposta.status
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

        const resposta =
            await fetch(
                `${CONFIG.API_URL}?action=comunicados&t=${Date.now()}`
            );


        const dados =
            await resposta.json();


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

        container.innerHTML = `

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
                        ${escapeHtml(
                            item.titulo || ""
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            item.descricao || ""
                        )}
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
 * TERMÔMETRO
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


        console.log(
            "Verificação do Termômetro:",
            resposta
        );


        if (!resposta.sucesso) {

            status.textContent =
                "Indisponível";

            return;

        }


        if (resposta.respondeu === true) {

            status.textContent =
                "✅ Respondido hoje";

            status.className =
                "badge success";

            fecharModalTermometro();

        }

        else {

            status.textContent =
                "🟡 Pendente";

            status.className =
                "badge warning";


            /*
             * O funcionário ainda não respondeu.
             * Abre automaticamente o Termômetro.
             */

            abrirModalTermometro();

        }

    }

    catch (erro) {

        console.error(
            "Erro ao verificar Termômetro:",
            erro
        );


        status.textContent =
            "⚠ Indisponível";

    }

}


/*************************************************
 * MODAL DO TERMÔMETRO
 *************************************************/

function configurarModalTermometro() {

    const modal =
        document.getElementById(
            "termometroModal"
        );


    const fechar =
        document.getElementById(
            "fecharTermometro"
        );


    const frame =
        document.getElementById(
            "termometroFrame"
        );


    const loading =
        document.getElementById(
            "termometroLoading"
        );


    if (!modal) return;


    /*
     * Botão X
     */

    if (fechar) {

        fechar.addEventListener(
            "click",
            function () {

                fecharModalTermometro();

            }
        );

    }


    /*
     * Quando o Termômetro carregar
     */

    if (frame) {

        frame.addEventListener(
            "load",
            function () {

                if (loading) {

                    loading.style.display =
                        "none";

                }

            }
        );

    }


    /*
     * Mensagem enviada pelo termometro.js
     */

    window.addEventListener(
        "message",
        function (event) {

            if (
                !frame ||
                event.source !== frame.contentWindow
            ) {

                return;

            }


            if (
                event.data &&
                event.data.tipo ===
                    "TERMOMETRO_RESPONDIDO"
            ) {

                console.log(
                    "Termômetro respondido."
                );


                atualizarStatusDepoisDaResposta();

            }

        }
    );


    /*
     * ESC
     */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                modal.style.display === "flex"
            ) {

                /*
                 * Permite fechar somente se
                 * a resposta já tiver sido
                 * registrada.
                 */

                verificarPodeFechar();

            }

        }
    );

}


/*************************************************
 * ABRIR MODAL
 *************************************************/

function abrirModalTermometro() {

    const modal =
        document.getElementById(
            "termometroModal"
        );


    const frame =
        document.getElementById(
            "termometroFrame"
        );


    const loading =
        document.getElementById(
            "termometroLoading"
        );


    if (!modal || !frame) return;


    /*
     * Evita recarregar o iframe
     * se ele já estiver aberto.
     */

    if (
        !frame.src ||
        !frame.src.includes("termometro.html")
    ) {

        frame.src =
            "termometro.html?modal=1";

    }


    if (loading) {

        loading.style.display =
            "flex";

    }


    modal.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";

}


/*************************************************
 * FECHAR MODAL
 *************************************************/

function fecharModalTermometro() {

    const modal =
        document.getElementById(
            "termometroModal"
        );


    if (!modal) return;


    modal.style.display =
        "none";


    document.body.style.overflow =
        "";


    const frame =
        document.getElementById(
            "termometroFrame"
        );


    /*
     * Não removemos o iframe.
     * Assim a sessão continua intacta.
     */

}


/*************************************************
 * VERIFICA SE PODE FECHAR
 *************************************************/

async function verificarPodeFechar() {

    try {

        const resposta =
            await API.verificarTermometroHoje(
                TOKEN
            );


        if (
            resposta.sucesso &&
            resposta.respondeu === true
        ) {

            fecharModalTermometro();

        }

    }

    catch (erro) {

        console.error(erro);

    }

}


/*************************************************
 * APÓS RESPOSTA
 *************************************************/

async function atualizarStatusDepoisDaResposta() {

    const status =
        document.getElementById(
            "statusTermometro"
        );


    try {

        const resposta =
            await API.verificarTermometroHoje(
                TOKEN
            );


        if (
            resposta.sucesso &&
            resposta.respondeu === true
        ) {

            if (status) {

                status.textContent =
                    "✅ Respondido hoje";

                status.className =
                    "badge success";

            }


            fecharModalTermometro();

        }

    }

    catch (erro) {

        console.error(
            "Erro após resposta:",
            erro
        );

    }

}


/*************************************************
 * ATUALIZA STATUS
 *************************************************/

async function atualizarStatusTermometro() {

    await verificarTermometroHoje();

}


/*************************************************
 * RESUMO 90 DIAS
 *************************************************/

async function carregarResumoTermometro() {

    if (
        String(USER.perfil)
            .toLowerCase() !== "admin"
    ) {

        return;

    }


    try {

        const resposta =
            await API.resumoTermometro90(
                TOKEN
            );


        if (!resposta.sucesso) {

            return;

        }


        console.log(
            "Resumo Termômetro:",
            resposta
        );

    }

    catch (erro) {

        console.error(
            "Erro ao carregar resumo:",
            erro
        );

    }

}


/*************************************************
 * UTILITÁRIOS
 *************************************************/

function $(id) {

    return document.getElementById(id);

}


function showMessage(id, texto) {

    const elemento = $(id);

    if (!elemento) return;

    elemento.textContent = texto;

}


function setLoading(id, ativo = true) {

    const elemento = $(id);

    if (!elemento) return;

    if (ativo) {

        elemento.classList.add(
            "loading"
        );

    }

    else {

        elemento.classList.remove(
            "loading"
        );

    }

}


function formatDate(data) {

    if (!data) return "";

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle:"short",
            timeStyle:"short"
        }
    ).format(
        new Date(data)
    );

}


function escapeHtml(texto) {

    if (!texto) return "";

    return String(texto)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


function capitalize(texto) {

    if (!texto) return "";

    return texto.charAt(0).toUpperCase() +
        texto.slice(1).toLowerCase();

}


function primeiroNome(nome) {

    if (!nome) return "";

    return nome
        .trim()
        .split(" ")[0];

}


function obterIniciais(nome) {

    if (!nome) return "--";

    return nome
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0,2)
        .map(p => p[0])
        .join("")
        .toUpperCase();

}


function hoje() {

    return new Date()
        .toLocaleDateString("pt-BR");

}


function agora() {

    return new Date()
        .toLocaleString("pt-BR");

}


function log(...dados) {

    if (CONFIG.DEBUG) {

        console.log(...dados);

    }

}


/*************************************************
 * MÓDULOS
 *************************************************/

async function carregarCafeRH() {

    try {

        log(
            "Carregando Café com RH..."
        );

    }

    catch (erro) {

        console.error(erro);

    }

}


async function carregarBiblioteca() {

    try {

        log(
            "Carregando Biblioteca..."
        );

    }

    catch (erro) {

        console.error(erro);

    }

}


async function carregarUniversidade() {

    try {

        log(
            "Carregando Universidade..."
        );

    }

    catch (erro) {

        console.error(erro);

    }

}


async function carregarAvaliacoes() {

    try {

        log(
            "Carregando Avaliações..."
        );

    }

    catch (erro) {

        console.error(erro);

    }

}


async function carregarBeneficios() {

    try {

        log(
            "Carregando Benefícios..."
        );

    }

    catch (erro) {

        console.error(erro);

    }

}


async function carregarPerfil() {

    try {

        log(
            "Carregando Perfil..."
        );

    }

    catch (erro) {

        console.error(erro);

    }

}


async function carregarAdministracao() {

    if (
        String(USER.perfil)
            .toLowerCase() !== "admin"
    ) {

        return;

    }


    try {

        log(
            "Carregando Administração..."
        );

    }

    catch (erro) {

        console.error(erro);

    }

}


/*************************************************
 * NAVEGAÇÃO
 *************************************************/

function abrirPagina(pagina) {

    if (!pagina) return;

    window.location.href =
        pagina;

}


/*************************************************
 * DASHBOARD
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
 * USUÁRIO
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
 * ATALHOS
 *************************************************/

function configurarAtalhos() {

    document
        .querySelectorAll("[data-link]")
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
 * FIM
 *************************************************/
