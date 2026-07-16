const API_URL="https://script.google.com/macros/s/AKfycbz7dmmQpgyCucCbCFlsXmzp3gf_A_eBUdlkrgx5Ysik5729_U9vsswW3gSfQtGDaFuj/exec";
let dashboardData={};

function escapeHtml(value=""){return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]))}

function setGreeting(){
  const now=new Date();const hour=now.getHours();
  const greeting=hour<12?"Bom dia":hour<18?"Boa tarde":"Boa noite";
  document.querySelector("#greetingTitle").textContent=`${greeting}, Mariah!`;
  document.querySelector("#currentDate").textContent=new Intl.DateTimeFormat("pt-BR",{dateStyle:"full"}).format(now);
}

function renderList(id,items,renderer){
  document.querySelector(id).innerHTML=items.length?items.map(renderer).join(""):`<div class="empty">Nenhum item disponível.</div>`;
}

function renderStatic(){
  const d=dashboardData;
  document.querySelector("#metricDocuments").textContent=d.documents?.length||0;
  document.querySelector("#metricCourses").textContent=d.courses?.total||0;
  document.querySelector("#metricEvaluations").textContent=d.evaluations?.pending||0;
  document.querySelector("#metricBirthdays").textContent=d.birthdays?.length||0;
  document.querySelector("#metricBenefits").textContent=d.benefits?.length||0;

  renderList("#notificationList",d.notifications||[],i=>`<article class="list-item"><div class="row"><h4>${escapeHtml(i.title)}</h4><span class="badge">${escapeHtml(i.type)}</span></div><p>${escapeHtml(i.description)}</p></article>`);
  renderList("#birthdayList",d.birthdays||[],i=>`<article class="list-item"><div class="row"><h4>${escapeHtml(i.name)}</h4><span class="badge">${escapeHtml(i.date)}</span></div><p>${escapeHtml(i.role)}</p></article>`);
  renderList("#agendaList",d.agenda||[],i=>`<article class="list-item"><div class="row"><h4>${escapeHtml(i.title)}</h4><span class="badge">${escapeHtml(i.date)}</span></div><p>${escapeHtml(i.type)}</p></article>`);
  document.querySelector("#benefitGrid").innerHTML=(d.benefits||[]).map(i=>`<article class="benefit"><span>${escapeHtml(i.icon)}</span><strong>${escapeHtml(i.title)}</strong></article>`).join("");
  renderList("#documentList",d.documents||[],i=>`<article class="list-item"><div class="row"><h4>${escapeHtml(i.title)}</h4><span class="badge">${escapeHtml(i.type)}</span></div><p>${escapeHtml(i.updatedAt)}</p></article>`);

  const c=d.courses||{total:0,completed:0,certificates:0};
  const pct=c.total?Math.round(c.completed/c.total*100):0;
  document.querySelector("#coursePercent").textContent=`${pct}%`;
  document.querySelector("#courseProgress").style.background=`conic-gradient(var(--green) ${pct}%,#ece8dc ${pct}%)`;
  document.querySelector("#courseCompleted").textContent=c.completed;
  document.querySelector("#coursePending").textContent=Math.max(0,c.total-c.completed);
  document.querySelector("#certificateCount").textContent=c.certificates;
}

async function loadAnnouncements(){
  try{
    const r=await fetch(`${API_URL}?action=comunicados&t=${Date.now()}`,{cache:"no-store"});
    const raw=await r.json();
    const list=(Array.isArray(raw)?raw:raw.comunicados||[]).filter(i=>String(i.ativo||"sim").toLowerCase()!=="não");
    document.querySelector("#metricAnnouncements").textContent=list.length;
    document.querySelector("#announcementGrid").innerHTML=list.length?list.slice(0,4).map(i=>`
      <article class="card"><div class="meta"><span class="badge">${escapeHtml(i.categoria||i.category||"Comunicado")}</span>${String(i.fixado||"").toLowerCase()==="sim"?'<span class="badge">📌 Fixado</span>':""}</div><h4>${escapeHtml(i.titulo||i.title||"Sem título")}</h4><p>${escapeHtml(i.descricao||i.description||"")}</p></article>`).join(""):`<div class="empty">Nenhum comunicado ativo.</div>`;
  }catch(e){
    console.error(e);
    document.querySelector("#announcementGrid").innerHTML=`<div class="empty">Não foi possível carregar os comunicados.</div>`;
  }
}

async function loadData(){
  const r=await fetch(`dashboard.json?t=${Date.now()}`,{cache:"no-store"});
  dashboardData=await r.json();
  renderStatic();
  loadAnnouncements();
}

document.querySelector("#mobileMenu").addEventListener("click",()=>document.querySelector("#sidebar").classList.toggle("open"));
setGreeting();
loadData();
