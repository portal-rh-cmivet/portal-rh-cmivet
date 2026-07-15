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

const chartColors = ["#0f6258", "#c9ab5d", "#3f8f83", "#d8bd78", "#6a9f97", "#8f7a43"];
const toast = document.querySelector("#toast");
const apiStatus = document.querySelector("#apiStatus");
const announcementForm = document.querySelector("#announcementForm");
const publishButton = document.querySelector("#publishButton");
let currentAnnouncements = [];

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
    fileType: String(item.fileType || item.tipo_arquivo || "Sem anexo"),
    pinned: item.pinned === true || String(item.fixado || "").toLowerCase() === "sim",
    active: item.active !== false && String(item.ativo || "sim").toLowerCase() !== "não"
  };
}

async function apiGet(action) {
  const response = await fetch(`${API_URL}?action=${encodeURIComponent(action)}&t=${Date.now()}`, { cache: "no-store" });
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
      <div class="announcement-meta"><span>${escapeHtml(item.category)}</span>${fixed}</div>
      <h4>${escapeHtml(item.title)}</h4>
      ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      ${file}
    </article>
  `;
}

function countBy(list, keyFn) {
  return list.reduce((acc, item) => {
    const key = keyFn(item) || "Não informado";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function renderCategoryChart(list) {
  const counts = countBy(list, item => item.category);
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, count]) => count), 1);

  document.querySelector("#categoryChart").innerHTML = entries.length
    ? entries.map(([label, count]) => `
        <div class="bar-row">
          <div class="bar-label" title="${escapeHtml(label)}">${escapeHtml(label)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.round(count / max * 100)}%"></div></div>
          <div class="bar-value">${count}</div>
        </div>
      `).join("")
    : `<div class="empty">Nenhuma categoria disponível.</div>`;
}

function renderFileTypeChart(list) {
  const counts = countBy(list, item => item.fileUrl ? item.fileType.toLowerCase() : "Sem anexo");
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (!entries.length) {
    document.querySelector("#fileTypeChart").innerHTML = `<div class="empty">Nenhum dado disponível.</div>`;
    return;
  }

  let cursor = 0;
  const segments = entries.map(([, count], index) => {
    const start = cursor;
    cursor += total ? (count / total) * 100 : 0;
    return `${chartColors[index % chartColors.length]} ${start}% ${cursor}%`;
  });

  document.querySelector("#fileTypeChart").innerHTML = `
    <div class="donut-wrap">
      <div class="donut" style="background:conic-gradient(${segments.join(",")})">
        <div class="donut-center"><strong>${total}</strong><span>itens</span></div>
      </div>
      <div class="legend">
        ${entries.map(([label, count], index) => `
          <div class="legend-item">
            <div class="legend-label"><span class="legend-dot" style="background:${chartColors[index % chartColors.length]}"></span>${escapeHtml(label)}</div>
            <strong>${count}</strong>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderDashboard(list) {
  const categories = new Set(list.map(item => item.category).filter(Boolean));
  const pinned = list.filter(item => item.pinned).length;
  const withFiles = list.filter(item => item.fileUrl).length;

  document.querySelector("#metricComunicados").textContent = list.length;
  document.querySelector("#metricFixados").textContent = pinned;
  document.querySelector("#metricCategorias").textContent = categories.size;
  document.querySelector("#metricAnexos").textContent = withFiles;

  document.querySelector("#metricComunicadosDetail").textContent = list.length === 1 ? "1 publicação ativa" : `${list.length} publicações ativas`;
  document.querySelector("#metricFixadosDetail").textContent = pinned ? `${pinned} em destaque` : "Nenhum em destaque";
  document.querySelector("#metricCategoriasDetail").textContent = categories.size ? `${categories.size} grupos de conteúdo` : "Sem categorias";
  document.querySelector("#metricAnexosDetail").textContent = withFiles ? `${withFiles} com arquivo ou link` : "Nenhum anexo";

  renderCategoryChart(list);
  renderFileTypeChart(list);
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

    currentAnnouncements = list;
    renderDashboard(list);

    adminBox.innerHTML = list.length ? list.map(announcementCard).join("") : `<div class="empty">Nenhum comunicado ativo.</div>`;
    dashboardBox.innerHTML = list.length ? list.slice(0, 4).map(announcementCard).join("") : `<div class="empty">Nenhum comunicado ativo.</div>`;

    apiStatus.textContent = "API conectada";
    apiStatus.className = "api-status online";
  } catch (error) {
    console.error(error);
    adminBox.innerHTML = `<div class="empty">Não foi possível carregar os comunicados.</div>`;
    dashboardBox.innerHTML = `<div class="empty">Não foi possível carregar os comunicados.</div>`;
    document.querySelector("#categoryChart").innerHTML = `<div class="empty">Não foi possível carregar o gráfico.</div>`;
    document.querySelector("#fileTypeChart").innerHTML = `<div class="empty">Não foi possível carregar os indicadores.</div>`;
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
document.querySelector("#refreshDashboard").addEventListener("click", async () => {
  showToast("Atualizando indicadores...");
  await loadAnnouncements();
});

function openSection(sectionId) {
  document.querySelectorAll(".page-section").forEach(section => section.classList.toggle("active", section.id === sectionId));
  document.querySelectorAll(".menu-item").forEach(button => button.classList.toggle("active", button.dataset.section === sectionId));
  document.querySelector("#pageTitle").textContent = sectionTitles[sectionId] || "Administração";
  document.querySelector("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".menu-item").forEach(button => button.addEventListener("click", () => openSection(button.dataset.section)));
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => openSection(button.dataset.go)));
document.querySelector("#mobileMenu").addEventListener("click", () => document.querySelector("#sidebar").classList.toggle("open"));

loadAnnouncements();
