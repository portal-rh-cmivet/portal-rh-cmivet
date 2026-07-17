const API_URL="https://script.google.com/macros/s/AKfycbz7dmmQpgyCucCbCFlsXmzp3gf_A_eBUdlkrgx5Ysik5729_U9vsswW3gSfQtGDaFuj/exec";
const DAILY_KEY="cmivet-termometro-dia";
const overlay=document.querySelector("#mandatoryOverlay");
const form=document.querySelector("#dailyThermometerForm");

function todayKey(){return new Intl.DateTimeFormat("sv-SE",{timeZone:"America/Sao_Paulo"}).format(new Date())}
function alreadyAnswered(){return localStorage.getItem(DAILY_KEY)===todayKey()}
function showMandatory(){overlay.hidden=false;document.body.style.overflow="hidden"}
function releasePortal(){localStorage.setItem(DAILY_KEY,todayKey());overlay.hidden=true;document.body.style.overflow=""}
function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

async function post(payload){
  const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
  if(!r.ok)throw new Error(`Erro HTTP ${r.status}`);
  return r.json();
}
async function loadAnnouncements(){
  try{
    const r=await fetch(`${API_URL}?action=comunicados&t=${Date.now()}`,{cache:"no-store"});
    const raw=await r.json();const list=(Array.isArray(raw)?raw:raw.comunicados||[]).filter(i=>String(i.ativo||"sim").toLowerCase()!=="não");
    const html=list.length?list.map(i=>`<article class="card"><span class="badge">${escapeHtml(i.categoria||"Comunicado")}</span><h4>${escapeHtml(i.titulo||"Sem título")}</h4><p>${escapeHtml(i.descricao||"")}</p></article>`).join(""):`<div class="empty">Nenhum comunicado.</div>`;
    document.querySelector("#announcementList").innerHTML=html;
    document.querySelector("#homeAnnouncements").innerHTML=list.length?list.slice(0,3).map(i=>`<article class="card"><span class="badge">${escapeHtml(i.categoria||"Comunicado")}</span><h4>${escapeHtml(i.titulo||"Sem título")}</h4><p>${escapeHtml(i.descricao||"")}</p></article>`).join(""):`<div class="empty">Nenhum comunicado.</div>`;
  }catch(e){document.querySelector("#announcementList").innerHTML=`<div class="empty">Não foi possível carregar.</div>`}
}
form.addEventListener("submit",async e=>{
  e.preventDefault();const f=new FormData(form);const button=document.querySelector("#submitThermometer");const error=document.querySelector("#thermometerError");
  const payload={action:"termometro",nome:f.get("nome").trim(),setor:f.get("setor").trim(),humor:f.get("humor"),energia:f.get("energia"),observacao:f.get("observacao").trim(),data_chave:todayKey()};
  button.disabled=true;button.textContent="Enviando...";error.textContent="";
  try{
    const result=await post(payload);if(result.sucesso===false)throw new Error(result.erro||"Falha ao registrar");
    releasePortal();document.querySelector("#thermometerStatus").innerHTML=`<span class="status-ok">✅ Resposta de hoje registrada.</span>`;
  }catch(err){error.textContent="Não foi possível registrar. Verifique sua conexão e tente novamente."}
  finally{button.disabled=false;button.textContent="Enviar e acessar o Portal"}
});
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===b.dataset.view));
  document.querySelectorAll("[data-view]").forEach(x=>x.classList.toggle("active",x===b));
  document.querySelector("#pageTitle").textContent=b.textContent.trim().replace(/^[^ ]+ /,"");
}));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>document.querySelector(`[data-view="${b.dataset.go}"]`).click()));
document.querySelector("#thermometerStatus").innerHTML=alreadyAnswered()?`<span class="status-ok">✅ Resposta de hoje registrada.</span>`:`<span>Resposta de hoje pendente.</span>`;
if(!alreadyAnswered())showMandatory();
loadAnnouncements();
