/**
 * =====================================================
 * PORTAL RH CMIVET
 * portal.js
 *
 * FLUXO:
 *
 * Dashboard
 *     ↓
 * Login por cima do Dashboard
 *     ↓
 * Login realizado
 *     ↓
 * Verifica Termômetro
 *     ↓
 * Termômetro pendente?
 *     ↓ SIM
 * Termômetro por cima do Dashboard
 *     ↓
 * Responde
 *     ↓
 * Fecha Termômetro
 *     ↓
 * Continua no Dashboard
 * =====================================================
 */


/* =====================================================
   CONFIGURAÇÕES
   ===================================================== */

const PORTAL = {

    TOKEN_KEYS: [
        "cmivet_token",
        "portal_token",
        "token",
        "auth_token",
        "session_token"
    ],

    USER_KEYS: [
        "cmivet_usuario",
        "portal_usuario",
        "usuario"
    ]

};


/* =====================================================
   ELEMENTOS
   ===================================================== */

let loginOverlay;
let thermometerOverlay;

let loginForm;
let thermometerForm;

let loginMessage;
let thermometerMessage;

let loginButton;
let thermometerButton;

let statusTermometro;
let statusComunicados;


/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    inicializarElementos();

    configurarLogin();

    configurarTermometro();

    configurarNavegacao();

    configurarLogout();

    iniciarPortal();

});


/* =====================================================
   LOCALIZAR ELEMENTOS
   ===================================================== */

function inicializarElementos() {

    loginOverlay =
        document.getElementById("loginOverlay");

    thermometerOverlay =
        document.getElementById("thermometerOverlay");

    loginForm =
        document.getElementById("portalLoginForm");

    thermometerForm =
        document.getElementById("portalThermometerForm");

    loginMessage =
        document.getElementById("portalLoginMessage");

    thermometerMessage =
        document.getElementById("portalThermometerMessage");

    loginButton =
        document.getElementById("portalLoginButton");

    thermometerButton =
        document.getElementById("portalThermometerButton");

    statusTermometro =
        document.getElementById("statusTermometro");

    statusComunicados =
        document.getElementById("statusComunicados");

}


/* =====================================================
   INICIAR PORTAL
   ===================================================== */

async function iniciarPortal() {

    const token = obterToken();

    /*
     * Se não existe token:
     * mostra Login por cima do Dashboard.
     */

    if (!token) {

        abrirLogin();

        atualizarStatusComunicados();

        return;

    }


    /*
     * Existe token.
     * Vamos validar a sessão antes de continuar.
     */

    try {

        const resposta =
            await API.validarSessao(token);


        if (
            resposta &&
            resposta.sucesso === true
        ) {

            esconderLogin();

            atualizarStatusComunicados();

            await verificarTermometro();

            return;

        }


        /*
         * Sessão inválida.
         */

        limparSessao();

        abrirLogin();

        atualizarStatusComunicados();

    }

    catch (erro) {

        console.error(
            "Erro ao validar sessão:",
            erro
        );

        /*
         * Mesmo que a validação dê problema,
         * não mandamos o usuário para outra página.
         *
         * Mantemos o Login sobre o Dashboard.
         */

        abrirLogin();

    }

}


/* =====================================================
   LOGIN
   ===================================================== */

