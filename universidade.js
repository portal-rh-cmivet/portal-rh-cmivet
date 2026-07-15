const PROGRESS_KEY = "cmivet-universidade-progresso";

let trails = [];
let courses = [];

const toast = document.querySelector("#toast");
const dialog = document.querySelector("#courseDialog");

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(()=>toast.classList.remove("show"),2600);
}

function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
}

function getProgress(){
  try{return JSON.parse(localStorage.getItem(PROGRESS_KEY))||{}}
  catch{return{}}
}
function saveProgress(data){localStorage.setItem(PROGRESS_KEY,JSON.stringify(data))}

function courseStatus(id){
  const p=getProgress()[id];
  if(!p)return"not-started";
  if(p.completed)return"completed";
  return"started";
}

function trailCard(item){
  const trailCourses=courses.filter(c=>c.trailId===item.id);
  const completed=trailCourses.filter(c=>courseStatus(c.id)==="completed").length;
  const pct=trailCourses.length?Math.round(completed/trailCourses.length*100):0;
  return `
    <article class="trail-card">
      <span>${escapeHtml(item.icon)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="progress"><span style="width:${pct}%"></span></div>
      <div class="trail-meta"><span>${pct}% concluído</span><span>${trailCourses.length} cursos</span></div>
    </article>`;
}

function courseCard(item){
  const status=courseStatus(item.id);
  const labels={"not-started":"Não iniciado","started":"Em andamento","completed":"Concluído"};
  return `
    <article class="course-card">
      <div class="course-meta">
        <span class="badge">${escapeHtml(item.trail)}</span>
        <span class="badge">${escapeHtml(item.duration)}</span>
        <span class="badge">${labels[status]}</span>
      </div>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.description)}</p>
      <div class="course-actions">
        <button class="btn primary" data-open-course="${escapeHtml(item.id)}">Abrir curso</button>
      </div>
    </article>`;
}

function renderHome(){
  document.querySelector("#metricCourses").textContent=courses.length;
  document.querySelector("#metricTrails").textContent=trails.length;
  const completed=courses.filter(c=>courseStatus(c.id)==="completed").length;
  document.querySelector("#metricCompleted").textContent=completed;
  document.querySelector("#metricCertificates").textContent=completed;

  document.querySelector("#featuredTrails").innerHTML=trails.slice(0,4).map(trailCard).join("");

  const started=courses.filter(c=>courseStatus(c.id)==="started").length;
  const pending=courses.length-completed;
  const pct=courses.length?Math.round(completed/courses.length*100):0;
  document.querySelector("#progressPercent").textContent=`${pct}%`;
  document.querySelector("#progressRing").style.background=`conic-gradient(var(--green) ${pct}%,#ece8dc ${pct}%)`;
  document.querySelector("#summaryStarted").textContent=started;
  document.querySelector("#summaryCompleted").textContent=completed;
  document.querySelector("#summaryPending").textContent=pending;
}

function renderTrails(){
  document.querySelector("#trailGrid").innerHTML=trails.map(trailCard).join("");
}

function renderCourses(){
  const search=document.querySelector("#courseSearch").value.trim().toLowerCase();
  const trail=document.querySelector("#trailFilter").value;
  const status=document.querySelector("#statusFilter").value;
  const list=courses.filter(item=>{
    const searchable=`${item.title} ${item.description} ${item.trail}`.toLowerCase();
    return(!search||searchable.includes(search))&&(!trail||item.trailId===trail)&&(!status||courseStatus(item.id)===status);
  });
  document.querySelector("#courseGrid").innerHTML=list.length?list.map(courseCard).join(""):`<div class="empty">Nenhum curso encontrado.</div>`;
  bindCourseButtons();
}

function renderProgress(){
  const progress=getProgress();
  const list=courses.filter(c=>progress[c.id]);
  document.querySelector("#progressGrid").innerHTML=list.length?list.map(item=>{
    const p=progress[item.id];
    const pct=p.completed?100:Math.max(10,Number(p.progress)||25);
    return `<article class="progress-card">
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.trail)} • ${escapeHtml(item.duration)}</p>
      <div class="progress"><span style="width:${pct}%"></span></div>
      <div class="trail-meta"><span>${pct}%</span><span>${p.completed?"Concluído":"Em andamento"}</span></div>
    </article>`;
  }).join(""):`<div class="empty">Nenhum curso iniciado ainda.</div>`;
}

