const API_URL = "https://script.google.com/macros/s/AKfycbz7dmmQpgyCucCbCFlsXmzp3gf_A_eBUdlkrgx5Ysik5729_U9vsswW3gSfQtGDaFuj/exec";

const sectionTitles = {
  inicio: "Portal do Colaborador",
  comunicados: "Comunicados",
  termometro: "Termômetro Emocional",
  cafe: "Café com o RH",
  experiencia: "Avaliação de Experiência"
};

const toast = document.querySelector("#toast");
const apiStatus = document.querySelector("#apiStatus");
let announcements = [];

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

function renderAnnouncements() {
  const search = document.querySelector("#announcementSearch").value.trim().toLowerCase();
  const category = document.querySelector("#announcementCategory").value;

  const filtered = announcements.filter(item => {
    const searchable = `${item.title} ${item.description} ${item.category}`.toLowerCase();
    return (!search || searchable.includes(search)) && (!category || item.category === category);
  });

  document.querySelector("#publicAnnouncements").innerHTML = filtered.length
    ? filtered.map(announcementCard).join("")
    : `<div class="empty">Nenhum comunicado encontrado.</div>`;

  document.querySelector("#homeAnnouncements").innerHTML = announcements.length
    ? announcements.slice(0, 4).map(announcementCard).join("")
    : `<div class="empty">Nenhum comunicado publicado.</div>`;
}

async function loadAnnouncements() {
  document.querySelector("#publicAnnouncements").innerHTML = `<div class="empty">Carregando comunicados...</div>`;
  document.querySelector("#homeAnnouncements").innerHTML = `<div class="empty">Carregando comunicados...</div>`;

  try {
    const raw = await apiGet("comunicados");
    announcements = (Array.isArray(raw) ? raw : raw.comunicados || [])
      .map(normalizeAnnouncement)
      .filter(item => item.active)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));

    const select = document.querySelector("#announcementCategory");
    const categories = [...new Set(announcements.map(item => item.category).filter(Boolean))].sort();
    select.innerHTML = `<option value="">Todas as categorias</option>` +
      categories.map(item => `<option>${escapeHtml(item)}</option>`).join("");

    renderAnnouncements();
    apiStatus.textContent = "API conectada";
    apiStatus.className = "api-status online";
  } catch (error) {
    console.error(error);
    document.querySelector("#publicAnnouncements").innerHTML = `<div class="empty">Não foi possível carregar os comunicados.</div>`;
    document.querySelector("#homeAnnouncements").innerHTML = `<div class="empty">Não foi possível carregar os comunicados.</div>`;
    apiStatus.textContent = "API indisponível";
    apiStatus.className = "api-status offline";
  }
}

document.querySelector("#announcementSearch").addEventListener("input", renderAnnouncements);
document.querySelector("#announcementCategory").addEventListener("change", renderAnnouncements);
document.querySelector("#refreshAnnouncements").addEventListener("click", loadAnnouncements);

document.querySelector("#moodForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const button = document.querySelector("#moodButton");

  const payload = {
    action: "termometro",
    nome: data.get("nome").trim(),
    setor: data.get("setor").trim(),
    humor: data.get("humor"),
    energia: data.get("energia"),
    observacao: data.get("observacao").trim()
  };

  button.disabled = true;
  button.textContent = "Enviando...";

  try {
    const result = await apiPost(payload);
    if (result.sucesso === false) throw new Error(result.erro || "Falha ao registrar.");
    form.reset();
    showToast("Resposta registrada com sucesso.");
  } catch (error) {
    console.error(error);
    showToast(`Não foi possível registrar: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = "Registrar resposta";
  }
});

document.querySelector("#coffeeForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const button = document.querySelector("#coffeeButton");

  const payload = {
    action: "cafeRH",
    nome: data.get("nome").trim(),
    setor: data.get("setor").trim(),
    contato: data.get("contato").trim(),
    motivo: data.get("motivo").trim(),
    urgencia: data.get("urgencia")
  };

  button.disabled = true;
  button.textContent = "Enviando...";

  try {
    const result = await apiPost(payload);
    if (result.sucesso === false) throw new Error(result.erro || "Falha ao enviar.");
    form.reset();
    showToast("Solicitação enviada ao RH.");
  } catch (error) {
    console.error(error);
    showToast(`Não foi possível enviar: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = "Enviar solicitação";
  }
});

function openSection(sectionId) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.toggle("active", section.id === sectionId);
  });
  document.querySelectorAll(".menu-item").forEach(button => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
  document.querySelector("#pageTitle").textContent = sectionTitles[sectionId] || "Portal RH";
  document.querySelector("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
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
