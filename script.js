
    const STORAGE_KEY = "termometro-emocional-respostas";
    const SETTINGS_KEY = "termometro-emocional-config";
    const COFFEE_KEY = "termometro-emocional-cafe-rh";
    const API_URL = "https://script.google.com/macros/s/AKfycby9fKhZuxXRfqrV8CRX-pUkFCPGPhBiINe8nAqoM7rYcUthr0IWyMX3MU9aB2oCYILQ/exec";
    const EXPERIENCE_KEY = "termometro-emocional-avaliacoes-experiencia";
    const ADMIN_SESSION_KEY = "termometro-emocional-admin";
    const DEFAULT_FACTORS = ["Trabalho", "Estudos", "Saúde", "Família", "Sono", "Relacionamentos", "Outro"];
    const LEVELS = ["4", "3", "2", "1"];
    const labels = {
      1: "Estressado",
      2: "Cansado",
      3: "Neutro",
      4: "Ótimo"
    };
    const emojis = {
      1: "😣",
      2: "😴",
      3: "🙂",
      4: "😄"
    };

    const form = document.querySelector("#responseForm");
    const coffeeForm = document.querySelector("#coffeeForm");
    const toast = document.querySelector("#toast");
    const bars = document.querySelector("#bars");
    const responsesBox = document.querySelector("#responses");
    const coffeeRequestsBox = document.querySelector("#coffeeRequests");
    const experienceForm = document.querySelector("#experienceForm");
    const experienceSection = document.querySelector("#experienceSection");
    const experienceGate = document.querySelector("#experienceGate");
    const experienceTitle = document.querySelector("#experienceTitle");
    const experienceType = document.querySelector("#experienceType");
    const experienceResponsesBox = document.querySelector("#experienceResponses");
    const factorsList = document.querySelector("#factorsList");
    const editFactorsList = document.querySelector("#editFactorsList");
    const adminLogin = document.querySelector("#adminLogin");
    const adminPin = document.querySelector("#adminPin");
    const settingsForm = document.querySelector("#settingsForm");
    const factorSettings = document.querySelector("#factorSettings");
    const newAdminPin = document.querySelector("#newAdminPin");
    const confirmAdminPin = document.querySelector("#confirmAdminPin");
    const editDialog = document.querySelector("#editDialog");
    const editForm = document.querySelector("#editForm");
    const editId = document.querySelector("#editId");
    const editMood = document.querySelector("#editMood");
    const editDate = document.querySelector("#editDate");
    const editComment = document.querySelector("#editComment");
    const totalEl = document.querySelector("#total");
    const averageEl = document.querySelector("#average");
    const todayEl = document.querySelector("#today");

    function createId() {
      if (crypto.randomUUID) return crypto.randomUUID();
      return `resposta-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function getSettings() {
      try {
        const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
        return {
          adminPin: settings.adminPin || "1234",
          factors: Array.isArray(settings.factors) && settings.factors.length ? settings.factors : DEFAULT_FACTORS
        };
      } catch {
        return { adminPin: "1234", factors: DEFAULT_FACTORS };
      }
    }

    function saveSettings(settings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }

    function normalizeMood(value) {
      const number = Number(value);
      if (number >= 4) return "4";
      if (number === 3) return "3";
      if (number === 2) return "2";
      return "1";
    }

    function getResponses() {
      try {
        return (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).map(item => ({
          id: item.id || createId(),
          mood: normalizeMood(item.mood),
          label: labels[normalizeMood(item.mood)],
          factors: Array.isArray(item.factors) ? item.factors : [],
          comment: item.comment || "",
          createdAt: item.createdAt || new Date().toISOString()
        }));
      } catch {
        return [];
      }
    }

    function saveResponses(items) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function getCoffeeRequests() {
      try {
        return (JSON.parse(localStorage.getItem(COFFEE_KEY)) || []).map(item => ({
          id: item.id || createId(),
          name: item.name || "",
          sector: item.sector || "",
          contact: item.contact || "",
          reason: item.reason || "",
          urgency: item.urgency || "Normal",
          createdAt: item.createdAt || new Date().toISOString()
        }));
      } catch {
        return [];
      }
    }

    function saveCoffeeRequests(items) {
      localStorage.setItem(COFFEE_KEY, JSON.stringify(items));
    }

    function getExperienceResponses() {
      try {
        return (JSON.parse(localStorage.getItem(EXPERIENCE_KEY)) || []).map(item => ({
          id: item.id || createId(),
          type: item.type || "45 dias",
          employeeName: item.employeeName || "",
          employeeRole: item.employeeRole || "",
          employeeSector: item.employeeSector || "",
          admissionDate: item.admissionDate || "",
          adaptationScore: item.adaptationScore || "",
          trainingScore: item.trainingScore || "",
          relationshipScore: item.relationshipScore || "",
          continueIntent: item.continueIntent || "",
          comment: item.comment || "",
          createdAt: item.createdAt || new Date().toISOString()
        }));
      } catch {
        return [];
      }
    }

    function saveExperienceResponses(items) {
      localStorage.setItem(EXPERIENCE_KEY, JSON.stringify(items));
    }

    const EXPERIENCE_FORM_LINKS = {
      "45": "https://docs.google.com/forms/d/1bXpZ3moQApWTS2aOCHDJ1xGskJC0GhhR_REivTCRbPc/viewform?usp=sharing",
      "90": "https://docs.google.com/forms/d/1yNO89RVkj6zWHT_BuHmd6u1O8WlvSkpYAblDdmoCc5A/viewform?usp=sharing"
    };

    function makeRestrictedLink(type) {
      const url = new URL(window.location.href.split("#")[0]);
      url.searchParams.set("avaliacao", type);
      url.searchParams.set("codigo", type === "45" ? "CMIVET45" : "CMIVET90");
      return url.toString();
    }

    function unlockExperience(type) {
      const safeType = type === "90" ? "90" : "45";
      const target = EXPERIENCE_FORM_LINKS[safeType];
      showToast(`Acesso liberado. Abrindo avaliação de ${safeType} dias...`);
      window.setTimeout(() => {
        window.location.href = target;
      }, 650);
    }

    function applyExperienceAccessFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const type = params.get("avaliacao");
      const code = (params.get("codigo") || "").toUpperCase();
      if (type === "45" && code === "CMIVET45") unlockExperience("45");
      if (type === "90" && code === "CMIVET90") unlockExperience("90");
    }

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      window.clearTimeout(showToast.timer);
      showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
    }

    function calendarDate(value) {
      return value.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    }

    function formatDate(value) {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
      }).format(new Date(value));
    }

    function render() {
      const responses = getResponses();
      const total = responses.length;
      const todayKey = new Date().toLocaleDateString("pt-BR");
      const todayCount = responses.filter(item => new Date(item.createdAt).toLocaleDateString("pt-BR") === todayKey).length;
      const average = total ? responses.reduce((sum, item) => sum + Number(item.mood), 0) / total : 0;

      totalEl.textContent = total;
      averageEl.textContent = total ? average.toFixed(1).replace(".", ",") : "-";
      todayEl.textContent = todayCount;

      bars.innerHTML = LEVELS.map(level => {
        const count = responses.filter(item => String(item.mood) === level).length;
        const pct = total ? Math.round((count / total) * 100) : 0;
        return `
          <div class="bar-row">
            <span>${emojis[level]} ${labels[level]}</span>
            <span class="track"><span class="fill" style="width:${pct}%"></span></span>
            <span>${count}</span>
          </div>
        `;
      }).join("");

      const recent = responses.slice().reverse();
      responsesBox.innerHTML = recent.length ? recent.map(item => `
        <article class="item">
          <div class="meta">
            <span class="badge">${emojis[item.mood] || ""} ${labels[item.mood]}</span>
            <time>${formatDate(item.createdAt)}</time>
          </div>
          ${item.factors.length ? `<div class="meta"><span>${item.factors.join(", ")}</span></div>` : ""}
          ${item.comment ? `<p class="comment">${escapeHtml(item.comment)}</p>` : ""}
          <div class="item-actions">
            <button class="btn btn-ghost btn-small" type="button" data-edit-id="${item.id}">Editar</button>
            <button class="btn btn-danger btn-small" type="button" data-delete-id="${item.id}">Excluir</button>
          </div>
        </article>
      `).join("") : `<div class="empty">Nenhuma resposta registrada ainda.</div>`;

      const coffeeRequests = getCoffeeRequests().slice().reverse();
      if (coffeeRequestsBox) {
        coffeeRequestsBox.innerHTML = coffeeRequests.length ? coffeeRequests.map(item => `
          <article class="item">
            <div class="meta">
              <span class="badge">☕ ${escapeHtml(item.urgency)}</span>
              <time>${formatDate(item.createdAt)}</time>
            </div>
            <div><b>${escapeHtml(item.name)}</b>${item.sector ? ` • ${escapeHtml(item.sector)}` : ""}</div>
            ${item.contact ? `<div class="meta"><span>Contato: ${escapeHtml(item.contact)}</span></div>` : ""}
            <p class="comment">${escapeHtml(item.reason)}</p>
            <div class="item-actions">
              <button class="btn btn-danger btn-small" type="button" data-delete-coffee-id="${item.id}">Excluir</button>
            </div>
          </article>
        `).join("") : `<div class="empty">Nenhuma solicitação registrada ainda.</div>`;
      }

      const experienceResponses = getExperienceResponses().slice().reverse();
      if (experienceResponsesBox) {
        experienceResponsesBox.innerHTML = experienceResponses.length ? experienceResponses.map(item => `
          <article class="item">
            <div class="meta">
              <span class="badge">${escapeHtml(item.type)}</span>
              <time>${formatDate(item.createdAt)}</time>
            </div>
            <div><b>${escapeHtml(item.employeeName)}</b>${item.employeeRole ? ` • ${escapeHtml(item.employeeRole)}` : ""}</div>
            ${item.employeeSector ? `<div class="meta"><span>Setor: ${escapeHtml(item.employeeSector)}</span></div>` : ""}
            <p class="comment"><b>Adaptação:</b> ${escapeHtml(item.adaptationScore)} • <b>Treinamento:</b> ${escapeHtml(item.trainingScore)} • <b>Relacionamento:</b> ${escapeHtml(item.relationshipScore)} • <b>Continuidade:</b> ${escapeHtml(item.continueIntent)}</p>
            ${item.comment ? `<p class="comment">${escapeHtml(item.comment)}</p>` : ""}
            <div class="item-actions"><button class="btn btn-danger btn-small" type="button" data-delete-experience-id="${item.id}">Excluir</button></div>
          </article>
        `).join("") : `<div class="empty">Nenhuma avaliação de experiência registrada ainda.</div>`;
      }
    }

    function escapeHtml(value) {
      return value.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char]));
    }

    function toCsvValue(value) {
      return `"${String(value ?? "").replaceAll('"', '""')}"`;
    }

    function isAdmin() {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
    }

    function setAdmin(value) {
      if (value) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      } else {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }
      document.body.dataset.admin = String(value);
    }

    function renderFactors() {
      const factors = getSettings().factors;
      factorsList.innerHTML = factors.map(factor => `
        <label class="chip"><input type="checkbox" name="factor" value="${escapeHtml(factor)}">${escapeHtml(factor)}</label>
      `).join("");
      factorSettings.value = factors.join("\n");
    }

    function renderEditFactors(selected = []) {
      editFactorsList.innerHTML = getSettings().factors.map(factor => `
        <label class="chip">
          <input type="checkbox" name="editFactor" value="${escapeHtml(factor)}" ${selected.includes(factor) ? "checked" : ""}>
          ${escapeHtml(factor)}
        </label>
      `).join("");
    }

    function localDateInputValue(value) {
      const date = new Date(value);
      const offset = date.getTimezoneOffset();
      const local = new Date(date.getTime() - offset * 60000);
      return local.toISOString().slice(0, 16);
    }

    function dateInputToIso(value) {
      return value ? new Date(value).toISOString() : new Date().toISOString();
    }

    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(form);
      const mood = data.get("mood");
      if (!mood) {
        showToast("Escolha uma opção do termômetro.");
        return;
      }

      const response = {
        id: createId(),
        mood,
        label: labels[mood],
        factors: data.getAll("factor"),
        comment: data.get("comment").trim(),
        createdAt: new Date().toISOString()
      };

      const responses = getResponses();
      responses.push(response);
      saveResponses(responses);
      fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "termometro", nome: "Anônimo", setor: "", humor: labels[mood], energia: mood, observacao: response.comment }) }).catch(console.warn);
      form.reset();
      render();
      showToast("Resposta anônima registrada.");
    });

    coffeeForm.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(coffeeForm);
      const request = {
        id: createId(),
        name: data.get("coffeeName").trim(),
        sector: data.get("coffeeSector").trim(),
        contact: data.get("coffeeContact").trim(),
        reason: data.get("coffeeReason").trim(),
        urgency: data.get("coffeeUrgency") || "Normal",
        createdAt: new Date().toISOString()
      };

      if (!request.name || !request.reason) {
        showToast("Informe nome e motivo da solicitação.");
        return;
      }

      const requests = getCoffeeRequests();
      requests.push(request);
      saveCoffeeRequests(requests);
      fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "cafeRH", nome: request.name, setor: request.sector, motivo: request.reason, contato: request.contact, urgencia: request.urgency }) }).catch(console.warn);
      coffeeForm.reset();
      render();
      showToast("Solicitação enviada ao RH.");
    });

    if (experienceForm) {
      experienceForm.addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(experienceForm);
        const item = {
          id: createId(),
          type: data.get("experienceType") || "45 dias",
          employeeName: data.get("employeeName").trim(),
          employeeRole: data.get("employeeRole").trim(),
          employeeSector: data.get("employeeSector").trim(),
          admissionDate: data.get("admissionDate") || "",
          adaptationScore: data.get("adaptationScore") || "",
          trainingScore: data.get("trainingScore") || "",
          relationshipScore: data.get("relationshipScore") || "",
          continueIntent: data.get("continueIntent") || "",
          comment: data.get("experienceComment").trim(),
          createdAt: new Date().toISOString()
        };
        if (!item.employeeName || !item.adaptationScore || !item.trainingScore || !item.relationshipScore || !item.continueIntent) {
          showToast("Preencha os campos obrigatórios da avaliação.");
          return;
        }
        const items = getExperienceResponses();
        items.push(item);
        saveExperienceResponses(items);
        experienceForm.reset();
        render();
        showToast("Avaliação enviada ao RH.");
      });
    }

    document.querySelector("#unlockExperience45")?.addEventListener("click", () => {
      const code = document.querySelector("#experienceAccessCode").value.trim().toUpperCase();
      if (code === "CMIVET45") unlockExperience("45"); else showToast("Código de acesso inválido para 45 dias.");
    });

    document.querySelector("#unlockExperience90")?.addEventListener("click", () => {
      const code = document.querySelector("#experienceAccessCode").value.trim().toUpperCase();
      if (code === "CMIVET90") unlockExperience("90"); else showToast("Código de acesso inválido para 90 dias.");
    });

    adminLogin.addEventListener("submit", event => {
      event.preventDefault();
      if (adminPin.value === getSettings().adminPin) {
        setAdmin(true);
        adminPin.value = "";
        render();
        showToast("Acesso de administrador liberado.");
      } else {
        showToast("PIN incorreto.");
      }
    });


    document.querySelector("#resetPasswordBtn").addEventListener("click", () => {
      const settingsPanel = document.querySelector("#settingsForm");
      if (settingsPanel) {
        settingsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => newAdminPin.focus(), 350);
        showToast("Digite a nova senha e confirme para redefinir.");
      }
    });

    document.querySelector("#adminLogout").addEventListener("click", () => {
      setAdmin(false);
      showToast("Administrador saiu.");
    });
    document.querySelector("#exportCsv").addEventListener("click", () => {
      const responses = getResponses();
      if (!responses.length) {
        showToast("Ainda não há respostas para exportar.");
        return;
      }

      const header = ["data_hora", "nivel", "sentimento", "fatores", "comentario"];
      const lines = responses.map(item => [
        formatDate(item.createdAt),
        item.mood,
        item.label,
        item.factors.join("; "),
        item.comment
      ].map(toCsvValue).join(","));

      const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `termometro-emocional-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("Arquivo CSV gerado.");
    });

    document.querySelector("#exportCoffeeCsv").addEventListener("click", () => {
      const requests = getCoffeeRequests();
      if (!requests.length) {
        showToast("Ainda não há solicitações para exportar.");
        return;
      }
      const header = ["data_hora", "nome", "setor", "contato", "prioridade", "motivo"];
      const lines = requests.map(item => [
        formatDate(item.createdAt),
        item.name,
        item.sector,
        item.contact,
        item.urgency,
        item.reason
      ].map(toCsvValue).join(","));
      const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cafe-com-rh-1-1-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("Arquivo CSV de solicitações gerado.");
    });

    document.querySelector("#exportExperienceCsv")?.addEventListener("click", () => {
      const items = getExperienceResponses();
      if (!items.length) { showToast("Ainda não há avaliações para exportar."); return; }
      const header = ["data_hora", "tipo", "nome", "cargo", "setor", "admissao", "adaptacao", "treinamento", "relacionamento", "continuidade", "comentario"];
      const lines = items.map(item => [
        formatDate(item.createdAt), item.type, item.employeeName, item.employeeRole, item.employeeSector, item.admissionDate,
        item.adaptationScore, item.trainingScore, item.relationshipScore, item.continueIntent, item.comment
      ].map(toCsvValue).join(","));
      const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `avaliacoes-experiencia-cmivet-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("Arquivo CSV de avaliações gerado.");
    });

    async function copyText(value) {
      try { await navigator.clipboard.writeText(value); showToast("Link copiado."); }
      catch { prompt("Copie o link:", value); }
    }
    document.querySelector("#copyLink45")?.addEventListener("click", () => copyText(makeRestrictedLink("45")));
    document.querySelector("#copyLink90")?.addEventListener("click", () => copyText(makeRestrictedLink("90")));

    if (experienceResponsesBox) {
      experienceResponsesBox.addEventListener("click", event => {
        const btn = event.target.closest("[data-delete-experience-id]");
        if (!btn) return;
        if (confirm("Excluir esta avaliação de experiência?")) {
          saveExperienceResponses(getExperienceResponses().filter(item => item.id !== btn.dataset.deleteExperienceId));
          render();
          showToast("Avaliação excluída.");
        }
      });
    }

    document.querySelector("#clearData").addEventListener("click", () => {
      if (!getResponses().length) {
        showToast("Não há dados para apagar.");
        return;
      }

      if (confirm("Excluir todos os registros armazenados? Esta ação deve ser feita somente pelo administrador e não poderá ser desfeita.")) {
        saveResponses([]);
        render();
        showToast("Respostas apagadas.");
      }
    });

    settingsForm.addEventListener("submit", event => {
      event.preventDefault();
      const current = getSettings();
      const factors = factorSettings.value
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(Boolean);

      if (!factors.length) {
        showToast("Informe pelo menos um fator.");
        return;
      }

      if (newAdminPin.value || confirmAdminPin.value) {
        if (newAdminPin.value.length < 4) {
          showToast("Use um PIN com pelo menos 4 caracteres.");
          return;
        }
        if (newAdminPin.value !== confirmAdminPin.value) {
          showToast("A confirmação do PIN não confere.");
          return;
        }
        current.adminPin = newAdminPin.value;
      }

      current.factors = [...new Set(factors)];
      saveSettings(current);
      newAdminPin.value = "";
      confirmAdminPin.value = "";
      renderFactors();
      render();
      showToast("Configurações salvas.");
    });

    document.querySelector("#restoreFactors").addEventListener("click", () => {
      factorSettings.value = DEFAULT_FACTORS.join("\n");
    });

    responsesBox.addEventListener("click", event => {
      const editButton = event.target.closest("[data-edit-id]");
      const deleteButton = event.target.closest("[data-delete-id]");

      if (editButton) {
        openEditDialog(editButton.dataset.editId);
      }

      if (deleteButton) {
        deleteResponse(deleteButton.dataset.deleteId);
      }
    });

    if (coffeeRequestsBox) {
      coffeeRequestsBox.addEventListener("click", event => {
        const deleteButton = event.target.closest("[data-delete-coffee-id]");
        if (!deleteButton) return;
        const id = deleteButton.dataset.deleteCoffeeId;
        if (confirm("Excluir esta solicitação de Café com o RH?")) {
          saveCoffeeRequests(getCoffeeRequests().filter(item => item.id !== id));
          render();
          showToast("Solicitação excluída.");
        }
      });
    }

    function openEditDialog(id) {
      const response = getResponses().find(item => item.id === id);
      if (!response) return;

      editId.value = response.id;
      editMood.value = response.mood;
      editDate.value = localDateInputValue(response.createdAt);
      editComment.value = response.comment;
      renderEditFactors(response.factors);
      editDialog.showModal();
    }

    function deleteResponse(id) {
      const responses = getResponses();
      const response = responses.find(item => item.id === id);
      if (!response) return;

      if (confirm("Excluir esta resposta?")) {
        saveResponses(responses.filter(item => item.id !== id));
        if (editDialog.open) editDialog.close();
        render();
        showToast("Resposta excluída.");
      }
    }

    editForm.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(editForm);
      const responses = getResponses();
      const index = responses.findIndex(item => item.id === editId.value);
      if (index < 0) return;

      responses[index] = {
        ...responses[index],
        mood: editMood.value,
        label: labels[editMood.value],
        factors: data.getAll("editFactor"),
        comment: editComment.value.trim(),
        createdAt: dateInputToIso(editDate.value)
      };
      saveResponses(responses);
      editDialog.close();
      render();
      showToast("Resposta atualizada.");
    });

    document.querySelector("#closeEdit").addEventListener("click", () => editDialog.close());
    document.querySelector("#deleteFromEdit").addEventListener("click", () => deleteResponse(editId.value));

    document.querySelectorAll("[data-view-button]").forEach(button => {
      button.addEventListener("click", () => {
        const view = button.dataset.viewButton;
        document.body.dataset.view = view;
        document.querySelectorAll("[data-view-button]").forEach(item => {
          item.setAttribute("aria-selected", String(item === button));
        });
      });
    });

    setAdmin(isAdmin());
    renderFactors();
    applyExperienceAccessFromUrl();
    render();
  