function configurarLogin() {

    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            limparMensagemLogin();


            const formData =
                new FormData(loginForm);


            const email =
                String(
                    formData.get("email") || ""
                ).trim();


            const senha =
                String(
                    formData.get("senha") || ""
                );


            if (!email || !senha) {

                mostrarMensagemLogin(
                    "Informe o e-mail e a senha."
                );

                return;

            }


            definirLoginCarregando(true);


            try {

                const resposta =
                    await API.login(
                        email,
                        senha
                    );


                console.log(
                    "Resposta login:",
                    resposta
                );


                if (
                    !resposta ||
                    resposta.sucesso !== true
                ) {

                    mostrarMensagemLogin(
                        resposta?.erro ||
                        resposta?.mensagem ||
                        "E-mail ou senha inválidos."
                    );

                    definirLoginCarregando(false);

                    return;

                }


                /*
                 * Localiza o token independentemente
                 * do nome utilizado pelo backend.
                 */

                const token =
                    localizarToken(resposta);


                if (!token) {

                    console.error(
                        "Login retornou sucesso, mas não retornou token.",
                        resposta
                    );


                    mostrarMensagemLogin(
                        "Login realizado, mas a sessão não foi criada. Verifique a configuração da API."
                    );


                    definirLoginCarregando(false);

                    return;

                }


                salvarToken(token);


                /*
                 * Guarda também os dados do usuário,
                 * caso o backend envie.
                 */

                salvarUsuario(
                    resposta.usuario ||
                    resposta.user ||
                    resposta.dados ||
                    null
                );


                /*
                 * Login concluído.
                 *
                 * IMPORTANTE:
                 * NÃO redireciona para login.html.
                 */

                esconderLogin();


                loginForm.reset();


                definirLoginCarregando(false);


                /*
                 * Agora verifica automaticamente
                 * o Termômetro.
                 */

                await verificarTermometro();


                /*
                 * Atualiza o card de Comunicados.
                 */

                await atualizarStatusComunicados();

            }

            catch (erro) {

                console.error(
                    "Erro no login:",
                    erro
                );


                mostrarMensagemLogin(
                    "Não foi possível conectar ao Portal RH."
                );


                definirLoginCarregando(false);

            }

        }
    );

}


/* =====================================================
   ABRIR LOGIN
   ===================================================== */

function abrirLogin() {

    if (!loginOverlay) {
        return;
    }


    loginOverlay.hidden = false;


    /*
     * O login fica por cima do Dashboard.
     */

    document.body.classList.add(
        "portal-modal-open"
    );


    setTimeout(
        function () {

            const emailInput =
                loginForm?.querySelector(
                    'input[name="email"]'
                );

            if (emailInput) {
                emailInput.focus();
            }

        },
        100
    );

}


/* =====================================================
   FECHAR LOGIN
   ===================================================== */

function esconderLogin() {

    if (!loginOverlay) {
        return;
    }


    loginOverlay.hidden = true;


    document.body.classList.remove(
        "portal-modal-open"
    );

}


/* =====================================================
   CONFIGURAR TERMÔMETRO
   ===================================================== */

function configurarTermometro() {

    if (!thermometerForm) {
        return;
    }


    thermometerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            limparMensagemTermometro();


            const token =
                obterToken();


            if (!token) {

                mostrarMensagemTermometro(
                    "Sua sessão expirou. Faça login novamente."
                );

                fecharTermometro();

                abrirLogin();

                return;

            }


            const formData =
                new FormData(
                    thermometerForm
                );


            const humor =
                formData.get("humor");


            const energia =
                formData.get("energia");


            const observacao =
                String(
                    formData.get("observacao") || ""
                ).trim();


            if (!humor) {

                mostrarMensagemTermometro(
                    "Selecione como você está hoje."
                );

                return;

            }


            if (!energia) {

                mostrarMensagemTermometro(
                    "Selecione seu nível de energia."
                );

                return;

            }


            definirTermometroCarregando(
                true
            );


            try {

                const dados = {

                    token: token,

                    humor: humor,

                    energia: energia,

                    observacao: observacao

                };


                const resposta =
                    await API.salvarTermometro(
                        dados
                    );


                console.log(
                    "Resposta termômetro:",
                    resposta
                );


                if (
                    !resposta ||
                    resposta.sucesso !== true
                ) {

                    mostrarMensagemTermometro(
                        resposta?.erro ||
                        resposta?.mensagem ||
                        "Não foi possível registrar sua resposta."
                    );


                    definirTermometroCarregando(
                        false
                    );

                    return;

                }


                /*
                 * Resposta salva.
                 */

                mostrarMensagemTermometro(
                    "Resposta registrada com sucesso!"
                );


                if (statusTermometro) {

                    statusTermometro.textContent =
                        "Respondido hoje";

                    statusTermometro.className =
                        "status-on";

                }


                /*
                 * Pequena pausa para o usuário
                 * visualizar a confirmação.
                 */

                setTimeout(
                    function () {

                        fecharTermometro();

                        thermometerForm.reset();

                        limparMensagemTermometro();

                        definirTermometroCarregando(
                            false
                        );

                    },
                    900
                );

            }

            catch (erro) {

                console.error(
                    "Erro ao salvar termômetro:",
                    erro
                );


                mostrarMensagemTermometro(
                    "Não foi possível registrar sua resposta."
                );


                definirTermometroCarregando(
                    false
                );

            }

        }
    );

}


