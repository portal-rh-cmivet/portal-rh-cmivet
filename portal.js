/*************************************************
 * PORTAL RH CMIVET
 * portal.js
 *
 * FLUXO:
 *
 * index.html
 *      ↓
 * login.html
 *      ↓
 * portal.html
 *      ↓
 * verifica sessão
 *      ↓
 * verifica Termômetro
 *      ↓
 * se pendente → abre automaticamente
 *      ↓
 * responde
 *      ↓
 * Dashboard
 *************************************************/


/*************************************************
 * DADOS DA SESSÃO
 *************************************************/

let USER = Auth.getUser() || {};

let loginLiberado = false;


/*************************************************
 * INICIALIZAÇÃO
 *************************************************/

document.addEventListener(
    "DOMContentLoaded",
    iniciarPortal
);


/*************************************************
 * INICIAR PORTAL
 *************************************************/

async function iniciarPortal() {

    try {

        /*
         * PRIMEIRO:
         * verifica se existe sessão local.
         */

        if (!Session.isLogged()) {

            console.log(
                "Usuário sem sessão."
            );

            window.location.href =
                "login.html";

            return;

        }


        /*
         * SEGUNDO:
         * valida a sessão no Apps Script.
         */

        const sessaoValida =
            await Auth.validarSessao();


        if (!sessaoValida) {

            console.log(
                "Sessão inválida."
            );

            window.location.href =
                "login.html";

            return;

        }


        /*
         * LOGIN CONFIRMADO
         */

        loginLiberado = true;


        USER =
            Auth.getUser() || {};


        /*
         * CARREGA DADOS
         */

        carregarUsuario();

        configurarMenu();

        configurarLogout();


        /*
         * VERIFICA TERMÔMETRO
         */

        await verificarTermometroHoje();


        console.log(
            "Portal iniciado com sucesso."
        );

    }


    catch (erro) {

        console.error(
            "Erro ao iniciar Portal:",
            erro
        );


        window.location.href =
            "login.html";

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
            .map(
                nome => nome[0]
            )
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
        function () {

            Auth.logout();

        }
    );

}


/*************************************************
 * VERIFICAR TERMÔMETRO
 *************************************************/

async function verificarTermometroHoje() {

    if (!loginLiberado) {

        return;

    }


    const status =
        document.getElementById(
            "statusTermometro"
        );


    try {

        console.log(
            "Consultando Termômetro..."
        );


        const resposta =
            await API.verificarTermometroHoje(
                Auth.getToken()
            );


        console.log(
            "Resposta Termômetro:",
            resposta
        );


        /*
         * ERRO NA API
         */

        if (
            !resposta ||
            !resposta.sucesso
        ) {

            console.error(
                "Erro na consulta:",
                resposta
            );


            if (status) {

                status.textContent =
                    "⚠ Indisponível";

                status.className =
                    "badge error";

            }


            return;

        }


        /*
         * JÁ RESPONDEU
         */

        if (
            resposta.respondeu === true
        ) {

            console.log(
                "Termômetro já respondido hoje."
            );


            if (status) {

                status.textContent =
                    "✅ Respondido hoje";

                status.className =
                    "badge success";

            }


            fecharModalTermometro();

            return;

        }


        /*
         * AINDA NÃO RESPONDEU
         */

        console.log(
            "Termômetro pendente."
        );


        if (status) {

            status.textContent =
                "🟡 Pendente";

            status.className =
                "badge warning";

        }


        /*
         * ABRE AUTOMATICAMENTE
         */

        abrirModalTermometro();

    }


    catch (erro) {

        console.error(
            "Erro ao verificar Termômetro:",
            erro
        );

    }

}


/*************************************************
 * CONFIGURA MODAL TERMÔMETRO
 *************************************************/

function configurarModalTermometro() {

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


    /*
     * BOTÃO FECHAR
     */

    if (fechar) {

        fechar.addEventListener(
            "click",
            async function () {

                await verificarPodeFechar();

            }
        );

    }


    /*
     * CARREGAMENTO DO IFRAME
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
     * RECEBE AVISO DO TERMÔMETRO
     */

    window.addEventListener(
        "message",
        async function (event) {

            if (
                !frame ||
                event.source !==
                    frame.contentWindow
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


                await atualizarStatusDepoisDaResposta();

            }

        }
    );

}


/*************************************************
 * ABRIR MODAL TERMÔMETRO
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


    /*
     * SE O MODAL NÃO EXISTIR
     */

    if (!modal || !frame) {

        console.error(
            "Modal do Termômetro não encontrado."
        );

        return;

    }


    /*
     * CARREGA TERMOMETRO
     */

    if (
        !frame.src ||
        !frame.src.includes(
            "termometro.html"
        )
    ) {

        frame.src =
            "termometro.html?modal=1";

    }


    /*
     * MOSTRA LOADING
     */

    if (loading) {

        loading.style.display =
            "flex";

    }


    /*
     * ABRE MODAL
     */

    modal.style.display =
        "flex";


    /*
     * BLOQUEIA ROLAGEM DO DASHBOARD
     */

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

}


/*************************************************
 * NÃO PERMITE FECHAR SEM RESPONDER
 *************************************************/

async function verificarPodeFechar() {

    try {

        const resposta =
            await API.verificarTermometroHoje(
                Auth.getToken()
            );


        if (
            resposta &&
            resposta.sucesso &&
            resposta.respondeu === true
        ) {

            fecharModalTermometro();

        }

        else {

            console.log(
                "Termômetro ainda pendente."
            );

        }

    }


    catch (erro) {

        console.error(
            "Erro ao verificar fechamento:",
            erro
        );

    }

}


/*************************************************
 * ATUALIZAR STATUS DEPOIS DA RESPOSTA
 *************************************************/

async function atualizarStatusDepoisDaResposta() {

    const status =
        document.getElementById(
            "statusTermometro"
        );


    try {

        const resposta =
            await API.verificarTermometroHoje(
                Auth.getToken()
            );


        if (
            resposta &&
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
            "Erro após Termômetro:",
            erro
        );

    }

}


/*************************************************
 * UTILITÁRIOS
 *************************************************/

function $(id) {

    return document.getElementById(
        id
    );

}


/*************************************************
 * ERROS GLOBAIS
 *************************************************/

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "Erro JavaScript:",
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
