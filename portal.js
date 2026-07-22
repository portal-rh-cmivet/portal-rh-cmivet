/*************************************************
 * PORTAL RH CMIVET
 * portal.js v2.0
 *************************************************/

/*************************************************
 * CONFIGURAÇÃO
 *************************************************/

const API_URL =
    "https://script.google.com/macros/s/AKfycbz7dmmQpgyCucCbCFlsXmzp3gf_A_eBUdlkrgx5Ysik5729_U9vsswW3gSfQtGDaFuj/exec";

const TOKEN =
    sessionStorage.getItem("cmivet_token");

let USER = {};

/*************************************************
 * CARREGA USUÁRIO DA SESSÃO
 *************************************************/

try {

    USER = JSON.parse(

        sessionStorage.getItem("cmivet_user") || "{}"

    );

} catch {

    USER = {};

}

/*************************************************
 * SEM TOKEN
 *************************************************/

if (!TOKEN) {

    window.location.href = "index.html";

}

/*************************************************
 * INICIALIZAÇÃO
 *************************************************/

document.addEventListener(

    "DOMContentLoaded",

    initPortal

);

async function initPortal() {

    try {

        await validateSession();

        loadUser();

        configureMenu();

        configureLogout();

        await loadDashboard();

    } catch (error) {

        console.error(error);

        logout();

    }

}

/*************************************************
 * DASHBOARD
 *************************************************/

async function loadDashboard() {

    await Promise.all([

        loadAnnouncements(),

        verifyDailyThermometer()

    ]);

}

/*************************************************
 * VALIDA SESSÃO
 *************************************************/

async function validateSession() {

    const response = await post({

        action: "validarSessao",

        token: TOKEN

    });

    if (!response.sucesso) {

        logout();

    }

}

/*************************************************
 * CARREGA DADOS DO USUÁRIO
 *************************************************/

function loadUser() {

    if (!USER.nome) return;

    const firstName =

        USER.nome.split(" ")[0];

    const initials =

        USER.nome

            .split(" ")

            .slice(0,2)

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

    if (welcome)

        welcome.textContent =

            `Bem-vindo, ${firstName}`;

    if (userName)

        userName.textContent =

            USER.nome;

    if (userRole)

        userRole.textContent =

            USER.cargo ||

            USER.perfil ||

            "";

    if (avatar)

        avatar.textContent =

            initials;

}

/*************************************************
 * MENU
 *************************************************/

function configureMenu() {

    const admin =

        document.getElementById("adminLink");

    if (!admin) return;

    admin.hidden =

        String(USER.perfil)

            .toLowerCase()

            !== "admin";

}

/*************************************************
 * LOGOUT
 *************************************************/

function configureLogout() {

    const btn =

        document.getElementById("logout");

    if (!btn) return;

    btn.addEventListener(

        "click",

        logout

    );

}

function logout() {

    sessionStorage.removeItem(

        "cmivet_token"

    );

    sessionStorage.removeItem(

        "cmivet_user"

    );

    window.location.href =

        "index.html";

}

/*************************************************
 * POST
 *************************************************/

async function post(data) {

    const response = await fetch(

        API_URL,

        {

            method: "POST",

            headers: {

                "Content-Type":

                    "application/json"

            },

            body: JSON.stringify(data)

        }

    );

    return await response.json();

}
/*************************************************
 * COMUNICADOS
 *************************************************/

async function loadAnnouncements() {

    try {

        const response = await fetch(

            `${API_URL}?action=comunicados&t=${Date.now()}`

        );

        const data = await response.json();

        renderAnnouncements(

            Array.isArray(data) ? data : []

        );

    } catch (error) {

        console.error(error);

        renderAnnouncements([]);

    }

}

function renderAnnouncements(lista) {

    const container =

        document.getElementById("announcements");

    if (!container) return;

    if (!lista.length) {

        container.innerHTML = `

            <div class="empty">

                Nenhum comunicado disponível.

            </div>

        `;

        return;

    }

    container.innerHTML =

        lista

        .slice(0,6)

        .map(item => `

            <article class="card">

                <h3>

                    ${item.titulo || ""}

                </h3>

                <p>

                    ${item.descricao || ""}

                </p>

            </article>

        `)

        .join("");

    updateAnnouncementStatus(

        lista.length

    );

}

/*************************************************
 * STATUS DOS COMUNICADOS
 *************************************************/

function updateAnnouncementStatus(total) {

    const card =

        document.getElementById(

            "statusComunicados"

        );

    if (!card) return;

    if (total === 0) {

        card.textContent =

            "Nenhum comunicado";

        return;

    }

    if (total === 1) {

        card.textContent =

            "1 comunicado";

        return;

    }

    card.textContent =

        `${total} comunicados`;

}

/*************************************************
 * TERMÔMETRO
 *************************************************/

async function verifyDailyThermometer() {

    const status =

        document.getElementById(

            "statusTermometro"

        );

    if (!status) return;

    try {

        const response = await post({

            action:

                "verificarTermometroHoje",

            token: TOKEN

        });

        if (

            response.sucesso &&

            response.respondido

        ) {

            status.textContent =

                "Respondido hoje";

            return;

        }

        status.textContent =

            "Pendente";

    } catch (error) {

        console.error(error);

        status.textContent =

            "Indisponível";

    }

}
/*************************************************
 * UTILITÁRIOS
 *************************************************/

function $(id) {

    return document.getElementById(id);

}

function showMessage(id, message) {

    const el = $(id);

    if (!el) return;

    el.textContent = message;

}

function setLoading(id, loading = true) {

    const el = $(id);

    if (!el) return;

    if (loading) {

        el.classList.add("loading");

    } else {

        el.classList.remove("loading");

    }

}

function formatDate(value) {

    if (!value) return "";

    return new Intl.DateTimeFormat(

        "pt-BR",

        {

            dateStyle: "short",

            timeStyle: "short"

        }

    ).format(new Date(value));

}

function escapeHtml(text) {

    if (!text) return "";

    return String(text)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}

/*************************************************
 * PLACEHOLDERS DOS MÓDULOS
 *************************************************/

async function loadCafeRH() {

    return;

}

async function loadBiblioteca() {

    return;

}

async function loadUniversidade() {

    return;

}

async function loadAvaliacoes() {

    return;

}

async function loadPerfil() {

    return;

}

/*************************************************
 * ERROS GLOBAIS
 *************************************************/

window.addEventListener(

    "unhandledrejection",

    function(event) {

        console.error(

            "Promise rejeitada:",

            event.reason

        );

    }

);

window.addEventListener(

    "error",

    function(event) {

        console.error(

            "Erro:",

            event.error

        );

    }

);

/*************************************************
 * FIM DO ARQUIVO
 *************************************************/
