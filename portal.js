/**
 * =====================================================
 * PORTAL RH CMIVET
 * portal.js
 * Controle do Dashboard
 * =====================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    iniciarPortal
);


/*************************************************
 * INICIAR PORTAL
 *************************************************/

async function iniciarPortal() {

    console.log(
        "Portal RH CMIVET iniciado."
    );


    /*
     * Verifica se o usuário está autenticado.
     */

    try {

        const autenticado =
            await Auth.validarSessao();


        if (!autenticado) {

            window.location.href =
                "login.html";

            return;

        }

    }

    catch (erro) {

        console.error(
            "Erro ao validar sessão:",
            erro
        );

        window.location.href =
            "login.html";

        return;

    }


    /*
     * Carrega os dados do Dashboard.
     */

    await carregarStatusTermometro();

    await carregarStatusComunicados();


    /*
     * Verifica se o Termômetro
     * precisa ser respondido hoje.
     */

    await verificarTermometroObrigatorio();


    /*
     * Configura botão Sair.
     */

    configurarLogout();

}


/*************************************************
 * STATUS DO TERMÔMETRO
 *************************************************/

async function carregarStatusTermometro() {

    const elemento =
        document.getElementById(
            "statusTermometro"
        );


    if (!elemento) {

        return;

    }


    try {

        const token =
            Auth.getToken();


        if (!token) {

            elemento.textContent =
                "Pendente";

            return;

        }


        const resposta =
            await API.verificarTermometroHoje(
                token
            );


        console.log(
            "Resposta do termômetro:",
            resposta
        );


        if (
            resposta &&
            resposta.sucesso &&
            resposta.respondido
        ) {

            elemento.textContent =
                "✅ Respondido hoje";

            elemento.className =
                "status-on";

        }

        else {

            elemento.textContent =
                "🟡 Pendente";

        }

    }

    catch (erro) {

        console.error(
            "Erro ao verificar termômetro:",
            erro
        );


        elemento.textContent =
            "🟡 Pendente";

    }

}


/*************************************************
 * ABRIR TERMÔMETRO AUTOMATICAMENTE
 *************************************************/

async function verificarTermometroObrigatorio() {

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
            "Verificação obrigatória:",
            resposta
        );


        /*
         * Se não respondeu hoje,
         * abre automaticamente.
         */

        if (
            resposta &&
            resposta.sucesso &&
            !resposta.respondido
        ) {

            setTimeout(
                function() {

                    window.location.href =
                        "termometro.html";

                },
                500
            );

        }

    }

    catch (erro) {

        console.error(
            "Erro ao verificar termômetro obrigatório:",
            erro
        );

    }

}


/*************************************************
 * STATUS DOS COMUNICADOS
 *************************************************/

async function carregarStatusComunicados() {

    const elemento =
        document.getElementById(
            "statusComunicados"
        );


    if (!elemento) {

        return;

    }


    try {

        const resposta =
            await API.getComunicados();


        console.log(
            "Comunicados recebidos:",
            resposta
        );


        if (
            resposta &&
            resposta.sucesso &&
            Array.isArray(
                resposta.comunicados
            )
        ) {

            const quantidade =
                resposta.comunicados.length;


            if (quantidade === 0) {

                elemento.textContent =
                    "Nenhum comunicado";

            }

            else if (quantidade === 1) {

                elemento.textContent =
                    "1 comunicado disponível";

            }

            else {

                elemento.textContent =
                    quantidade +
                    " comunicados disponíveis";

            }

        }

        else {

            elemento.textContent =
                "Nenhum comunicado";

        }

    }

    catch (erro) {

        console.error(
            "Erro ao carregar comunicados:",
            erro
        );


        elemento.textContent =
            "Nenhum comunicado";

    }

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
        async function() {

            botao.disabled = true;

            botao.textContent =
                "Saindo...";


            try {

                const token =
                    Auth.getToken();


                if (token) {

                    await API.logout(
                        token
                    );

                }

            }

            catch (erro) {

                console.error(
                    "Erro ao realizar logout:",
                    erro
                );

            }


            /*
             * Limpa a sessão local.
             */

            Session.logout();


            /*
             * Volta para o login.
             */

            window.location.href =
                "login.html";

        }
    );

}
