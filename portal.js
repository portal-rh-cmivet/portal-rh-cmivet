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
 * MODAIS:
 * - Fundo externo verde escuro sólido
 * - Card verde CMIVET
 * - Login menor
 * - Termômetro menor
 * - Termômetro obrigatório
 * =====================================================
 */

(function () {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const LOGIN_EMAIL = "rh@cmivet.com.br";


    /* =====================================================
       UTILITÁRIOS
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

        if (!token) {
            return;
        }

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
       CSS DOS MODAIS
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
            document.createElement(
                "style"
            );


        style.id =
            "portalModalStyles";


        style.textContent = `

        /* =================================================
           OVERLAY
           ================================================= */

        .portal-overlay{

            position:fixed;

            inset:0;

            z-index:99999;

            display:flex;

            align-items:center;

            justify-content:center;

            padding:16px;

            /*
             * VERDE ESCURO SÓLIDO
             * SEM TRANSPARÊNCIA
             */

            background:#083f39;

            backdrop-filter:none;

            -webkit-backdrop-filter:none;

        }


        .portal-overlay[hidden]{

            display:none !important;

        }


        /* =================================================
           CARD LOGIN
           ================================================= */

        .portal-login-card{

            width:min(
                480px,
                calc(100vw - 32px)
            );

            max-height:85vh;

            overflow-y:auto;

            background:#0f6258;

            color:#fff;

            border-radius:20px;

            border:1px solid #c9ab5d;

            box-shadow:
                0 25px 70px
                rgba(0,0,0,.35);

            padding:26px;

            position:relative;

        }


        .portal-login-card .portal-modal-logo{

            width:125px;

            height:58px;

            object-fit:contain;

            display:block;

            margin:0 auto 12px;

        }


        .portal-login-card .portal-modal-pill{

            display:table;

            margin:0 auto 12px;

            padding:6px 11px;

            border-radius:999px;

            background:#c9ab5d;

            color:#083f39;

            font-size:.73rem;

            font-weight:900;

        }


        .portal-login-card h2{

            margin:8px 0 7px;

            color:#fff;

            font-size:1.7rem;

            line-height:1.1;

            text-align:left;

        }


        .portal-login-card p{

            margin:0 0 20px;

            color:
                rgba(255,255,255,.82);

            font-size:.9rem;

        }


        .portal-login-card label{

            display:grid;

            gap:6px;

            margin-bottom:14px;

            color:#fff;

            font-size:.88rem;

            font-weight:800;

        }


        .portal-login-card input{

            width:100%;

            min-height:46px;

            padding:0 13px;

            border:

                1px solid
                rgba(255,255,255,.25);

            border-radius:9px;

            background:#eaf1fb;

            color:#153a36;

            outline:none;

        }


        .portal-login-card input:focus{

            border-color:#c9ab5d;

            box-shadow:
                0 0 0 3px
                rgba(201,171,93,.2);

        }


        .portal-login-card button{

            width:100%;

            min-height:46px;

            margin-top:5px;

            border:
                1px solid
                #c9ab5d;

            border-radius:9px;

            background:#c9ab5d;

            color:#083f39;

            font-weight:900;

            cursor:pointer;

        }


        .portal-login-card button:hover{

            background:#e4ca82;

        }


        .portal-login-message{

            min-height:20px;

            margin-top:10px;

            text-align:center;

            color:#ffe4a1;

            font-size:.84rem;

            font-weight:800;

        }


        .portal-login-footer{

            margin-top:18px;

            padding-top:13px;

            border-top:
                1px solid
                rgba(255,255,255,.15);

            text-align:center;

            font-size:.72rem;

            color:
                rgba(255,255,255,.7);

        }


        /* =================================================
           CARD TERMÔMETRO
           ================================================= */

        .portal-thermometer-card{

            width:min(
                620px,
                calc(100vw - 32px)
            );

            max-height:85vh;

            overflow-y:auto;

            background:#0f6258;

            color:#fff;

            border-radius:20px;

            border:1px solid #c9ab5d;

            box-shadow:
                0 25px 70px
                rgba(0,0,0,.38);

            padding:24px;

            position:relative;

        }


        .portal-thermometer-card
        .portal-modal-logo{

            width:125px;

            height:58px;

            object-fit:contain;

            display:block;

            margin:0 auto 9px;

        }


        .portal-thermometer-card
        .portal-modal-pill{

            display:table;

            margin:0 auto 8px;

            padding:6px 11px;

            border-radius:999px;

            background:#c9ab5d;

            color:#083f39;

            font-size:.72rem;

            font-weight:900;

        }


        .portal-thermometer-card h2{

            margin:6px 0;

            text-align:center;

            color:#fff;

            font-size:1.65rem;

            line-height:1.15;

        }


        .portal-thermometer-card > p{

            margin:
                0 auto 18px;

            max-width:560px;

            text-align:center;

            color:
                rgba(255,255,255,.82);

            font-size:.88rem;

            line-height:1.4;

        }


        .portal-thermometer-form{

            display:grid;

            gap:14px;

        }


        .portal-thermometer-form > label{

            display:grid;

            gap:6px;

            color:#fff;

            font-size:.86rem;

            font-weight:800;

        }


        .portal-thermometer-form select,

        .portal-thermometer-form textarea{

            width:100%;

            border:
                1px solid
                rgba(255,255,255,.22);

            border-radius:9px;

            background:#fff;

            color:#153a36;

            padding:10px;

            outline:none;

        }


        .portal-thermometer-form select{

            min-height:44px;

        }


        .portal-thermometer-form textarea{

            resize:vertical;

            min-height:80px;

        }


        /* =================================================
           HUMORES
           ================================================= */

        .portal-moods{

            display:grid;

            grid-template-columns:
                repeat(5,1fr);

            gap:8px;

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

            min-height:92px;

            padding:7px 4px;

            border:
                1px solid
                rgba(255,255,255,.25);

            border-radius:10px;

            background:
                rgba(255,255,255,.08);

            display:grid;

            place-items:center;

            align-content:center;

            gap:6px;

            cursor:pointer;

            text-align:center;

        }


        .portal-mood label span{

            font-size:1.75rem;

            line-height:1;

        }


        .portal-mood label strong{

            color:#fff;

            font-size:.7rem;

        }


        .portal-mood input:checked + label{

            background:#e8f3ef;

            border-color:#c9ab5d;

            box-shadow:
                inset 0 0 0 2px
                #c9ab5d,

                0 5px 15px
                rgba(0,0,0,.16);

        }


        .portal-mood input:checked
        + label strong{

            color:#083f39;

        }


        /* =================================================
           BOTÃO TERMÔMETRO
           ================================================= */

        .portal-thermometer-form button{

            min-height:46px;

            border:
                1px solid
                #c9ab5d;

            border-radius:9px;

            background:#c9ab5d;

            color:#083f39;

            font-weight:900;

            cursor:pointer;

        }


        .portal-thermometer-form
        button:hover{

            background:#e4ca82;

        }


        .portal-thermometer-message{

            min-height:20px;

            text-align:center;

            color:#ffe4a1;

            font-size:.82rem;

            font-weight:800;

        }


        /* =================================================
           RESPONSIVO
           ================================================= */

        @media(max-width:700px){

            .portal-overlay{

                padding:10px;

            }


            .portal-login-card,

            .portal-thermometer-card{

                width:
                    calc(100vw - 20px);

                max-height:90vh;

                padding:20px;

            }


            .portal-moods{

                grid-template-columns:
                    repeat(2,1fr);

            }


            .portal-thermometer-card h2{

                font-size:1.45rem;

            }

        }


        @media(max-width:430px){

            .portal-login-card{

                padding:18px;

            }


            .portal-thermometer-card{

                padding:18px;

            }


            .portal-moods{

                grid-template-columns:
                    repeat(2,1fr);

            }


            .portal-mood label{

                min-height:88px;

            }


            .portal-mood label span{

                font-size:1.6rem;

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
       LOGIN MODAL
       ===================================================== */

    function abrirLoginModal() {

        const overlay =
            criarOverlay();


        overlay.innerHTML = `

            <div
                class="portal-login-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="portalLoginTitle">


                <img
                    class="portal-modal-logo"
                    src="assets/cmivet-logo-oficial.png"
                    alt="CMIVET">


                <span
                    class="portal-modal-pill">

                    Portal RH CMIVET

                </span>


                <h2
                    id="portalLoginTitle">

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
                        type="submit">

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


        const email =
            document.getElementById(
                "portalLoginEmail"
            );


        if (!form) {

            return;

        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const mensagem =
                    document.getElementById(
                        "portalLoginMessage"
                    );


                const btn =
                    form.querySelector(
                        "button"
                    );


                const emailValue =
                    email.value.trim();


                const senhaValue =
                    document.getElementById(
                        "portalLoginSenha"
                    ).value;


                if (
                    !emailValue ||
                    !senhaValue
                ) {

                    mensagem.textContent =
                        "Informe seu e-mail e sua senha.";

                    return;

                }


                btn.disabled = true;


                btn.textContent =
                    "Entrando...";


                mensagem.textContent =
                    "";


                try {

                    const resultado =
                        await API.login(
                            emailValue,
                            senhaValue
                        );


                    if (
                        resultado &&
                        resultado.sucesso
                    ) {


                        const token =
                            resultado.token ||
                            resultado.data?.token;


                        if (token) {

                            salvarToken(
                                token
                            );

                        }


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

                    btn.disabled =
                        false;


                    btn.textContent =
                        "Entrar no Portal";

                }

            }
        );


        setTimeout(
            function () {

                if (email) {

                    email.focus();

                }

            },
            100
        );

    }


    /* =====================================================
       TERMÔMETRO MODAL
       ===================================================== */

    function abrirTermometroModal() {

        const overlay =
            criarOverlay();


        overlay.innerHTML = `

            <div
                class="portal-thermometer-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="portalThermometerTitle">


                <img
                    class="portal-modal-logo"
                    src="assets/cmivet-logo-oficial.png"
                    alt="CMIVET">


                <span
                    class="portal-modal-pill">

                    Resposta diária obrigatória

                </span>


                <h2
                    id="portalThermometerTitle">

                    Como você está se sentindo hoje?

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
                                margin-bottom:8px;
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
                            rows="3"
                            placeholder="Se quiser, conte um pouco mais sobre como você está hoje."></textarea>

                    </label>


                    <button
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

            return;

        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const mensagem =
                    document.getElementById(
                        "portalThermometerMessage"
                    );


                const btn =
                    form.querySelector(
                        "button"
                    );


                const token =
                    getToken();


                if (!token) {

                    mensagem.textContent =
                        "Sua sessão expirou. Faça login novamente.";

                    return;

                }


                const humor =
                    form.querySelector(
                        'input[name="humor"]:checked'
                    );


                const energia =
                    form.querySelector(
                        '[name="energia"]'
                    );


                const observacao =
                    form.querySelector(
                        '[name="observacao"]'
                    );


                if (!humor) {

                    mensagem.textContent =
                        "Selecione como você está hoje.";

                    return;

                }


                if (!energia.value) {

                    mensagem.textContent =
                        "Selecione seu nível de energia.";

                    return;

                }


                btn.disabled = true;


                btn.textContent =
                    "Enviando...";


                mensagem.textContent =
                    "";


                try {

                    const resultado =
                        await API.salvarTermometro({

                            token: token,

                            humor: humor.value,

                            energia:
                                energia.value,

                            observacao:
                                observacao.value.trim()

                        });


                    if (
                        resultado &&
                        resultado.sucesso
                    ) {

                        mensagem.textContent =
                            "Resposta registrada com sucesso!";


                        atualizarStatusTermometro(
                            false
                        );


                        setTimeout(
                            function () {

                                fecharModal();

                            },
                            700
                        );


                        return;

                    }


                    mensagem.textContent =
                        resultado?.erro ||
                        "Não foi possível registrar sua resposta.";

                }


                catch (erro) {

                    console.error(
                        "Erro ao salvar termômetro:",
                        erro
                    );


                    mensagem.textContent =
                        "Erro ao registrar sua resposta.";

                }


                finally {

                    btn.disabled =
                        false;


                    btn.textContent =
                        "Enviar resposta";

                }

            }
        );

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


        overlay.innerHTML =
            "";


        document.body.style.overflow =
            "";

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
       STATUS COMUNICADOS
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
                        resultado.quantidade ||
                        0
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
                "Erro ao carregar comunicados:",
                erro
            );


            elemento.textContent =
                "Nenhum comunicado pendente";

        }

    }


    /* =====================================================
       VERIFICAR TERMÔMETRO HOJE
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


            atualizarStatusTermometro(
                true
            );


            abrirTermometroModal();

        }


        catch (erro) {

            console.error(
                "Erro ao verificar termômetro:",
                erro
            );

        }

    }


    /* =====================================================
       INICIALIZAR DASHBOARD
       ===================================================== */

    async function inicializarDashboard() {

        try {

            await atualizarStatusComunicados();

        }

        catch (erro) {

            console.error(
                "Erro ao inicializar Dashboard:",
                erro
            );

        }

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
            async function () {

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
                        "Erro ao sair:",
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
       NAVEGAÇÃO
       ===================================================== */

    function configurarNavegacao() {

        const links =
            document.querySelectorAll(
                ".sidebar a"
            );


        links.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        /*
                         * Navegação normal.
                         *
                         * Biblioteca e Universidade
                         * já foram removidas do Dashboard.
                         */

                    }
                );

            }
        );

    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    async function iniciar() {

        inserirEstilosModais();


        criarOverlay();


        configurarLogout();


        configurarNavegacao();


        await inicializarDashboard();


        const token =
            getToken();


        /*
         * SEM LOGIN:
         * abre o Login por cima do Dashboard.
         */

        if (!token) {

            abrirLoginModal();

            return;

        }


        /*
         * COM LOGIN:
         * verifica o Termômetro.
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
       EXECUTAR
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
