/**
 * =====================================================
 * PORTAL RH CMIVET
 * portal.js
 *
 * VERSÃO LIMPA
 *
 * Login em modal
 * Termômetro em modal
 * Comunicados
 * Dashboard
 *
 * =====================================================
 */

(function () {

    "use strict";


    /* =====================================================
       CONFIGURAÇÕES
       ===================================================== */

    const STORAGE_TOKEN = "portal_token";


    /* =====================================================
       SESSÃO
       ===================================================== */

    function getToken() {

        return (
            localStorage.getItem(STORAGE_TOKEN) ||
            localStorage.getItem("token") ||
            sessionStorage.getItem(STORAGE_TOKEN) ||
            sessionStorage.getItem("token") ||
            ""
        );

    }


    function salvarToken(token) {

        if (!token) {
            return;
        }

        localStorage.setItem(
            STORAGE_TOKEN,
            token
        );

        localStorage.setItem(
            "token",
            token
        );

    }


    function limparSessao() {

        localStorage.removeItem(
            STORAGE_TOKEN
        );

        localStorage.removeItem(
            "token"
        );

        sessionStorage.removeItem(
            STORAGE_TOKEN
        );

        sessionStorage.removeItem(
            "token"
        );

    }


    /* =====================================================
       ESTILOS DOS MODAIS
       ===================================================== */

    function criarEstilosModal() {

        if (
            document.getElementById(
                "portalModalStyles"
            )
        ) {
            return;
        }


        const style =
            document.createElement("style");


        style.id =
            "portalModalStyles";


        style.textContent = `

        /* ================================================
           FUNDO
           ================================================ */

        .portal-overlay {

            position: fixed;

            inset: 0;

            z-index: 99999;

            display: flex;

            align-items: center;

            justify-content: center;

            padding: 12px;

            background: #083f39;

            overflow: hidden;

        }


        .portal-overlay[hidden] {

            display: none !important;

        }


        /* ================================================
           LOGIN
           ================================================ */

        .portal-login-card {

            width: min(
                430px,
                calc(100vw - 24px)
            );

            max-height:
                calc(100vh - 24px);

            overflow: hidden;

            padding: 20px;

            background: #0f6258;

            color: #ffffff;

            border:
                1px solid
                #c9ab5d;

            border-radius: 18px;

            box-shadow:
                0 25px 70px
                rgba(0,0,0,.35);

        }


        .portal-modal-logo {

            display: block;

            width: 105px;

            height: 48px;

            margin: 0 auto 7px;

            object-fit: contain;

        }


        .portal-modal-pill {

            display: table;

            margin: 0 auto 8px;

            padding: 5px 11px;

            background: #c9ab5d;

            color: #083f39;

            border-radius: 999px;

            font-size: .68rem;

            font-weight: 900;

        }


        .portal-login-card h2 {

            margin: 5px 0;

            color: #ffffff;

            text-align: center;

            font-size: 1.55rem;

        }


        .portal-login-card > p {

            margin: 0 0 14px;

            color:
                rgba(255,255,255,.82);

            text-align: center;

            font-size: .8rem;

            line-height: 1.4;

        }


        .portal-login-form {

            display: grid;

            gap: 10px;

        }


        .portal-login-form label {

            display: grid;

            gap: 5px;

            color: #ffffff;

            font-size: .8rem;

            font-weight: 800;

        }


        .portal-login-form input {

            width: 100%;

            height: 42px;

            padding: 0 12px;

            border: 0;

            border-radius: 8px;

            background: #ffffff;

            color: #153a36;

            outline: none;

        }


        .portal-login-form button {

            width: 100%;

            height: 43px;

            margin-top: 2px;

            border:
                1px solid
                #c9ab5d;

            border-radius: 8px;

            background: #c9ab5d;

            color: #083f39;

            font-weight: 900;

            cursor: pointer;

        }


        .portal-login-form button:disabled {

            opacity: .65;

            cursor: not-allowed;

        }


        .portal-login-message {

            min-height: 18px;

            color: #ffe4a1;

            text-align: center;

            font-size: .75rem;

            font-weight: 800;

        }


        /* ================================================
           TERMÔMETRO
           ================================================ */

        .portal-thermometer-card {

            width: min(
                600px,
                calc(100vw - 24px)
            );

            max-height:
                calc(100vh - 24px);

            overflow: hidden;

            padding: 18px 22px;

            background: #0f6258;

            color: #ffffff;

            border:
                1px solid
                #c9ab5d;

            border-radius: 18px;

            box-shadow:
                0 25px 70px
                rgba(0,0,0,.38);

        }


        .portal-thermometer-card h2 {

            margin: 4px 0;

            color: #ffffff;

            text-align: center;

            font-size: 1.45rem;

            line-height: 1.1;

        }


        .portal-thermometer-card > p {

            max-width: 520px;

            margin: 0 auto 12px;

            color:
                rgba(255,255,255,.82);

            text-align: center;

            font-size: .78rem;

            line-height: 1.35;

        }


        .portal-thermometer-form {

            display: grid;

            gap: 10px;

        }


        .portal-question {

            color: #ffffff;

            font-size: .78rem;

            font-weight: 900;

        }


        /* ================================================
           HUMORES
           ================================================ */

        .portal-moods {

            display: grid;

            grid-template-columns:
                repeat(5, 1fr);

            gap: 7px;

            margin-top: 6px;

        }


        .portal-mood {

            position: relative;

        }


        .portal-mood input {

            position: absolute;

            opacity: 0;

            pointer-events: none;

        }


        .portal-mood label {

            min-height: 76px;

            padding: 5px 3px;

            display: grid;

            place-items: center;

            align-content: center;

            gap: 4px;

            background:
                rgba(255,255,255,.08);

            border:
                1px solid
                rgba(255,255,255,.25);

            border-radius: 9px;

            cursor: pointer;

            text-align: center;

        }


        .portal-mood label span {

            font-size: 1.5rem;

            line-height: 1;

        }


        .portal-mood label strong {

            color: #ffffff;

            font-size: .6rem;

        }


        .portal-mood input:checked
        + label {

            background: #e8f3ef;

            border-color: #c9ab5d;

            box-shadow:
                inset 0 0 0 2px
                #c9ab5d;

        }


        .portal-mood input:checked
        + label strong {

            color: #083f39;

        }


        /* ================================================
           SELECT / TEXTAREA
           ================================================ */

        .portal-thermometer-form > label {

            display: grid;

            gap: 5px;

            color: #ffffff;

            font-size: .78rem;

            font-weight: 800;

        }


        .portal-thermometer-form select {

            width: 100%;

            height: 40px;

            padding: 0 10px;

            border: 0;

            border-radius: 8px;

            background: #ffffff;

            color: #153a36;

            font-weight: 700;

        }


        .portal-thermometer-form textarea {

            width: 100%;

            height: 55px;

            min-height: 55px;

            max-height: 55px;

            padding: 8px 10px;

            resize: none;

            border: 0;

            border-radius: 8px;

            background: #ffffff;

            color: #153a36;

            font-size: .78rem;

        }


        /* ================================================
           BOTÃO TERMÔMETRO
           ================================================ */

        .portal-thermometer-form button {

            width: 100%;

            height: 42px;

            border:
                1px solid
                #c9ab5d;

            border-radius: 8px;

            background: #c9ab5d;

            color: #083f39;

            font-weight: 900;

            cursor: pointer;

        }


        .portal-thermometer-form button:disabled {

            opacity: .65;

            cursor: not-allowed;

        }


        .portal-thermometer-message {

            min-height: 18px;

            color: #ffe4a1;

            text-align: center;

            font-size: .74rem;

            font-weight: 800;

        }


        /* ================================================
           RESPONSIVO
           ================================================ */

        @media(max-width:700px) {

            .portal-overlay {

                padding: 8px;

            }


            .portal-login-card,
            .portal-thermometer-card {

                width:
                    calc(100vw - 16px);

                max-height:
                    calc(100vh - 16px);

            }


            .portal-thermometer-card {

                padding: 15px;

            }


            .portal-mood label {

                min-height: 68px;

            }


            .portal-mood label span {

                font-size: 1.35rem;

            }

        }


        @media(max-width:480px) {

            .portal-moods {

                gap: 5px;

            }


            .portal-mood label {

                min-height: 64px;

            }


            .portal-mood label strong {

                font-size: .54rem;

            }

        }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       CRIAR OVERLAY
       ===================================================== */

    function criarOverlay() {

        let overlay =
            document.getElementById(
                "portalOverlay"
            );


        if (overlay) {

            return overlay;

        }


        overlay =
            document.createElement(
                "div"
            );


        overlay.id =
            "portalOverlay";


        overlay.className =
            "portal-overlay";


        overlay.hidden = true;


        document.body.appendChild(
            overlay
        );


        return overlay;

    }


    /* =====================================================
       FECHAR MODAL
       ===================================================== */

    function fecharModal() {

        const overlay =
            document.getElementById(
                "portalOverlay"
            );


        if (!overlay) {

            return;

        }


        overlay.hidden = true;

        overlay.innerHTML = "";

        document.body.style.overflow =
            "";

    }


    /* =====================================================
       LOGIN
       ===================================================== */

    function abrirLoginModal() {

        const overlay =
            criarOverlay();


        overlay.innerHTML = `

            <div
                class="portal-login-card"
                role="dialog"
                aria-modal="true">

                <img
                    class="portal-modal-logo"
                    src="assets/cmivet-logo-oficial.png"
                    alt="CMIVET">

                <span
                    class="portal-modal-pill">

                    Portal RH CMIVET

                </span>


                <h2>
                    Entrar no Portal RH
                </h2>


                <p>
                    Entre com seus dados
                    para acessar o Portal RH.
                </p>


                <form
                    id="portalLoginForm"
                    class="portal-login-form"
                    action="javascript:void(0);">

                    <label>

                        E-mail

                        <input
                            id="portalLoginEmail"
                            type="email"
                            name="email"
                            autocomplete="username"
                            required>

                    </label>


                    <label>

                        Senha

                        <input
                            id="portalLoginSenha"
                            type="password"
                            name="senha"
                            autocomplete="current-password"
                            required>

                    </label>


                    <button
                        id="portalLoginButton"
                        type="submit">

                        Entrar

                    </button>


                    <div
                        id="portalLoginMessage"
                        class="portal-login-message">

                    </div>

                </form>

            </div>

        `;


        overlay.hidden = false;

        document.body.style.overflow =
            "hidden";


        const form =
            document.getElementById(
                "portalLoginForm"
            );


        if (!form) {

            return;

        }


        form.addEventListener(
            "submit",
            tratarLogin
        );


        setTimeout(
            function () {

                const campo =
                    document.getElementById(
                        "portalLoginEmail"
                    );


                if (campo) {

                    campo.focus();

                }

            },
            100
        );

    }


    /* =====================================================
       TRATAR LOGIN
       ===================================================== */

    async function tratarLogin(event) {

        event.preventDefault();

        event.stopPropagation();


        const email =
            document.getElementById(
                "portalLoginEmail"
            );


        const senha =
            document.getElementById(
                "portalLoginSenha"
            );


        const botao =
            document.getElementById(
                "portalLoginButton"
            );


        const mensagem =
            document.getElementById(
                "portalLoginMessage"
            );


        if (
            !email ||
            !senha
        ) {

            return false;

        }


        if (
            !email.value.trim() ||
            !senha.value
        ) {

            mensagem.textContent =
                "Preencha e-mail e senha.";

            return false;

        }


        botao.disabled = true;

        botao.textContent =
            "Entrando...";


        mensagem.textContent =
            "";


        try {
const resultado =
    await Auth.login(
        email,
        senha
    );


            console.log(
                "Resposta login:",
                resultado
            );


            if (
                !resultado ||
                !resultado.sucesso
            ) {

                mensagem.textContent =
                    resultado?.erro ||
                    "E-mail ou senha inválidos.";

                botao.disabled = false;

                botao.textContent =
                    "Entrar";

                return false;

            }


            const token =
                resultado.token ||
                resultado.data?.token;


            if (!token) {

                mensagem.textContent =
                    "Login realizado, mas o token não foi recebido.";

                botao.disabled = false;

                botao.textContent =
                    "Entrar";

                return false;

            }


             salvarToken(token);

            /*
             * Guarda os dados do usuário,
             * caso a API os devolva.
             */

            if (
                resultado.usuario ||
                resultado.data?.usuario
            ) {

                try {

                    localStorage.setItem(
                        "portal_usuario",
                        JSON.stringify(
                            resultado.usuario ||
                            resultado.data.usuario
                        )
                    );

                }

                catch (erro) {

                    console.warn(
                        "Não foi possível salvar os dados do usuário:",
                        erro
                    );

                }

            }
            /*
             * Fecha SOMENTE o modal.
             * Continua no Dashboard.
             */

            fecharModal();


            await inicializarDashboard();


            /*
             * Depois do login verifica
             * se precisa responder o Termômetro.
             */

            await verificarTermometro();


        }

        catch (erro) {

            console.error(
                "Erro no login:",
                erro
            );


            mensagem.textContent =
                "Não foi possível realizar o login.";


            botao.disabled = false;

            botao.textContent =
                "Entrar";

        }

    }
        /* =====================================================
       ABRIR TERMÔMETRO
       ===================================================== */

    function abrirTermometroModal() {

        const overlay =
            criarOverlay();


        overlay.innerHTML = `

            <div
                class="portal-thermometer-card"
                role="dialog"
                aria-modal="true">

                <img
                    class="portal-modal-logo"
                    src="assets/cmivet-logo-oficial.png"
                    alt="CMIVET">


                <span
                    class="portal-modal-pill">

                    Resposta diária obrigatória

                </span>


                <h2>
                    Como você está se
                    sentindo hoje?
                </h2>


                <p>
                    Sua resposta ajuda o RH
                    a acompanhar o clima
                    organizacional da CMIVET.
                </p>


                <form
                    id="portalThermometerForm"
                    class="portal-thermometer-form"
                    action="javascript:void(0);">


                    <div>

                        <div
                            class="portal-question">

                            Como você está hoje?

                        </div>


                        <div
                            class="portal-moods">


                            <div
                                class="portal-mood">

                                <input
                                    type="radio"
                                    id="mood1"
                                    name="humor"
                                    value="5"
                                    required>

                                <label
                                    for="mood1">

                                    <span>😄</span>

                                    <strong>
                                        Muito Feliz
                                    </strong>

                                </label>

                            </div>


                            <div
                                class="portal-mood">

                                <input
                                    type="radio"
                                    id="mood2"
                                    name="humor"
                                    value="4">

                                <label
                                    for="mood2">

                                    <span>🙂</span>

                                    <strong>
                                        Bem
                                    </strong>

                                </label>

                            </div>


                            <div
                                class="portal-mood">

                                <input
                                    type="radio"
                                    id="mood3"
                                    name="humor"
                                    value="3">

                                <label
                                    for="mood3">

                                    <span>😐</span>

                                    <strong>
                                        Normal
                                    </strong>

                                </label>

                            </div>


                            <div
                                class="portal-mood">

                                <input
                                    type="radio"
                                    id="mood4"
                                    name="humor"
                                    value="2">

                                <label
                                    for="mood4">

                                    <span>😴</span>

                                    <strong>
                                        Cansado
                                    </strong>

                                </label>

                            </div>


                            <div
                                class="portal-mood">

                                <input
                                    type="radio"
                                    id="mood5"
                                    name="humor"
                                    value="1">

                                <label
                                    for="mood5">

                                    <span>😢</span>

                                    <strong>
                                        Muito Mal
                                    </strong>

                                </label>

                            </div>


                        </div>

                    </div>


                    <label>

                        Como está seu nível
                        de energia?


                        <select
                            id="portalEnergia"
                            name="energia"
                            required>

                            <option value="">
                                Selecione
                            </option>

                            <option value="Baixa">
                                Baixa
                            </option>

                            <option value="Moderada">
                                Moderada
                            </option>

                            <option value="Alta">
                                Alta
                            </option>

                        </select>

                    </label>


                    <label>

                        Observação


                        <textarea
                            id="portalObservacao"
                            name="observacao"
                            placeholder="Se quiser, conte um pouco mais sobre como você está hoje."></textarea>

                    </label>


                    <button
                        id="portalThermometerButton"
                        type="submit">

                        Enviar resposta

                    </button>


                    <div
                        id="portalThermometerMessage"
                        class="portal-thermometer-message">

                    </div>


                </form>

            </div>

        `;


        overlay.hidden = false;

        document.body.style.overflow =
            "hidden";


        const form =
            document.getElementById(
                "portalThermometerForm"
            );


        if (!form) {

            console.error(
                "Formulário do Termômetro não encontrado."
            );

            return;

        }


        /*
         * Intercepta o envio.
         *
         * NÃO deixa o navegador
         * alterar a URL.
         */

        form.addEventListener(
            "submit",
            enviarTermometro
        );

    }


    /* =====================================================
       ENVIAR TERMÔMETRO
       ===================================================== */

    async function enviarTermometro(event) {

        /*
         * ESSENCIAL:
         *
         * impede o navegador de fazer:
         *
         * portal.html?humor=3&energia=...
         */

        event.preventDefault();

        event.stopPropagation();


        const form =
            document.getElementById(
                "portalThermometerForm"
            );


        const mensagem =
            document.getElementById(
                "portalThermometerMessage"
            );


        const botao =
            document.getElementById(
                "portalThermometerButton"
            );


        if (!form) {

            console.error(
                "Formulário do Termômetro não encontrado."
            );

            return false;

        }


        const humor =
            form.querySelector(
                'input[name="humor"]:checked'
            );


        const energia =
            document.getElementById(
                "portalEnergia"
            );


        const observacao =
            document.getElementById(
                "portalObservacao"
            );


        const token =
            getToken();


        /* =================================================
           VALIDAÇÃO DA SESSÃO
           ================================================= */

        if (!token) {

            mensagem.textContent =
                "Sua sessão expirou. Faça login novamente.";

            return false;

        }


        /* =================================================
           VALIDAÇÃO DO HUMOR
           ================================================= */

        if (!humor) {

            mensagem.textContent =
                "Selecione como você está hoje.";

            return false;

        }


        /* =================================================
           VALIDAÇÃO DA ENERGIA
           ================================================= */

        if (
            !energia ||
            !energia.value
        ) {

            mensagem.textContent =
                "Selecione seu nível de energia.";

            return false;

        }


        /*
         * Evita duplo clique.
         */

        if (
            botao &&
            botao.disabled
        ) {

            return false;

        }


        /* =================================================
           BLOQUEIA BOTÃO
           ================================================= */

        if (botao) {

            botao.disabled = true;

            botao.textContent =
                "Enviando...";

        }


        mensagem.textContent =
            "Registrando sua resposta...";


        /* =================================================
           DADOS ENVIADOS PARA A API
           ================================================= */

        const dados = {

            token:
                token,

            humor:
                humor.value,

            energia:
                energia.value,

            observacao:
                observacao
                    ? observacao.value.trim()
                    : ""

        };


        console.log(
            "Enviando Termômetro:",
            dados
        );


        /* =================================================
           ENVIO PARA A API
           
           IMPORTANTE:
           Mantida a mesma chamada da versão
           que você estava usando.
           ================================================= */

        try {

            const resultado =
                await API.salvarTermometro(
                    dados
                );


            console.log(
                "Resposta Termômetro:",
                resultado
            );


            /* =================================================
               SUCESSO
               ================================================= */

            if (
                resultado &&
                resultado.sucesso === true
            ) {

                /*
                 * Atualiza o status na página.
                 */

                atualizarStatusTermometro(
                    false
                );


                mensagem.textContent =
                    "✓ Resposta registrada com sucesso!";


                if (botao) {

                    botao.textContent =
                        "Resposta enviada";

                }


                /*
                 * MUITO IMPORTANTE:
                 *
                 * Não faz:
                 *
                 * window.location.href
                 * location.reload()
                 *
                 * e não chama login.
                 *
                 * Apenas fecha o modal.
                 */

                setTimeout(
                    function () {

                        fecharModal();

                    },
                    700
                );


                return false;

            }


            /* =================================================
               API NÃO CONFIRMOU O SALVAMENTO
               ================================================= */

            console.error(
                "API não confirmou o salvamento:",
                resultado
            );


            mensagem.textContent =
                resultado?.erro ||
                resultado?.mensagem ||
                "A resposta não foi gravada.";


            if (botao) {

                botao.disabled = false;

                botao.textContent =
                    "Enviar resposta";

            }


            return false;


        }

        catch (erro) {

            console.error(
                "Erro ao salvar Termômetro:",
                erro
            );


            mensagem.textContent =
                "Erro ao gravar a resposta. Tente novamente.";


            if (botao) {

                botao.disabled = false;

                botao.textContent =
                    "Enviar resposta";

            }


            return false;

        }

    }


    /* =====================================================
       STATUS DO TERMÔMETRO
       ===================================================== */

    function atualizarStatusTermometro(
        pendente
    ) {

        const elemento =
            document.getElementById(
                "statusTermometro"
            );


        if (!elemento) {

            return;

        }


        if (pendente) {

            elemento.innerHTML =
                "🟡 Responda seu Termômetro hoje.";

        }

        else {

            elemento.innerHTML =
                "✓ Respondido hoje";

        }

    }


    /* =====================================================
       VERIFICAR TERMÔMETRO
       ===================================================== */

    async function verificarTermometro() {

        const token =
            getToken();


        if (!token) {

            return;

        }


        try {

            const resultado =
                await API.verificarTermometroHoje(
                    token
                );


            console.log(
                "Verificação Termômetro:",
                resultado
            );


            if (
                !resultado ||
                !resultado.sucesso
            ) {

                console.warn(
                    "Não foi possível verificar o Termômetro.",
                    resultado
                );

                return;

            }


            /*
             * Aceita os nomes utilizados
             * pelas diferentes versões
             * do backend.
             */

            const respondido =
                Boolean(

                    resultado.respondido ??

                    resultado.respondeu ??

                    resultado.jaRespondeu ??

                    resultado.data?.respondido ??

                    resultado.data?.respondeu

                );


            /* =================================================
               JÁ RESPONDEU
               ================================================= */

            if (respondido) {

                atualizarStatusTermometro(
                    false
                );

                return;

            }


            /* =================================================
               AINDA NÃO RESPONDEU
               ================================================= */

            atualizarStatusTermometro(
                true
            );


            /*
             * Abre automaticamente
             * por cima do Dashboard.
             */

            abrirTermometroModal();

        }

        catch (erro) {

            console.error(
                "Erro ao verificar Termômetro:",
                erro
            );

        }

    }
        /* =====================================================
       COMUNICADOS
       ===================================================== */

    async function atualizarStatusComunicados() {

        const elemento =
            document.getElementById(
                "statusComunicados"
            );


        if (!elemento) {

            return;

        }


        const token =
            getToken();


        if (!token) {

            elemento.textContent =
                "Faça login para consultar.";

            return;

        }


        try {

            const resultado =
                await API.comunicadosPendentes(
                    token
                );


            console.log(
                "Comunicados:",
                resultado
            );


            if (
                resultado &&
                resultado.sucesso
            ) {

                const quantidade =
                    Number(
                        resultado.quantidade ||
                        0
                    );


                if (quantidade > 0) {

                    elemento.textContent =
                        quantidade +
                        " comunicado(s) pendente(s)";

                }

                else {

                    elemento.textContent =
                        "Nenhum comunicado pendente";

                }


                return;

            }


            elemento.textContent =
                "Nenhum comunicado pendente";

        }

        catch (erro) {

            console.error(
                "Erro nos comunicados:",
                erro
            );


            elemento.textContent =
                "Nenhum comunicado pendente";

        }

    }


    /* =====================================================
       DASHBOARD
       ===================================================== */

    async function inicializarDashboard() {

        await atualizarStatusComunicados();

    }


    /* =====================================================
       LOGOUT
       ===================================================== */

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
            async function (event) {

                event.preventDefault();

                event.stopPropagation();


                const token =
                    getToken();


                try {

                    if (
                        token &&
                        typeof API.logout ===
                        "function"
                    ) {

                        await API.logout(
                            token
                        );

                    }

                }

                catch (erro) {

                    console.error(
                        "Erro no logout:",
                        erro
                    );

                }


                limparSessao();


                /*
                 * Depois do logout volta
                 * para a página inicial.
                 */

                window.location.href =
                    "index.html";

            }
        );

    }


    /* =====================================================
       LINKS DO DASHBOARD
       ===================================================== */

    function configurarLinksDashboard() {

        /*
         * Termômetro:
         *
         * Em vez de abrir termometro.html,
         * abre o card por cima do Dashboard.
         */

        document
            .querySelectorAll(
                'a[href="termometro.html"]'
            )
            .forEach(
                function (link) {

                    link.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();

                            event.stopPropagation();

                            abrirTermometroModal();

                        }
                    );

                }
            );


        /*
         * Caso exista algum link para login.html
         * dentro do Dashboard, também abre
         * o Login por cima.
         */

        document
            .querySelectorAll(
                'a[href="login.html"]'
            )
            .forEach(
                function (link) {

                    link.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();

                            event.stopPropagation();

                            abrirLoginModal();

                        }
                    );

                }
            );

    }


    /* =====================================================
       FECHAR MODAL AO CLICAR NO FUNDO
       ===================================================== */

    function configurarFechamentoOverlay() {

        const overlay =
            document.getElementById(
                "portalOverlay"
            );


        if (!overlay) {

            return;

        }


        /*
         * NÃO permite fechar o Termômetro
         * obrigatório clicando no fundo.
         *
         * O usuário precisa responder.
         */

        overlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === overlay
                ) {

                    return;

                }

            }
        );

    }


    /* =====================================================
       INICIALIZAÇÃO DO PORTAL
       ===================================================== */

    async function iniciarPortal() {

        /*
         * Cria os estilos antes
         * de qualquer modal.
         */

        criarEstilosModal();


        criarOverlay();


        configurarLogout();


        configurarLinksDashboard();


        configurarFechamentoOverlay();


        /*
         * Atualiza o Dashboard.
         */

        await inicializarDashboard();


        const token =
            getToken();


        /*
         * SEM LOGIN:
         *
         * Abre Login por cima do Dashboard.
         */

        if (!token) {

            abrirLoginModal();

            return;

        }


        /*
         * COM LOGIN:
         *
         * Verifica se o Termômetro
         * precisa ser respondido.
         */

        await verificarTermometro();

    }


    /* =====================================================
       FUNÇÕES PÚBLICAS
       ===================================================== */

    window.PortalRH = {

        abrirLogin:
            abrirLoginModal,

        abrirTermometro:
            abrirTermometroModal,

        fecharModal:
            fecharModal,

        verificarTermometro:
            verificarTermometro,

        atualizarComunicados:
            atualizarStatusComunicados

    };


    /* =====================================================
       INICIAR
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciarPortal
        );

    }

    else {

        iniciarPortal();

    }


})();
