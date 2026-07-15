"use strict";

const API_URL = "https://script.google.com/macros/s/AKfycbz7dmmQpgyCucCbCFlsXmzp3gf_A_eBUdlkrgx5Ysik5729_U9vsswW3gSfQtGDaFuj/exec";

const form = document.querySelector("#announcementForm");
const announcementsBox = document.querySelector("#announcements");
const refreshButton = document.querySelector("#refreshButton");
const publishButton = document.querySelector("#publishButton");
const apiStatus = document.querySelector("#apiStatus");
const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function normalizeAnnouncements(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.comunicados)) return payload.comunicados;
  return [];
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, { redirect: "follow", ...options });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("A API respondeu em formato inválido.");
  }
  if (!response.ok) throw new Error(data.erro || `Erro HTTP ${response.status}`);
  return data;
}

async function checkApi() {
  try {
    const data = await requestJson(API_URL);
    if (data.status === "online") {
      apiStatus.textContent = "API conectada";
      apiStatus.className = "status online";
      return true;
    }
    throw new Error("Resposta inesperada");
  } catch (error) {
    apiStatus.textContent = "API indisponível";
    apiStatus.className = "status offline";
    console.error(error);
    return false;
  }
}

async function loadAnnouncements() {
  announcementsBox.innerHTML = '<div class="empty">Carregando comunicados...</div>';
  try {
    const payload = await requestJson(`${API_URL}?action=comunicados&_=${Date.now()}`);
    const items = normalizeAnnouncements(payload);

    if (!items.length) {
      announcementsBox.innerHTML = '<div class="empty">Nenhum comunicado ativo encontrado.</div>';
      return;
    }

    items.sort((a, b) => Number(Boolean(b.pinned ?? b.fixado === "sim")) - Number(Boolean(a.pinned ?? a.fixado === "sim")));
    announcementsBox.innerHTML = items.map(item => {
      const title = item.titulo ?? item.title ?? "Sem título";
      const category = item.categoria ?? item.category ?? "Comunicado";
      const description = item.descricao ?? item.description ?? "";
      const fileUrl = item.link_drive ?? item.fileUrl ?? "";
      const fileType = item.tipo_arquivo ?? item.fileType ?? "Anexo";
      const pinned = item.pinned === true || String(item.fixado || "").toLowerCase() === "sim";
      return `
        <article class="announcement">
          <div class="announcement-head">
            <h3>${escapeHtml(title)}</h3>
            <div class="badges">
              ${pinned ? '<span class="badge">📌 Fixado</span>' : ""}
              <span class="badge">${escapeHtml(category)}</span>
            </div>
          </div>
          ${description ? `<p>${escapeHtml(description)}</p>` : ""}
          ${fileUrl ? `<a class="file-link" href="${escapeHtml(fileUrl)}" target="_blank" rel="noopener noreferrer">📎 Abrir ${escapeHtml(fileType || "anexo")}</a>` : ""}
        </article>`;
    }).join("");
  } catch (error) {
    console.error(error);
    announcementsBox.innerHTML = `<div class="empty">Não foi possível carregar os comunicados.<br><small>${escapeHtml(error.message)}</small></div>`;
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const payload = {
    action: "novoComunicado",
    titulo: String(data.get("titulo") || "").trim(),
    categoria: String(data.get("categoria") || "Comunicado Geral"),
    descricao: String(data.get("descricao") || "").trim(),
    link_drive: String(data.get("link_drive") || "").trim(),
    tipo_arquivo: String(data.get("tipo_arquivo") || ""),
    fixado: data.get("fixado") ? "sim" : "não"
  };

  publishButton.disabled = true;
  publishButton.textContent = "Publicando...";

  try {
    const result = await requestJson(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    if (result.sucesso === false) throw new Error(result.erro || "Não foi possível publicar.");

    form.reset();
    showToast("Comunicado publicado com sucesso.");
    await loadAnnouncements();
  } catch (error) {
    console.error(error);
    showToast(`Erro: ${error.message}`);
  } finally {
    publishButton.disabled = false;
    publishButton.textContent = "Publicar comunicado";
  }
});

refreshButton.addEventListener("click", loadAnnouncements);

(async function init() {
  await checkApi();
  await loadAnnouncements();
})();
