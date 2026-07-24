const API_URL="https://script.google.com/macros/s/AKfycbz7dmmQpgyCucCbCFlsXmzp3gf_A_eBUdlkrgx5Ysik5729_U9vsswW3gSfQtGDaFuj/exec";
const token=sessionStorage.getItem("cmivet_token");
let user={};

try{
  user=JSON.parse(sessionStorage.getItem("cmivet_user")||"{}");
}catch{}

if(!token){
  location.href="index.html";
}

const overlay=document.querySelector("#thermometerOverlay");
const thermometerForm=document.querySelector("#thermometerForm");

function esc(value=""){
  return String(value).replace(/[&<>"']/g,char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));
}

function initials(name=""){
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(item=>item[0]).join("").toUpperCase()||"--";
}

async function post(payload){
  const response=await fetch(API_URL,{
    method:"POST",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify({...payload,token})
  });

  if(!response.ok){
    throw new Error(`Erro HTTP ${response.status}`);
  }

  return response.json();
}

function logout(){
  sessionStorage.clear();
  location.href="index.html";
}

document.querySelector("#logoutButton").addEventListener("click",logout);
document.querySelector("#mobileMenu").addEventListener("click",()=>document.querySelector("#sidebar").classList.toggle("open"));

document.querySelector("#userName").textContent=user.nome||"Colaborador";
document.querySelector("#userRole").textContent=user.cargo||user.perfil||"Colaborador";
document.querySelector("#avatar").textContent=initials(user.nome);
document.querySelector("#sidebarProfile").textContent=
  user.perfil==="admin"?"Administrador RH":
  user.perfil==="gestor"?"Painel do Gestor":
  user.perfil==="diretoria"?"Diretoria":
  "Portal do Colaborador";

if(user.perfil==="admin"){
  document.querySelector(".admin-area").hidden=false;
}

document.querySelector("#welcome").textContent=
  `Bem-vinda ao Portal RH, ${(user.nome||"").split(" ")[0]||""}!`;

async function validateSession(){
  const result=await post({action:"validarSessao"});

  if(!result.sucesso){
    logout();
  }
}

async function verifyDailyThermometer(){
  try{
    const result=await post({action:"verificarTermometroHoje"});

    if(!result.sucesso){
      if(result.codigo==="SESSAO_INVALIDA"){
        logout();
      }
      throw new Error(result.erro||"Erro ao verificar Termômetro.");
    }

    if(result.respondido){
      overlay.hidden=true;
      document.body.style.overflow="";
      document.querySelector("#thermometerStatus").innerHTML=
        `<span class="status-on">✅ Resposta de hoje registrada.</span>`;
      document.querySelector("#metricThermometer").textContent="Respondido";
    }else{
      overlay.hidden=false;
      document.body.style.overflow="hidden";
      document.querySelector("#thermometerStatus").textContent="Resposta de hoje pendente.";
      document.querySelector("#metricThermometer").textContent="Pendente";
    }
  }catch(error){
    overlay.hidden=false;
    document.body.style.overflow="hidden";
    document.querySelector("#thermometerMessage").textContent=
      "Não foi possível validar sua resposta diária. Tente novamente.";
  }
}

thermometerForm.addEventListener("submit",async event=>{
  event.preventDefault();

  const formData=new FormData(thermometerForm);
  const button=document.querySelector("#sendThermometer");
  const message=document.querySelector("#thermometerMessage");

  message.textContent="";
  button.disabled=true;
  button.textContent="Enviando...";

  try{
    const result=await post({
      action:"termometro",
      humor:formData.get("humor"),
      energia:formData.get("energia"),
      observacao:formData.get("observacao").trim()
    });

    if(!result.sucesso){
      throw new Error(result.erro||"Não foi possível registrar.");
    }

    overlay.hidden=true;
    document.body.style.overflow="";
    document.querySelector("#thermometerStatus").innerHTML=
      `<span class="status-on">✅ Resposta de hoje registrada.</span>`;
    document.querySelector("#metricThermometer").textContent="Respondido";
  }catch(error){
    message.textContent=error.message||"Não foi possível registrar.";
  }finally{
    button.disabled=false;
    button.textContent="Enviar e acessar o Portal";
  }
});

async function loadAnnouncements(){
  try{
    const response=await fetch(`${API_URL}?action=comunicados&t=${Date.now()}`,{cache:"no-store"});
    const raw=await response.json();

    const list=(Array.isArray(raw)?raw:raw.comunicados||[])
      .filter(item=>String(item.ativo||"sim").toLowerCase()!=="não");

    document.querySelector("#metricAnnouncements").textContent=list.length;

    const html=list.length
      ?list.map(item=>`
        <article class="card">
          <span class="badge">${esc(item.categoria||"Comunicado")}</span>
          <h4>${esc(item.titulo||"Sem título")}</h4>
          <p>${esc(item.descricao||"")}</p>
        </article>
      `).join("")
      :`<div class="empty">Nenhum comunicado.</div>`;

    document.querySelector("#announcementList").innerHTML=html;
    document.querySelector("#homeAnnouncements").innerHTML=list.length
      ?list.slice(0,4).map(item=>`
        <article class="card">
          <span class="badge">${esc(item.categoria||"Comunicado")}</span>
          <h4>${esc(item.titulo||"Sem título")}</h4>
          <p>${esc(item.descricao||"")}</p>
        </article>
      `).join("")
      :`<div class="empty">Nenhum comunicado.</div>`;
  }catch(error){
    document.querySelector("#homeAnnouncements").innerHTML=
      `<div class="empty">Não foi possível carregar os comunicados.</div>`;
  }
}

function openView(view){
  document.querySelectorAll(".view").forEach(section=>{
    section.classList.toggle("active",section.id===view);
  });

  document.querySelectorAll("[data-view]").forEach(button=>{
    button.classList.toggle("active",button.dataset.view===view);
  });

  const titles={
    dashboard:"Dashboard",
    comunicados:"Comunicados",
    termometro:"Termômetro Emocional",
    cafe:"Café com RH"
  };

  document.querySelector("#pageTitle").textContent=titles[view]||"Portal RH";
  document.querySelector("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll("[data-view]").forEach(button=>{
  button.addEventListener("click",()=>openView(button.dataset.view));
});

document.querySelectorAll("[data-go]").forEach(button=>{
  button.addEventListener("click",()=>openView(button.dataset.go));
});

validateSession();
verifyDailyThermometer();
loadAnnouncements();