/* =====================================================
   VERIFICAR TERMÔMETRO DO DIA
   ===================================================== */

async function verificarTermometro() {

    const token =
        obterToken();


    if (!token) {

        abrirLogin();

        return;

    }


    if (statusTermometro) {

        statusTermometro.textContent =
            "Verificando...";

        statusTermometro.className = "";

    }


    try {

        const resposta =
            await API.verificarTermometroHoje(
                token
            );


        console.log(
            "Verificação termômetro:",
            resposta
        );


        if (
            !resposta ||
            resposta.sucesso !== true
        ) {

            /*
             * Não força outra página.
             */

            if (statusTermometro) {

                statusTermometro.textContent =
                    "Não foi possível verificar";

            }

            return;

        }


        const respondido =
            identificarSeTermometroFoiRespondido(
                resposta
            );


        if (respondido) {

            /*
             * Já respondeu hoje.
             */

            if (statusTermometro) {

                statusTermometro.textContent =
                    "Respondido hoje";

                statusTermometro.className =
                    "status-on";

            }


            fecharTermometro();

            return;

        }


        /*
         * PENDENTE
         *
         * Abre automaticamente sobre o Dashboard.
         */

        if (statusTermometro) {

            statusTermometro.textContent =
                "Pendente";

        }


        abrirTermometro();

    }

    catch (erro) {

        console.error(
            "Erro ao verificar termômetro:",
            erro
        );

    }

}


/* =====================================================
   IDENTIFICAR RESPOSTA DO TERMÔMETRO
   ===================================================== */

function identificarSeTermometroFoiRespondido(
    resposta
) {

    /*
     * Aceita diferentes nomes de propriedades
     * para evitar incompatibilidade entre versões
     * do backend.
     */

    const valores = [

        resposta.respondido,

        resposta.respondidoHoje,

        resposta.jaRespondido,

        resposta.ja_respondido,

        resposta.respondeu,

        resposta.pendente === false,

        resposta.status === "respondido",

        resposta.status === "Respondido",

        resposta.data?.respondido,

        resposta.dados?.respondido

    ];


    for (
        let i = 0;
        i < valores.length;
        i++
    ) {

        if (
            valores[i] === true
        ) {

            return true;

        }

    }


    return false;

}


/* =====================================================
   ABRIR TERMÔMETRO
   ===================================================== */

function abrirTermometro() {

    if (!thermometerOverlay) {
        return;
    }


    thermometerOverlay.hidden = false;


    document.body.classList.add(
        "portal-modal-open"
    );


    /*
     * Coloca o primeiro humor em foco
     * somente visualmente.
     */

    setTimeout(
        function () {

            const primeiroHumor =
                thermometerForm?.querySelector(
                    'input[name="humor"]'
                );

            if (primeiroHumor) {

                /*
                 * Não selecionamos automaticamente.
                 * Apenas mantemos o formulário pronto.
                 */

            }

        },
        100
    );

}


/* =====================================================
   FECHAR TERMÔMETRO
   ===================================================== */

function fecharTermometro() {

    if (!thermometerOverlay) {
        return;
    }


    thermometerOverlay.hidden = true;


    /*
     * Só remove a classe se o Login também
     * estiver fechado.
     */

    if (
        !loginOverlay ||
        loginOverlay.hidden
    ) {

        document.body.classList.remove(
            "portal-modal-open"
        );

    }

}


