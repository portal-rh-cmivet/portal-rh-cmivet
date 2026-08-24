/*************************************************
 * PORTAL RH CMIVET
 * portal.js
 * Fluxo:
 *
 * Portal
 * ↓
 * Login
 * ↓
 * Termômetro
 * ↓
 * Dashboard
 *************************************************/


const TOKEN = Auth.getToken();

let USER = Auth.getUser() || {};

let loginLiberado = false;


/*************************************************
 * INICIALIZAÇÃO
 *************************************************/

document.addEventListener(
    "DOMContentLoaded",
    iniciarPortal
);


async function iniciarPortal() {

    try {

        configurarModalLogin();

        configurarModalTermometro();

        configurarLogout();

        /*
         * Primeiro verificamos se existe sessão.
         */

        if (Session.isLogged()) {

            const ok =
                await Auth.validarSessao();

            if (ok) {

                loginLiberado = true;

                USER =
                    Auth.getUser() || {};

                carregarUsuario();

                configurarMenu();

                fecharModalLogin();

                await verificarTermometroHoje();

                return;
            }

        }


        /*
         * Sem sessão:
         * mostra o login.
         */

        abrirModalLogin();


    }

    catch (erro) {

        console.error(
            "Erro ao iniciar Portal:",
            erro
        );

        abrirModalLogin();

    }

}


/*************************************************
 * CONFIGURA LOGIN
 *************************************************/

function configurarModalLogin() {

    const form =
        document.getElementById(
            "portalLoginForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        efetuarLoginPortal
    );

}


/*************************************************
 * LOGIN
 *************************************************/

async function efetuarLoginPortal(event) {

    event.preventDefault();


    const email =
        document.getElementById(
            "portalEmail"
        ).value.trim();


    const senha =
        document.getElementById(
            "portalSenha"
        ).value;


    const botao =
        document.getElementById(
            "portalLoginButton"
        );


    const mensagem =
        document.getElementById(
            "portalLoginMessage"
        );


    mensagem.textContent = "";

    mensagem.className =
        "portal-login-message";


    botao.disabled = true;

    botao.textContent =
        "Entrando...";


    try {


        /*
         * USA A MESMA AUTENTICAÇÃO
         * QUE JÁ EXISTE NO SITE.
         */

        const resposta =
            await Auth.login(
                email,
                senha
            );


        if (
            !resposta ||
            !resposta.sucesso
        ) {

            throw new Error(
                resposta?.erro ||
                "Não foi possível realizar o login."
            );

        }


        /*
         * Atualiza os dados locais.
         */

        USER =
            resposta.usuario ||
            Auth.getUser() ||
            {};


        loginLiberado = true;


        carregarUsuario();

        configurarMenu();


        mensagem.textContent =
            "Login realizado com sucesso.";


        mensagem.classList.add(
            "success"
        );


        /*
         * Fecha o login.
         */

        setTimeout(
            async function () {

                fecharModalLogin();

                /*
                 * Agora verifica o Termômetro.
                 */

                await verificarTermometroHoje();

            },

            350
        );


    }

    catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );


        mensagem.textContent =
            erro.message ||
            "Falha no login.";


        mensagem.classList.add(
            "error"
        );

    }


    finally {

        botao.disabled = false;

        botao.textContent =
            "Entrar no Portal";

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
            .slice(0,2)
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
 * VERIFICA TERMÔMETRO
 *************************************************/

async function verificarTermometroHoje() {

    const status =
        document.getElementById(
            "statusTermometro"
        );


    if (!loginLiberado) {

        return;

    }


    try {

        const resposta =
            await API.verificarTermometroHoje(
                Auth.getToken()
            );


        console.log(
            "Verificação Termômetro:",
            resposta
        );


        if (!resposta.sucesso) {

            if (status) {

                status.textContent =
                    "⚠ Indisponível";

            }

            return;

        }


        if (
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

        else {

            if (status) {

                status.textContent =
                    "🟡 Pendente";

                status.className =
                    "badge warning";

            }


            abrirModalTermometro();

        }

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


    if (fechar) {

        fechar.addEventListener(
            "click",
            async function () {

                await verificarPodeFechar();

            }
        );

    }


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
     * Recebe aviso do termometro.js
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
 * ABRE TERMÔMETRO
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


    if (!modal || !frame) {

        return;

    }


    if (
        !frame.src ||
        !frame.src.includes(
            "termometro.html"
        )
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
 * FECHA TERMÔMETRO
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
 * NÃO PERMITE FECHAR ANTES DA RESPOSTA
 *************************************************/

async function verificarPodeFechar() {

    try {

        const resposta =
            await API.verificarTermometroHoje(
                Auth.getToken()
            );


        if (
            resposta.sucesso &&
            resposta.respondeu === true
        ) {

            fecharModalTermometro();

        }

    }

    catch (erro) {

        console.error(
            erro
        );

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
                Auth.getToken()
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
            "Erro após Termômetro:",
            erro
        );

    }

}


/*************************************************
 * MODAL LOGIN
 *************************************************/

function abrirModalLogin() {

    const modal =
        document.getElementById(
            "loginModal"
        );


    if (!modal) return;


    modal.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";


    setTimeout(
        function () {

            const email =
                document.getElementById(
                    "portalEmail"
                );


            if (email) {

                email.focus();

            }

        },

        100
    );

}


function fecharModalLogin() {

    const modal =
        document.getElementById(
            "loginModal"
        );


    if (!modal) return;


    modal.style.display =
        "none";


    document.body.style.overflow =
        "";

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
 * ERROS
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
