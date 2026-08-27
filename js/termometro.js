/*************************************************
 * PORTAL RH CMIVET
 * termometro.js
 * Versão corrigida
 *************************************************/


/*************************************************
 * INICIALIZAÇÃO
 *************************************************/

document.addEventListener(
    "DOMContentLoaded",
    iniciarPagina
);


/*************************************************
 * INICIAR
 *************************************************/

async function iniciarPagina() {

    try {

        if (
            typeof Auth === "undefined"
        ) {

            console.error(
                "Auth não foi carregado."
            );

            return;

        }


        const token =
            Auth.getToken();


        if (!token) {

            window.location.href =
                "login.html";

            return;

        }


        if (
            typeof Auth.protegerPagina ===
            "function"
        ) {

            await Auth.protegerPagina();

        }


        carregarUsuario();

        configurarMenu();

        configurarLogout();

        configurarFormulario();

        await verificarTermometroHoje();

    }

    catch (erro) {

        console.error(
            "Erro ao iniciar Termômetro:",
            erro
        );

    }

}


/*************************************************
 * USUÁRIO
 *************************************************/

function carregarUsuario() {

    const usuario =
        typeof Auth !== "undefined" &&
        typeof Auth.getUser === "function"
            ? Auth.getUser() || {}
            : {};


    const primeiroNome =
        (usuario.nome || "")
            .split(" ")[0];


    const iniciais =
        (usuario.nome || "")
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
            `Olá, ${primeiroNome}`;

    }


    if (userName) {

        userName.textContent =
            usuario.nome || "";

    }


    if (userRole) {

        userRole.textContent =
            usuario.cargo ||
            usuario.perfil ||
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


    if (!adminLink) {

        return;

    }


    const usuario =
        typeof Auth !== "undefined" &&
        typeof Auth.getUser === "function"
            ? Auth.getUser() || {}
            : {};


    adminLink.hidden =
        String(
            usuario.perfil || ""
        ).toLowerCase() !== "admin";

}


/*************************************************
 * LOGOUT
 *************************************************/

function configurarLogout() {

    const botao =
        document.getElementById(
            "logout"
        );


    if (!botao) {

        return;

    }


    botao.addEventListener(
        "click",
        function () {

            if (
                typeof Auth !== "undefined" &&
                typeof Auth.logout === "function"
            ) {

                Auth.logout();

            }

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


    const botao =
        document.getElementById(
            "sendThermometer"
        );


    if (!formulario) {

        console.error(
            "thermometerForm não encontrado."
        );

        return;

    }


    if (!botao) {

        console.error(
            "sendThermometer não encontrado."
        );

        return;

    }


    /*
     * Submit do formulário
     */

    formulario.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            enviarTermometro();

        }
    );


    /*
     * Clique direto no botão
     *
     * Isso garante que o botão funcione
     * mesmo se houver algum conflito
     * com o formulário.
     */

    botao.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            enviarTermometro();

        }
    );

}


/*************************************************
 * VERIFICAR RESPOSTA DO DIA
 *************************************************/

async function verificarTermometroHoje() {

    const status =
        document.getElementById(
            "statusTermometro"
        );


    const formulario =
        document.getElementById(
            "thermometerForm"
        );


    if (!status) {

        return;

    }


    try {

        const token =
            Auth.getToken();


        if (!token) {

            return;

        }


        const resposta =
            await API.verificarTermometroHoje(
                token
            );


        console.log(
            "Resposta completa:",
            resposta
        );


        if (
            !resposta ||
            !resposta.sucesso
        ) {

            throw new Error(
                resposta?.erro ||
                "Erro ao verificar."
            );

        }


        const respondeu =
            Boolean(
                resposta.respondeu === true ||
                resposta.respondido === true ||
                resposta.jaRespondeu === true ||
                resposta.data?.respondido === true
            );


        if (respondeu) {

            status.textContent =
                "✅ Respondido hoje";


            status.className =
                "badge success";


            if (formulario) {

                formulario.style.display =
                    "none";

            }


            return;

        }


        status.textContent =
            "🟡 Pendente";


        status.className =
            "badge warning";


        if (formulario) {

            formulario.style.display =
                "block";

        }

    }

    catch (erro) {

        console.error(
            "Erro ao verificar termômetro:",
            erro
        );


        status.textContent =
            "⚠ Erro ao consultar";


        status.className =
            "badge error";

    }

}