function renderCertificates(){
  const completed=courses.filter(c=>courseStatus(c.id)==="completed");
  document.querySelector("#certificateGrid").innerHTML=completed.length?completed.map(item=>`
    <article class="certificate-card">
      <div class="seal">🏆</div>
      <h4>Certificado de conclusão</h4>
      <p><strong>${escapeHtml(item.title)}</strong></p>
      <p>Carga horária: ${escapeHtml(item.duration)}</p>
      <button class="btn secondary" type="button" data-certificate="${escapeHtml(item.id)}">Visualizar certificado</button>
    </article>`).join(""):`<div class="empty">Conclua um curso para liberar certificados.</div>`;
  document.querySelectorAll("[data-certificate]").forEach(btn=>btn.addEventListener("click",()=>showToast("Modelo de certificado será gerado na próxima integração.")));
}

function bindCourseButtons(){
  document.querySelectorAll("[data-open-course]").forEach(button=>{
    button.addEventListener("click",()=>openCourse(button.dataset.openCourse));
  });
}

function openCourse(id){
  const course=courses.find(c=>c.id===id);
  if(!course)return;
  const status=courseStatus(id);
  document.querySelector("#courseDialogContent").innerHTML=`
    <span class="tag">${escapeHtml(course.trail)}</span>
    <h2>${escapeHtml(course.title)}</h2>
    <p>${escapeHtml(course.description)}</p>
    <div class="course-meta">
      <span class="badge">⏱ ${escapeHtml(course.duration)}</span>
      <span class="badge">👤 ${escapeHtml(course.instructor)}</span>
    </div>
    <div class="lesson-list">
      ${course.lessons.map((lesson,index)=>`<div class="lesson"><span>${index+1}. ${escapeHtml(lesson)}</span><span>○</span></div>`).join("")}
    </div>
    <div class="course-actions">
      <button class="btn primary" id="startCourse">${status==="completed"?"Revisar curso":status==="started"?"Continuar curso":"Iniciar curso"}</button>
      <button class="btn secondary" id="completeCourse">Marcar como concluído</button>
    </div>`;
  dialog.showModal();

  document.querySelector("#startCourse").addEventListener("click",()=>{
    const progress=getProgress();
    progress[id]={...(progress[id]||{}),progress:50,completed:false,startedAt:new Date().toISOString()};
    saveProgress(progress);
    showToast("Curso iniciado.");
    refreshAll();
    dialog.close();
  });
  document.querySelector("#completeCourse").addEventListener("click",()=>{
    const progress=getProgress();
    progress[id]={...(progress[id]||{}),progress:100,completed:true,completedAt:new Date().toISOString()};
    saveProgress(progress);
    showToast("Curso concluído. Certificado liberado.");
    refreshAll();
    dialog.close();
  });
}

function refreshAll(){
  renderHome();renderTrails();renderCourses();renderProgress();renderCertificates();
}

function openView(view){
  document.querySelectorAll(".page-section").forEach(section=>section.classList.toggle("active",section.id===view));
  document.querySelectorAll(".menu-item").forEach(button=>button.classList.toggle("active",button.dataset.view===view));
  const titles={inicio:"Universidade CMIVET",trilhas:"Trilhas de aprendizagem",cursos:"Cursos",progresso:"Meu progresso",certificados:"Certificados"};
  document.querySelector("#pageTitle").textContent=titles[view]||"Universidade CMIVET";
  document.querySelector("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
  if(view==="progresso")renderProgress();
  if(view==="certificados")renderCertificates();
}

async function loadData(){
  try{
    const response=await fetch(`universidade.json?t=${Date.now()}`,{cache:"no-store"});
    if(!response.ok)throw new Error(`Erro HTTP ${response.status}`);
    const data=await response.json();
    trails=Array.isArray(data.trails)?data.trails:[];
    courses=Array.isArray(data.courses)?data.courses:[];
    document.querySelector("#trailFilter").innerHTML=`<option value="">Todas as trilhas</option>`+trails.map(t=>`<option value="${escapeHtml(t.id)}">${escapeHtml(t.title)}</option>`).join("");
    refreshAll();
    document.querySelector("#status").textContent=`${courses.length} cursos disponíveis`;
    document.querySelector("#status").className="status online";
  }catch(error){
    console.error(error);
    document.querySelector("#status").textContent="Conteúdo indisponível";
  }
}

document.querySelectorAll(".menu-item").forEach(btn=>btn.addEventListener("click",()=>openView(btn.dataset.view)));
document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>openView(btn.dataset.go)));
document.querySelector("#mobileMenu").addEventListener("click",()=>document.querySelector("#sidebar").classList.toggle("open"));
document.querySelector("#courseSearch").addEventListener("input",renderCourses);
document.querySelector("#trailFilter").addEventListener("change",renderCourses);
document.querySelector("#statusFilter").addEventListener("change",renderCourses);
document.querySelector("#closeDialog").addEventListener("click",()=>dialog.close());

loadData();
