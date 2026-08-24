/*************************************************
 * PORTAL RH CMIVET
 * comunicados.js
 * Versão 9.0 Premium
 *************************************************/

const TOKEN = Auth.getToken();
const USER = Auth.getUser() || {};

document.addEventListener("DOMContentLoaded", iniciarPagina);

async function iniciarPagina() {

    try {

        await Auth.protegerPagina();

        carregarUsuario();

        configurarMenu();

        configurarLogout();

        await carregarComunicados();

    }

    catch (erro) {

        console.error(erro);

        Auth.logout();

    }

}

/*************************************************
 * USUÁRIO
 *************************************************/

function carregarUsuario() {

    const avatar =
        document.getElementById("avatar");

    const userName =
        document.getElementById("userName");

    const userRole =
        document.getElementById("userRole");

    if (avatar) {

        avatar.textContent =
            (USER.nome || "")
            .split(" ")
            .map(n => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

    }

    if (userName)
        userName.textContent = USER.nome || "";

    if (userRole)
        userRole.textContent = USER.cargo || "";

}

function configurarMenu() {

    const admin =
        document.getElementById("adminLink");

    if (admin)
        admin.hidden =
            String(USER.perfil).toLowerCase() !== "admin";

}

function configurarLogout() {

    const btn =
        document.getElementById("logout");

    if (!btn) return;

    btn.onclick = () => Auth.logout();

}

/*************************************************
 * CARREGAR COMUNICADOS
 *************************************************/

async function carregarComunicados() {

    const container =
        document.getElementById("announcements");

    if (!container) return;

    container.innerHTML = `
        <div class="loading-card">
            Carregando comunicados...
        </div>
    `;

    const resposta =
        await API.getComunicados();

    if (!resposta.sucesso) {

        container.innerHTML = `
            <div class="error-card">
                ${resposta.erro}
            </div>
        `;

        return;

    }

    if (!resposta.comunicados.length) {

        container.innerHTML = `
            <div class="empty-card">
                Nenhum comunicado disponível.
            </div>
        `;

        return;

    }

    container.innerHTML =
        resposta.comunicados
            .map(renderComunicado)
            .join("");

}

/*************************************************
 * CARD
 *************************************************/

function renderComunicado(c) {

    return `

    <article class="announcement-card">

        ${c.imagem_url ? `
        <div class="announcement-image">
            <img src="${c.imagem_url}" alt="${escapeHtml(c.titulo)}">
        </div>` : ""}

        <div class="announcement-content">

            <div class="announcement-date">
                📅 ${formatarData(c.criado_em)}
            </div>

            <h3>
                ${escapeHtml(c.titulo)}
            </h3>

            <p>
                ${escapeHtml(c.descricao)}
            </p>

            <button
                class="btn btn-small"
                onclick="confirmarLeitura('${c.id}')">

                Marcar como lido

            </button>

        </div>

    </article>

    `;

}

/*************************************************
 * LEITURA
 *************************************************/

async function confirmarLeitura(id) {

    const resposta =
        await API.confirmarLeitura({

            token: TOKEN,

            id

        });

    if (resposta.sucesso) {

        alert("Leitura registrada.");

    } else {

        alert(resposta.erro);

    }

}

/*************************************************
 * UTILITÁRIOS
 *************************************************/

function formatarData(data) {

    if (!data) return "";

    return new Date(data)
        .toLocaleDateString("pt-BR");

}

function escapeHtml(texto) {

    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