/* =====================================================
   CONFIGURAR NAVEGAÇÃO
   ===================================================== */

function configurarNavegacao() {

    const links =
        document.querySelectorAll(
            ".sidebar nav a"
        );


    links.forEach(
        function (link) {

            const href =
                link.getAttribute("href");


            /*
             * Termômetro:
             *
             * NÃO abre termometro.html.
             * Abre o card por cima do Dashboard.
             */

            if (
                href === "termometro.html"
            ) {

                link.addEventListener(
                    "click",
                    async function (event) {

                        event.preventDefault();


                        const token =
                            obterToken();


                        if (!token) {

                            abrirLogin();

                            return;

                        }


                        abrirTermometro();

                    }
                );

            }


            /*
             * Dashboard:
             *
             * permanece no Dashboard.
             */

            if (
                href === "portal.html"
            ) {

                link.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                    }
                );

            }

        }
    );

}


/* =====================================================
   LOGOUT
   ===================================================== */

function configurarLogout() {

    const logout =
        document.getElementById(
            "logout"
        );


    if (!logout) {
        return;
    }


    logout.addEventListener(
        "click",
        async function () {

            const token =
                obterToken();


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

                console.warn(
                    "Erro ao encerrar sessão no servidor:",
                    erro
                );

            }


            limparSessao();


            /*
             * Resetamos os cards.
             */

            if (statusTermometro) {

                statusTermometro.textContent =
                    "Verificando...";

                statusTermometro.className = "";

            }


            if (statusComunicados) {

                statusComunicados.textContent =
                    "Faça login para consultar";

            }


            /*
             * NÃO vai para login.html.
             *
             * O login aparece sobre o Dashboard.
             */

            abrirLogin();

        }
    );

}


/* =====================================================
   ATUALIZAR COMUNICADOS
   ===================================================== */

async function atualizarStatusComunicados() {

    if (!statusComunicados) {
        return;
    }


    const token =
        obterToken();


    if (!token) {

        statusComunicados.textContent =
            "Faça login para consultar";

        return;

    }


    statusComunicados.textContent =
        "Carregando...";


    try {

        const resposta =
            await API.comunicadosPendentes(
                token
            );


        console.log(
            "Comunicados:",
            resposta
        );


        if (
            !resposta ||
            resposta.sucesso !== true
        ) {

            statusComunicados.textContent =
                "Não foi possível carregar";

            return;

        }


        const lista =
            Array.isArray(
                resposta.comunicados
            )
                ? resposta.comunicados
                : [];


        const quantidade =
            Number(
                resposta.quantidade ??
                lista.length
            );


        if (quantidade > 0) {

            statusComunicados.textContent =
                quantidade === 1
                    ? "1 comunicado pendente"
                    : quantidade +
                      " comunicados pendentes";

            return;

        }


        statusComunicados.textContent =
            "Nenhum comunicado pendente";

    }

    catch (erro) {

        console.error(
            "Erro ao carregar comunicados:",
            erro
        );


        statusComunicados.textContent =
            "Não foi possível carregar";

    }

}


/* =====================================================
   TOKEN
   ===================================================== */

function obterToken() {

    for (
        let i = 0;
        i < PORTAL.TOKEN_KEYS.length;
        i++
    ) {

        const valor =
            localStorage.getItem(
                PORTAL.TOKEN_KEYS[i]
            );


        if (
            valor &&
            valor !== "null" &&
            valor !== "undefined"
        ) {

            return valor;

        }

    }


    return null;

}


/* =====================================================
   SALVAR TOKEN
   ===================================================== */

function salvarToken(token) {

    if (!token) {
        return;
    }


    /*
     * Usamos uma chave principal.
     */

    localStorage.setItem(
        "cmivet_token",
        String(token)
    );


    /*
     * Também mantemos "token" para
     * compatibilidade com versões anteriores.
     */

    localStorage.setItem(
        "token",
        String(token)
    );

}


/* =====================================================
   LOCALIZAR TOKEN NA RESPOSTA
   ===================================================== */