/*************************************************
 * ENVIAR TERMÔMETRO
 *************************************************/

let enviandoTermometro = false;


async function enviarTermometro() {

    if (enviandoTermometro) {

        return;

    }


    const formulario =
        document.getElementById(
            "thermometerForm"
        );


    const mensagem =
        document.getElementById(
            "thermometerMessage"
        );


    const botao =
        document.getElementById(
            "sendThermometer"
        );


    if (!formulario) {

        console.error(
            "thermometerForm não encontrado."
        );

        return;

    }


    if (!mensagem) {

        console.error(
            "thermometerMessage não encontrado."
        );

        return;

    }


    if (!botao) {

        console.error(
            "sendThermometer não encontrado."
        );

        return;

    }


    /*
     * PEGA O TOKEN AGORA.
     *
     * Não usamos mais um TOKEN fixo
     * criado no carregamento do arquivo.
     */

    const token =
        Auth.getToken();


    if (!token) {

        mensagem.textContent =
            "Sua sessão expirou. Faça login novamente.";

        mensagem.className =
            "error";

        return;

    }


    const humor =
        formulario.querySelector(
            "input[name='humor']:checked"
        );


    const energia =
        document.getElementById(
            "energia"
        );


    const observacao =
        document.getElementById(
            "observacao"
        );


    /*
     * VALIDA HUMOR
     */

    if (!humor) {

        mensagem.textContent =
            "Selecione como você está hoje.";

        mensagem.className =
            "error";

        return;

    }


    /*
     * VALIDA ENERGIA
     */

    if (
        !energia ||
        !energia.value
    ) {

        mensagem.textContent =
            "Selecione seu nível de energia.";

        mensagem.className =
            "error";

        return;

    }


    /*
     * BLOQUEIA DUPLO CLIQUE
     */

    enviandoTermometro =
        true;


    botao.disabled =
        true;


    botao.textContent =
        "Enviando...";


    mensagem.textContent =
        "";


    try {

        console.log(
            "Enviando Termômetro:",
            {
                humor: humor.value,
                energia: energia.value
            }
        );


        const resposta =
            await API.salvarTermometro({

                token: token,

                humor:
                    humor.value,

                energia:
                    energia.value,

                observacao:
                    observacao
                        ? observacao.value.trim()
                        : ""

            });


        console.log(
            "Resposta ao salvar:",
            resposta
        );


        if (
            !resposta ||
            !resposta.sucesso
        ) {

            throw new Error(
                resposta?.erro ||
                "Não foi possível registrar a resposta."
            );

        }


        mensagem.textContent =
            "✅ Resposta registrada com sucesso.";


        mensagem.className =
            "success";


        /*
         * Atualiza o status
         */

        await verificarTermometroHoje();


        /*
         * Se estiver dentro de um iframe/modal,
         * avisa o Portal.
         */

        if (
            window.parent &&
            window.parent !== window
        ) {

            window.parent.postMessage(
                {
                    tipo:
                        "TERMOMETRO_RESPONDIDO"
                },
                window.location.origin
            );

        }


    }

    catch (erro) {

        console.error(
            "Erro ao salvar Termômetro:",
            erro
        );


        mensagem.textContent =
            erro.message ||
            "Erro ao registrar resposta.";


        mensagem.className =
            "error";

    }


    finally {

        enviandoTermometro =
            false;


        botao.disabled =
            false;


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


function mostrarMensagem(
    id,
    texto,
    classe = ""
) {

    const elemento =
        $(id);


    if (!elemento) {

        return;

    }


    elemento.textContent =
        texto;


    elemento.className =
        classe;

}


function habilitarBotao(
    id,
    habilitado = true
) {

    const botao =
        $(id);


    if (!botao) {

        return;

    }


    botao.disabled =
        !habilitado;

}


function limparFormulario() {

    const formulario =
        document.getElementById(
            "thermometerForm"
        );


    if (!formulario) {

        return;

    }


    formulario.reset();

}


function formatarData(data) {

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
 * FIM
 *************************************************/
