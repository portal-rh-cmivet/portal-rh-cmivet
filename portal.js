/**
 * =====================================================
 * PORTAL RH CMIVET
 * portal.js
 *
 * Dashboard
 * Login em modal
 * Termômetro em modal
 * Comunicados
 *
 * =====================================================
 */

(function () {

    "use strict";


    /* =====================================================
       SESSÃO
       ===================================================== */

    function getToken() {

        return (
            localStorage.getItem("portal_token") ||
            localStorage.getItem("token") ||
            sessionStorage.getItem("portal_token") ||
            sessionStorage.getItem("token") ||
            ""
        );

    }


    function salvarToken(token) {

        if (!token) return;

        localStorage.setItem(
            "portal_token",
            token
        );

        localStorage.setItem(
            "token",
            token
        );

    }


    function limparSessao() {

        localStorage.removeItem(
            "portal_token"
        );

        localStorage.removeItem(
            "token"
        );

        sessionStorage.removeItem(
            "portal_token"
        );

        sessionStorage.removeItem(
            "token"
        );

    }


    /* =====================================================
       ESTILOS
       ===================================================== */

    function inserirEstilosModais() {

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

        .portal-overlay{

            position:fixed;
            inset:0;
            z-index:99999;

            display:flex;
            align-items:center;
            justify-content:center;

            padding:10px;

            background:#083f39;

            overflow:hidden;

        }


        .portal-overlay[hidden]{

            display:none !important;

        }


        /* =================================================
           LOGIN
           ================================================= */

        .portal-login-card{

            width:min(
                450px,
                calc(100vw - 20px)
            );

            max-height:
                calc(100vh - 25px);

            overflow:hidden;

            background:#0f6258;
            color:#fff;

            border:1px solid #c9ab5d;
            border-radius:18px;

            box-shadow:
                0 20px 55px
                rgba(0,0,0,.35);

            padding:20px;

        }


        .portal-login-card
        .portal-modal-logo{

            width:105px;
            height:48px;

            display:block;

            margin:0 auto 6px;

            object-fit:contain;

        }


        .portal-login-card
        .portal-modal-pill{

            display:table;

            margin:0 auto 8px;

            padding:5px 10px;

            border-radius:999px;

            background:#c9ab5d;

            color:#083f39;

            font-size:.68rem;

            font-weight:900;

        }


        .portal-login-card h2{

            margin:5px 0;

            color:#fff;

            font-size:1.55rem;

            line-height:1.1;

        }


        .portal-login-card p{

            margin:0 0 13px;

            color:
                rgba(255,255,255,.82);

            font-size:.82rem;

        }


        .portal-login-card label{

            display:grid;

            gap:5px;

            margin-bottom:10px;

            color:#fff;

            font-size:.82rem;

            font-weight:800;

        }


        .portal-login-card input{

            width:100%;
            height:42px;

            padding:0 12px;

            border:1px solid
                rgba(255,255,255,.25);

            border-radius:8px;

            background:#fff;

            color:#153a36;

            outline:none;

        }


        .portal-login-card button{

            width:100%;
            height:43px;

            margin-top:3px;

            border:1px solid #c9ab5d;

            border-radius:8px;

            background:#c9ab5d;

            color:#083f39;

            font-weight:900;

            cursor:pointer;

        }


        .portal-login-card button:disabled{

            opacity:.65;

            cursor:not-allowed;

        }


        .portal-login-message{

            min-height:17px;

            margin-top:6px;

            text-align:center;

            color:#ffe4a1;

            font-size:.76rem;

            font-weight:800;

        }


        .portal-login-footer{

            margin-top:10px;

            padding-top:9px;

            border-top:
                1px solid
                rgba(255,255,255,.15);

            text-align:center;

            font-size:.66rem;

            color:
                rgba(255,255,255,.7);

        }


        /* =================================================
           TERMÔMETRO
           ================================================= */

        .portal-thermometer-card{

            width:min(
                600px,
                calc(100vw - 20px)
            );

            max-height:
                calc(100vh - 25px);

            overflow:hidden;

            background:#0f6258;
            color:#fff;

            border:1px solid #c9ab5d;
            border-radius:18px;

            box-shadow:
                0 20px 55px
                rgba(0,0,0,.38);

            padding:18px 22px;

        }


        .portal-thermometer-card
        .portal-modal-logo{

            width:105px;
            height:48px;

            display:block;

            margin:0 auto 4px;

            object-fit:contain;

        }


        .portal-thermometer-card
        .portal-modal-pill{

            display:table;

            margin:0 auto 5px;

            padding:5px 10px;

            border-radius:999px;

            background:#c9ab5d;

            color:#083f39;

            font-size:.67rem;

            font-weight:900;

        }


        .portal-thermometer-card h2{

            margin:4px 0;

            text-align:center;

            color:#fff;

            font-size:1.45rem;

            line-height:1.1;

        }


        .portal-thermometer-card > p{

            margin:0 auto 12px;

            max-width:540px;

            text-align:center;

            color:
                rgba(255,255,255,.82);

            font-size:.78rem;

            line-height:1.3;

        }


        .portal-thermometer-form{

            display:grid;

            gap:10px;

        }


        .portal-thermometer-form
        > label{

            display:grid;

            gap:5px;

            color:#fff;

            font-size:.78rem;

            font-weight:800;

        }


        /* =================================================
           HUMORES
           ================================================= */

        .portal-moods{

            display:grid;

            grid-template-columns:
                repeat(5,1fr);

            gap:7px;

        }


        .portal-mood{

            position:relative;

        }


        .portal-mood input{

            position:absolute;

            opacity:0;

            pointer-events:none;

        }


        .portal-mood label{

            min-height:76px;

            padding:5px 3px;

            border:
                1px solid
                rgba(255,255,255,.25);

            border-radius:9px;

            background:
                rgba(255,255,255,.08);

            display:grid;

            place-items:center;

            align-content:center;

            gap:4px;

            cursor:pointer;

            text-align:center;

        }


        .portal-mood label span{

            font-size:1.55rem;

            line-height:1;

        }


        .portal-mood label strong{

            color:#fff;

            font-size:.62rem;

        }


        .portal-mood input:checked
        + label{

            background:#e8f3ef;

            border-color:#c9ab5d;

            box-shadow:
                inset 0 0 0 2px
                #c9ab5d;

        }


        .portal-mood input:checked
        + label strong{

            color:#083f39;

        }


        /* =================================================
           CAMPOS
           ================================================= */

        .portal-thermometer-form select{

            width:100%;
            height:40px;

            padding:0 10px;

            border:0;
            border-radius:8px;

            background:#fff;
            color:#153a36;

            font-weight:700;

        }


        .portal-thermometer-form textarea{

            width:100%;

            height:58px;
            min-height:58px;
            max-height:58px;

            resize:none;

            padding:9px;

            border:0;
            border-radius:8px;

            background:#fff;
            color:#153a36;

            font-size:.8rem;

        }


        /* =================================================
           BOTÃO
           ================================================= */

        .portal-thermometer-form button{

            width:100%;
            height:42px;

            border:1px solid #c9ab5d;

            border-radius:8px;

            background:#c9ab5d;

            color:#083f39;

            font-weight:900;

            cursor:pointer;

        }


        .portal-thermometer-form button:hover{

            background:#e4ca82;

        }


        .portal-thermometer-form
        button:disabled{

            opacity:.65;

            cursor:not-allowed;

        }


        .portal-thermometer-message{

            min-height:16px;

            text-align:center;

            color:#ffe4a1;

            font-size:.75rem;

            font-weight:800;

        }


        /* =================================================
           RESPONSIVO
           ================================================= */

        @media(max-width:700px){

            .portal-overlay{

                padding:8px;

            }


            .portal-login-card,
            .portal-thermometer-card{

                width:
                    calc(100vw - 16px);

                max-height:
                    calc(100vh - 16px);

            }


            .portal-thermometer-card{

                padding:15px;

            }


            .portal-mood label{

                min-height:70px;

            }


            .portal-mood label span{

                font-size:1.4rem;

            }


            .portal-mood label strong{

                font-size:.58rem;

            }

        }


        @media(max-width:480px){

            .portal-thermometer-card
            .portal-modal-logo{

                width:90px;
                height:40px;

            }


            .portal-thermometer-card h2{

                font-size:1.25rem;

            }


            .portal-mood label{

                min-height:66px;

            }


            .portal-mood label span{

                font-size:1.3rem;

            }

        }

        `;


        document.head.appendChild(style);

    }


    /* =====================================================
       OVERLAY
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
            document.createElement("div");


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
                    id="portalLoginForm">


                    <label>

                        E-mail

                        <input
                            type="email"
                            id="portalLoginEmail"
                            name="email"
                            autocomplete="username"
                            required>

                    </label>


                    <label>

                        Senha

                        <input
                            type="password"
                            id="portalLoginSenha"
                            name="senha"
                            autocomplete="current-password"
                            required>

                    </label>


                    <button
                        type="submit"
                        id="portalLoginButton">

                        Entrar no Portal

                    </button>


                    <div
                        id="portalLoginMessage"
                        class="portal-login-message">
                    </div>


                </form>


                <div
                    class="portal-login-footer">

                    🔒 Acesso seguro e exclusivo
                    aos colaboradores CMIVET.

                </div>


            </div>

        `;


        overlay.hidden = false;


        document.body.style.overflow =
            "hidden";


        const form =
            document.getElementById(
                "portalLoginForm"
            );


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                event.stopPropagation();


                const mensagem =
                    document.getElementById(
                        "portalLoginMessage"
                    );


                const btn =
                    document.getElementById(
                        "portalLoginButton"
                    );


                const email =
                    document.getElementById(
                        "portalLoginEmail"
                    ).value.trim();


                const senha =
                    document.getElementById(
                        "portalLoginSenha"
                    ).value;


                if (!email || !senha) {

                    mensagem.textContent =
                        "Preencha e-mail e senha.";

                    return;

                }


                btn.disabled = true;

                btn.textContent =
                    "Entrando...";


                try {

                    const resultado =
                        await API.login(
                            email,
                            senha
                        );


                    if (
                        resultado &&
                        resultado.sucesso
                    ) {

                        const token =
                            resultado.token ||
                            resultado.data?.token;


                        if (!token) {

                            mensagem.textContent =
                                "Login realizado, mas o token não foi recebido.";

                            btn.disabled =
                                false;

                            btn.textContent =
                                "Entrar no Portal";

                            return;

                        }


                        salvarToken(token);


                        fecharModal();


                        await inicializarDashboard();


                        await verificarTermometro();


                        return;

                    }


                    mensagem.textContent =
                        resultado?.erro ||
                        "E-mail ou senha inválidos.";

                }

                catch (erro) {

                    console.error(
                        "Erro no login:",
                        erro
                    );


                    mensagem.textContent =
                        "Não foi possível realizar o login.";

                }

                finally {

                    btn.disabled = false;

                    btn.textContent =
                        "Entrar no Portal";

                }

            }
        );


        setTimeout(
            function () {

                document
                    .getElementById(
                        "portalLoginEmail"
                    )
                    ?.focus();

            },
            100
        );

    }


    /* =====================================================
       TERMÔMETRO
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
                    class="portal-thermometer-form">


                    <div>

                        <label
                            style="
                                display:block;
                                margin-bottom:6px;
                                font-weight:900;
                            ">

                            Como você está hoje?

                        </label>


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

                                    <span>
                                        😄
                                    </span>

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

                                    <span>
                                        🙂
                                    </span>

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

                                    <span>
                                        😐
                                    </span>

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

                                    <span>
                                        😴
                                    </span>

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

                                    <span>
                                        😢
                                    </span>

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
                            name="energia"
                            id="portalEnergia"
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
                            name="observacao"
                            id="portalObservacao"
                            placeholder="Se quiser, conte um pouco mais sobre como você está hoje."></textarea>

                    </label>


                    <button
                        type="submit"
                        id="portalThermometerButton">

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


        /*
         * IMPORTANTE:
         * O formulário é interceptado aqui.
         *
         * Assim o navegador NÃO:
         *
         * portal.html?humor=3...
         *
         * e a API continua recebendo
         * os mesmos dados.
         */

        form.addEventListener(
            "submit",
            enviarTermometro
        );

    }


    /* =====================================================
       ENVIAR TERMÔMETRO
       ===================================================== */

    async function enviarTermometro(
        event
    ) {

        /*
         * ESSENCIAL
         *
         * Impede o navegador de recarregar
         * o portal.html.
         */

        if (event) {

            event.preventDefault();

            event.stopPropagation();

        }


        const form =
            document.getElementById(
                "portalThermometerForm"
            );


        if (!form) {

            return false;

        }


        const token =
            getToken();


        const mensagem =
            document.getElementById(
                "portalThermometerMessage"
            );


        const btn =
            document.getElementById(
                "portalThermometerButton"
            );


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


        /* =================================================
           TOKEN
           ================================================= */

        if (!token) {

            mensagem.textContent =
                "Sua sessão expirou. Faça login novamente.";

            setTimeout(
                function () {

                    fecharModal();

                    abrirLoginModal();

                },
                1000
            );

            return false;

        }


        /* =================================================
           HUMOR
           ================================================= */

        if (!humor) {

            mensagem.textContent =
                "Selecione como você está hoje.";

            return false;

        }


        /* =================================================
           ENERGIA
           ================================================= */

        if (!energia.value) {

            mensagem.textContent =
                "Selecione seu nível de energia.";

            return false;

        }


        /* =================================================
           IMPEDIR DUPLO ENVIO
           ================================================= */

        if (btn.disabled) {

            return false;

        }


        btn.disabled = true;

        btn.textContent =
            "Enviando...";


        mensagem.textContent =
            "";


        /* =================================================
           DADOS
           ================================================= */

        const dados = {

            token: token,

            humor: humor.value,

            energia:
                energia.value,

            observacao:
                observacao.value.trim()

        };


        console.log(
            "Enviando termômetro:",
            dados
        );


        try {

            /*
             * NÃO ALTERAMOS A API.
             *
             * Continua usando:
             *
             * API.salvarTermometro()
             */

            const resultado =
                await API.salvarTermometro(
                    dados
                );


            console.log(
                "Resposta API termômetro:",
                resultado
            );


            /* =================================================
               SUCESSO
               ================================================= */

            if (
                resultado &&
                resultado.sucesso === true
            ) {

                atualizarStatusTermometro(
                    false
                );


                mensagem.textContent =
                    "✓ Resposta registrada com sucesso!";


                btn.textContent =
                    "Resposta enviada";


                /*
                 * Aguarda a confirmação visual
                 * e fecha SOMENTE o modal.
                 *
                 * Não recarrega.
                 * Não redireciona.
                 * Não faz logout.
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
               ERRO DEVOLVIDO PELA API
               ================================================= */

            console.error(
                "API não confirmou gravação:",
                resultado
            );


            mensagem.textContent =
                resultado?.erro ||
                resultado?.mensagem ||
                "A resposta não foi gravada.";


            btn.disabled = false;

            btn.textContent =
                "Enviar resposta";


            return false;

        }

        catch (erro) {

            console.error(
                "Erro ao gravar termômetro:",
                erro
            );


            mensagem.textContent =
                "Erro ao gravar a resposta. Tente novamente.";


            btn.disabled = false;

            btn.textContent =
                "Enviar resposta";


            return false;

        }

    }


    /* =====================================================
       STATUS TERMÔMETRO
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
                '<span class="badge">🟡 Pendente</span>';

        }

        else {

            elemento.innerHTML =
                '<span class="status-on">✓ Respondido hoje</span>';

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


            if (
                resultado &&
                resultado.sucesso
            ) {

                const quantidade =
                    Number(
                        resultado.quantidade || 0
                    );


                if (quantidade > 0) {

                    elemento.innerHTML = `

                        <span
                            class="status-on">

                            ${quantidade}
                            comunicado(s)
                            pendente(s)

                        </span>

                    `;

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
                "Verificação termômetro:",
                resultado
            );


            if (
                resultado &&
                resultado.sucesso
            ) {

                const respondido =
                    Boolean(

                        resultado.respondido ??
                        resultado.respondeu ??
                        resultado.jaRespondeu ??
                        resultado.data?.respondido

                    );


                if (respondido) {

                    atualizarStatusTermometro(
                        false
                    );

                    return;

                }


                atualizarStatusTermometro(
                    true
                );


                abrirTermometroModal();


                return;

            }


            /*
             * Se a API não retornar
             * a informação esperada,
             * não forçamos um logout.
             */

            console.warn(
                "Não foi possível determinar o status do termômetro.",
                resultado
            );

        }

        catch (erro) {

            console.error(
                "Erro ao verificar termômetro:",
                erro
            );

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

        const btn =
            document.getElementById(
                "logout"
            );


        if (!btn) {

            return;

        }


        btn.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();


                const token =
                    getToken();


                try {

                    if (
                        token &&
                        API.logout
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

                finally {

                    limparSessao();


                    window.location.href =
                        "index.html";

                }

            }
        );

    }


    /* =====================================================
       INICIAR PORTAL
       ===================================================== */

    async function iniciar() {

        inserirEstilosModais();

        criarOverlay();

        configurarLogout();


        await inicializarDashboard();


        const token =
            getToken();


        /*
         * SEM LOGIN
         */

        if (!token) {

            abrirLoginModal();

            return;

        }


        /*
         * COM LOGIN
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
       EXECUÇÃO
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciar
        );

    }

    else {

        iniciar();

    }


})();