function localizarToken(resposta) {

    if (!resposta) {
        return null;
    }


    const possibilidades = [

        resposta.token,

        resposta.accessToken,

        resposta.access_token,

        resposta.sessionToken,

        resposta.session_token,

        resposta.dados?.token,

        resposta.usuario?.token,

        resposta.user?.token

    ];


    for (
        let i = 0;
        i < possibilidades.length;
        i++
    ) {

        if (
            possibilidades[i] !== undefined &&
            possibilidades[i] !== null &&
            String(possibilidades[i]).trim() !== ""
        ) {

            return possibilidades[i];

        }

    }


    return null;

}


/* =====================================================
   USUÁRIO
   ===================================================== */

function salvarUsuario(usuario) {

    if (!usuario) {
        return;
    }


    try {

        localStorage.setItem(
            "cmivet_usuario",
            JSON.stringify(usuario)
        );

    }

    catch (erro) {

        console.warn(
            "Não foi possível salvar usuário:",
            erro
        );

    }

}


/* =====================================================
   LIMPAR SESSÃO
   ===================================================== */

function limparSessao() {

    PORTAL.TOKEN_KEYS.forEach(
        function (key) {

            localStorage.removeItem(key);

        }
    );


    PORTAL.USER_KEYS.forEach(
        function (key) {

            localStorage.removeItem(key);

        }
    );


    /*
     * Chaves adicionais de versões antigas.
     */

    localStorage.removeItem(
        "cmivet_usuario"
    );

    localStorage.removeItem(
        "portal_usuario"
    );

}


/* =====================================================
   MENSAGEM LOGIN
   ===================================================== */

function mostrarMensagemLogin(
    mensagem
) {

    if (!loginMessage) {
        return;
    }


    loginMessage.textContent =
        mensagem || "";

}


function limparMensagemLogin() {

    mostrarMensagemLogin("");

}


/* =====================================================
   MENSAGEM TERMÔMETRO
   ===================================================== */

function mostrarMensagemTermometro(
    mensagem
) {

    if (!thermometerMessage) {
        return;
    }


    thermometerMessage.textContent =
        mensagem || "";

}


function limparMensagemTermometro() {

    mostrarMensagemTermometro("");

}


/* =====================================================
   BOTÃO LOGIN — CARREGANDO
   ===================================================== */

function definirLoginCarregando(
    carregando
) {

    if (!loginButton) {
        return;
    }


    loginButton.disabled =
        carregando;


    loginButton.textContent =
        carregando
            ? "Entrando..."
            : "Entrar";

}


/* =====================================================
   BOTÃO TERMÔMETRO — CARREGANDO
   ===================================================== */

function definirTermometroCarregando(
    carregando
) {

    if (!thermometerButton) {
        return;
    }


    thermometerButton.disabled =
        carregando;


    thermometerButton.textContent =
        carregando
            ? "Salvando..."
            : "Enviar resposta";

}


/* =====================================================
   ESC — NÃO FECHA TERMÔMETRO OBRIGATÓRIO
   ===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        /*
         * O Login não fecha com ESC.
         */

        if (
            loginOverlay &&
            !loginOverlay.hidden
        ) {

            event.preventDefault();

            return;

        }


        /*
         * O Termômetro também não fecha
         * enquanto estiver pendente.
         */

        if (
            thermometerOverlay &&
            !thermometerOverlay.hidden
        ) {

            event.preventDefault();

            return;

        }

    }
);


/* =====================================================
   EVITAR CLIQUE FORA FECHAR
   ===================================================== */

if (typeof document !== "undefined") {

    document.addEventListener(
        "click",
        function (event) {

            /*
             * Se clicar no fundo escuro do Login,
             * não fecha.
             */

            if (
                event.target === loginOverlay
            ) {

                event.preventDefault();

            }


            /*
             * Se clicar no fundo escuro do Termômetro,
             * também não fecha.
             */

            if (
                event.target === thermometerOverlay
            ) {

                event.preventDefault();

            }

        }
    );

}


/* =====================================================
   FIM
   ===================================================== */
