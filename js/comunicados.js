/*************************************************
 * PORTAL RH CMIVET
 * comunicados.js
 * Comunicados + imagens hospedadas no GitHub
 *************************************************/

const TOKEN = Auth.getToken();

const USER = Auth.getUser() || {};


/*************************************************
 * CAMINHO DAS IMAGENS
 *************************************************/

const CAMINHO_IMAGENS = "Comunicados/";


/*************************************************
 * INICIALIZAÇÃO
 *************************************************/

document.addEventListener(
    "DOMContentLoaded",
    iniciarPagina
);


async function iniciarPagina() {

    try {

        await Auth.protegerPagina();

        carregarUsuario();

        configurarMenu();

        configurarLogout();

        await carregarComunicados();

    }

    catch (erro) {

        console.error(
            "Erro ao iniciar Comunicados:",
            erro
        );

    }

}


/*************************************************
 * DADOS DO USUÁRIO
 *************************************************/

function carregarUsuario() {

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


    const nome =
        USER.nome || "";


    const iniciais =
        nome
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(
                nome => nome.charAt(0)
            )
            .join("")
            .toUpperCase();


    if (userName) {

        userName.textContent =
            nome || "Usuário";

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
 * CARREGAR COMUNICADOS
 *************************************************/

async function carregarComunicados() {

    const container =
        document.getElementById(
            "announcements"
        );


    const status =
        document.getElementById(
            "statusComunicados"
        );


    if (!container) return;


    container.innerHTML = `

        <div class="loading-card">

            Carregando comunicados...

        </div>

    `;


    if (status) {

        status.textContent =
            "Carregando...";

    }


    try {

        const resposta =
            await API.getComunicados();


        console.log(
            "Resposta dos comunicados:",
            resposta
        );


        if (
            !resposta ||
            !resposta.sucesso
        ) {

            throw new Error(

                resposta?.erro ||
                "Não foi possível carregar os comunicados."

            );

        }


        const comunicados =
            Array.isArray(
                resposta.comunicados
            )
                ? resposta.comunicados
                : [];


        if (status) {

            status.textContent =
                comunicados.length +
                (
                    comunicados.length === 1
                        ? " comunicado"
                        : " comunicados"
                );

        }


        if (!comunicados.length) {

            container.innerHTML = `

                <div class="empty-card">

                    Nenhum comunicado disponível.

                </div>

            `;

            return;

        }


        container.innerHTML =
            comunicados
                .map(
                    renderComunicado
                )
                .join("");


    }

    catch (erro) {

        console.error(
            "Erro ao carregar comunicados:",
            erro
        );


        if (status) {

            status.textContent =
                "Erro ao carregar";

        }


        container.innerHTML = `

            <div class="error-card">

                ⚠️ Não foi possível carregar os comunicados.

                <br><br>

                <small>
                    ${escapeHtml(
                        erro.message ||
                        "Erro desconhecido."
                    )}
                </small>

            </div>

        `;

    }

}


/*************************************************
 * RENDERIZAR COMUNICADO
 *************************************************/

function renderComunicado(
    comunicado
) {

    const imagem =
        obterImagemComunicado(
            comunicado.titulo
        );


    const titulo =
        escapeHtml(
            comunicado.titulo
        );


    const descricao =
        escapeHtml(
            comunicado.descricao
        );


    const data =
        formatarData(
            comunicado.criado_em
        );


    return `

        <article
            class="announcement-card"
            data-id="${escapeHtml(
                comunicado.id
            )}"
        >

            ${
                imagem
                    ? `

                    <div
                        class="announcement-image"
                    >

                        <img
                            src="${imagem}"
                            alt="${titulo}"
                            loading="lazy"
                            onerror="
                                console.error(
                                    'Imagem não encontrada:',
                                    this.src
                                );

                                this.parentElement.style.display='none';
                            "
                        >

                    </div>

                    `
                    : ""
            }


            <div
                class="announcement-content"
            >

                <div
                    class="announcement-date"
                >

                    📅 ${data}

                </div>


                <h3>

                    ${titulo}

                </h3>


                <p>

                    ${descricao}

                </p>


                <div
                    class="announcement-actions"
                >

                    <button
                        type="button"
                        class="announcement-read"
                        onclick="
                            confirmarLeitura(
                                '${escapeHtml(
                                    comunicado.id
                                )}',
                                this
                            )
                        "
                    >

                        ✅ Marcar como lido

                    </button>

                </div>

            </div>

        </article>

    `;

}


/*************************************************
 * IDENTIFICAR IMAGEM
 *************************************************/

function obterImagemComunicado(
    titulo
) {

    const nome =
        normalizarTexto(
            titulo
        );


    /*
     * PONTO
     */

    if (
        nome === "ponto"
    ) {

        return CAMINHO_IMAGENS +
            "Comunicado ponto.jpg";

    }


    /*
     * ANIVERSARIANTES
     */

    if (
        nome === "aniversariantes"
    ) {

        return CAMINHO_IMAGENS +
            "Aniversariantes.png";

    }


    /*
     * AVALIAÇÃO DE DESEMPENHO
     */

    if (
        nome.includes(
            "avaliacao de desempenho"
        )
    ) {

        return CAMINHO_IMAGENS +
            "Avaliação de desempenho.png";

    }


    /*
     * BOAS VINDAS ANA LARA
     */

    if (
        nome.includes(
            "boas vindas"
        ) &&
        nome.includes(
            "ana lara"
        )
    ) {

        return CAMINHO_IMAGENS +
            "Boas Vindas Ana Lara.png";

    }


    /*
     * BOAS VINDAS MARIA EDUARDA
     */

    if (
        nome.includes(
            "boas vindas"
        ) &&
        nome.includes(
            "maria eduarda"
        )
    ) {

        return CAMINHO_IMAGENS +
            "Boas Vindas Maria E.png";

    }


    /*
     * CONVÊNIO FARMÁCIA
     */

    if (
        nome.includes(
            "convenio farmacia"
        )
    ) {

        return CAMINHO_IMAGENS +
            "Convênio Farmacia.png";

    }


    /*
     * WELHUB
     */

    if (
        nome.includes(
            "welhub"
        )
    ) {

        return CAMINHO_IMAGENS +
            "Welhub.png";

    }


    return "";

}


/*************************************************
 * CONFIRMAR LEITURA
 *************************************************/

async function confirmarLeitura(
    id,
    botao
) {

    if (!id) return;


    if (botao) {

        botao.disabled =
            true;

        botao.textContent =
            "Registrando...";

    }


    try {

        const resposta =
            await API.confirmarLeitura({

                token: TOKEN,

                id: id

            });


        if (
            !resposta ||
            !resposta.sucesso
        ) {

            throw new Error(

                resposta?.erro ||
                "Não foi possível registrar a leitura."

            );

        }


        if (botao) {

            botao.textContent =
                "✅ Lido";

            botao.classList.add(
                "read"
            );

        }

    }

    catch (erro) {

        console.error(
            "Erro ao registrar leitura:",
            erro
        );


        if (botao) {

            botao.disabled =
                false;

            botao.textContent =
                "Tentar novamente";

        }


        alert(
            erro.message ||
            "Não foi possível registrar a leitura."
        );

    }

}


/*************************************************
 * NORMALIZAR TEXTO
 *************************************************/

function normalizarTexto(
    texto
) {

    return String(
        texto || ""
    )

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .toLowerCase()

        .trim();

}


/*************************************************
 * FORMATAR DATA
 *************************************************/

function formatarData(
    data
) {

    if (!data) {

        return "";

    }


    try {

        const dataObj =
            new Date(data);


        if (
            isNaN(
                dataObj.getTime()
            )
        ) {

            return "";

        }


        return dataObj.toLocaleDateString(
            "pt-BR"
        );

    }

    catch (erro) {

        return "";

    }

}


/*************************************************
 * ESCAPE HTML
 *************************************************/

function escapeHtml(
    texto
) {

    return String(
        texto || ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/*************************************************
 * FIM
 *************************************************/
