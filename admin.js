const API_URL = "https://script.google.com/macros/s/AKfycbz7dmmQpgyCucCbCFlsXmzp3gf_A_eBUdlkrgx5Ysik5729_U9vsswW3gSfQtGDaFuj/exec";

const sectionTitles = {
  dashboard: "Dashboard Administrativo",
  comunicados: "Gerenciar Comunicados",
  colaboradores: "Gestão de Colaboradores",
  biblioteca: "Biblioteca RH",
  termometro: "Termômetro Emocional",
  cafe: "Café com o RH",
  avaliacoes: "Avaliações",
  configuracoes: "Configurações"
};

const toast = document.querySelector("#toast");
const apiStatus = document.querySelector("#apiStatus");
const announcementForm = document.querySelector("#announcementForm");
const publishButton = document.querySelector("#publishButton");

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

function normalizeAnnouncement(item) {
  return {
    id: item.id || item.id_comunicado || "",
    title: item.title || item.titulo || "Sem título",
    category: item.category || item.categoria || "Comunicado",
    description: item.description || item.descricao || "",
    fileUrl: item.fileUrl || item.link_drive || "",
    fileType: item.fileType || item.tipo_arquivo || "",
    pinned: item.pinned === true || String(item.fixado || "").toLowerCase() === "sim",
    active: item.active !== false && String(item.ativo || "sim").toLowerCase() !== "não"
  };
}

async function apiGet(action) {
  const response = await fetch(`${API_URL}?action=${encodeURIComponent(action)}&t=${Date.now()}`, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
  return response.json();
}

async function apiPost(payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
  return response.json();
}

function announcementCard(item) {
  const fixed = item.pinned ? `<span>📌 Fixado</span>` : "";
  const file = item.fileUrl
    ? `<a class="file-link" href="${escapeHtml(item.fileUrl)}" target="_blank" rel="noopener">📎 Abrir ${escapeHtml(item.fileType || "arquivo")}</a>`
    : "";

  return `
    <article class="announcement-card ${item.pinned ? "pinned" : ""}">
      <div class="announcement-meta">
        <span>${escapeHtml(item.category)}</span>
        ${fixed}
      </div>
      <h4>${escapeHtml(item.title)}</h4>
      ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      ${file}
    </article>
  `;
}

async function loadAnnouncements() {
  const adminBox = document.querySelector("#adminAnnouncements");
  const dashboardBox = document.querySelector("#dashboardAnnouncements");
  adminBox.innerHTML = `<div class="empty">Carregando comunicados...</div>`;
  dashboardBox.innerHTML = `<div class="empty">Carregando comunicados...</div>`;

  try {
    const raw = await apiGet("comunicados");
    const list = (Array.isArray(raw) ? raw : raw.comunicados || [])
      .map(normalizeAnnouncement)
      .filter(item => item.active)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));

    document.querySelector("#metricComunicados").textContent = list.length;

    adminBox.innerHTML = list.length
      ? list.map(announcementCard).join("")
      : `<div class="empty">Nenhum comunicado ativo.</div>`;

    dashboardBox.innerHTML = list.length
      ? list.slice(0, 4).map(announcementCard).join("")
      : `<div class="empty">Nenhum comunicado ativo.</div>`;

    apiStatus.textContent = "API conectada";
    apiStatus.className = "api-status online";
  } catch (error) {
    console.error(error);
    adminBox.innerHTML = `<div class="empty">Não foi possível carregar os comunicados.</div>`;
    dashboardBox.innerHTML = `<div class="empty">Não foi possível carregar os comunicados.</div>`;
    apiStatus.textContent = "API indisponível";
    apiStatus.className = "api-status offline";
  }
}

announcementForm.addEventListener("submit", async event => {
  event.preventDefault();
  const data = new FormData(announcementForm);

  const payload = {
    action: "novoComunicado",
    titulo: data.get("titulo").trim(),
    categoria: data.get("categoria"),
    descricao: data.get("descricao").trim(),
    link_drive: data.get("link_drive").trim(),
    tipo_arquivo: data.get("tipo_arquivo"),
    fixado: data.get("fixado") === "sim" ? "sim" : "não"
  };

  publishButton.disabled = true;
  publishButton.textContent = "Publicando...";

  try {
    const result = await apiPost(payload);
    if (result.sucesso === false) throw new Error(result.erro || "Falha ao publicar.");
    announcementForm.reset();
    showToast("Comunicado publicado com sucesso.");
    await loadAnnouncements();
  } catch (error) {
    console.error(error);
    showToast(`Não foi possível publicar: ${error.message}`);
  } finally {
    publishButton.disabled = false;
    publishButton.textContent = "Publicar comunicado";
  }
});

document.querySelector("#refreshAnnouncements").addEventListener("click", loadAnnouncements);

function openSection(sectionId) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.toggle("active", section.id === sectionId);
  });
  document.querySelectorAll(".menu-item").forEach(button => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
  document.querySelector("#pageTitle").textContent = sectionTitles[sectionId] || "Administração";
  document.querySelector("#sidebar").classList.remove("open");
}

document.querySelectorAll(".menu-item").forEach(button => {
  button.addEventListener("click", () => openSection(button.dataset.section));
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => openSection(button.dataset.go));
});

document.querySelector("#mobileMenu").addEventListener("click", () => {
  document.querySelector("#sidebar").classList.toggle("open");
});

loadAnnouncements();
