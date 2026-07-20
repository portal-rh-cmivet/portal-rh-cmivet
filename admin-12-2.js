const API_URL="https://script.google.com/macros/s/AKfycbz7dmmQpgyCucCbCFlsXmzp3gf_A_eBUdlkrgx5Ysik5729_U9vsswW3gSfQtGDaFuj/exec";
const token=sessionStorage.getItem("cmivet_token");
let user={};
let users=[];
let currentStep=1;

try{user=JSON.parse(sessionStorage.getItem("cmivet_user")||"{}")}catch{}
if(!token||user.perfil!=="admin")location.href="login.html";

async function post(payload){
  const response=await fetch(API_URL,{
    method:"POST",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify({...payload,token})
  });
  return response.json();
}

function initials(name=""){
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toUpperCase()||"--";
}

function profileLabel(profile){
  return {
    colaborador:"Colaborador",
    gestor:"Gestor",
    diretoria:"Diretoria",
    admin:"Administrador RH"
  }[profile]||profile;
}

function setStep(step){
  currentStep=step;
  document.querySelectorAll("[data-step-panel]").forEach(panel=>{
    panel.classList.toggle("active",Number(panel.dataset.stepPanel)===step);
  });
  document.querySelectorAll("[data-step]").forEach(button=>{
    button.classList.toggle("active",Number(button.dataset.step)===step);
  });
  document.querySelector("#prevStep").hidden=step===1;
  document.querySelector("#nextStep").hidden=step===3;
  document.querySelector("#saveUser").hidden=step!==3;
}

function validateCurrentStep(){
  const panel=document.querySelector(`[data-step-panel="${currentStep}"]`);
  const required=[...panel.querySelectorAll("[required]")];
  for(const field of required){
    if(!field.checkValidity()){
      field.reportValidity();
      return false;
    }
  }
  return true;
}

document.querySelector("#nextStep").addEventListener("click",()=>{
  if(validateCurrentStep())setStep(Math.min(3,currentStep+1));
});
document.querySelector("#prevStep").addEventListener("click",()=>setStep(Math.max(1,currentStep-1)));
document.querySelectorAll("[data-step]").forEach(button=>{
  button.addEventListener("click",()=>{
    const target=Number(button.dataset.step);
    if(target<currentStep||validateCurrentStep())setStep(target);
  });
});

function updateMetrics(){
  document.querySelector("#metricTotalUsers").textContent=users.length;
  document.querySelector("#metricActiveUsers").textContent=users.filter(item=>String(item.ativo).toLowerCase()==="sim").length;
  document.querySelector("#metricBlockedUsers").textContent=users.filter(item=>String(item.ativo).toLowerCase()!=="sim").length;
  document.querySelector("#metricAdmins").textContent=users.filter(item=>item.perfil==="admin").length;
}

function renderUsers(){
  const search=document.querySelector("#userSearch").value.trim().toLowerCase();
  const profile=document.querySelector("#profileFilter").value;
  const status=document.querySelector("#statusFilter").value;

  const filtered=users.filter(item=>{
    const text=`${item.nome||""} ${item.email||""} ${item.cargo||""} ${item.setor||""}`.toLowerCase();
    return (!search||text.includes(search))&&(!profile||item.perfil===profile)&&(!status||String(item.ativo).toLowerCase()===status);
  });

  const box=document.querySelector("#usersList");

  if(!filtered.length){
    box.innerHTML=`<div class="empty">Nenhum usuário encontrado.</div>`;
    return;
  }

  box.innerHTML=filtered.map(item=>{
    const active=String(item.ativo).toLowerCase()==="sim";
    return `
      <article class="enterprise-user-card">
        <div class="user-card-top">
          <div class="user-avatar">${initials(item.nome)}</div>
          <div>
            <h3>${item.nome||"Sem nome"}</h3>
            <p>${item.cargo||"Cargo não informado"} • ${item.setor||"Setor não informado"}</p>
          </div>
        </div>
        <div class="user-badges">
          <span class="user-badge">${profileLabel(item.perfil)}</span>
          <span class="user-badge ${active?"active":"blocked"}">${active?"● Ativo":"● Bloqueado"}</span>
        </div>
        <div class="user-card-actions">
          <button class="${active?"danger":"success"}" data-status="${item.id}:${active?"não":"sim"}">${active?"Bloquear":"Ativar"}</button>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-status]").forEach(button=>{
    button.addEventListener("click",async()=>{
      const [usuario_id,ativo]=button.dataset.status.split(":");
      button.disabled=true;
      const result=await post({action:"alterarStatusUsuario",usuario_id,ativo});
      if(result.sucesso)await loadUsers();
      else alert(result.erro||"Não foi possível alterar o usuário.");
    });
  });
}

async function loadUsers(){
  const box=document.querySelector("#usersList");
  box.innerHTML=`<div class="empty">Carregando usuários...</div>`;

  const result=await post({action:"listarUsuarios"});

  if(!result.sucesso){
    if(result.codigo==="SESSAO_INVALIDA")location.href="login.html";
    box.innerHTML=`<div class="empty">${result.erro||"Não foi possível carregar."}</div>`;
    return;
  }

  users=result.usuarios||[];
  updateMetrics();
  renderUsers();
}

document.querySelector("#userSearch").addEventListener("input",renderUsers);
document.querySelector("#profileFilter").addEventListener("change",renderUsers);
document.querySelector("#statusFilter").addEventListener("change",renderUsers);
document.querySelector("#refreshUsers").addEventListener("click",loadUsers);
document.querySelector("#refreshUsersTop").addEventListener("click",loadUsers);

document.querySelector("#userForm").addEventListener("submit",async event=>{
  event.preventDefault();

  const form=event.currentTarget;
  const data=Object.fromEntries(new FormData(form).entries());
  const message=document.querySelector("#userMessage");

  message.className="form-message";
  message.textContent="";

  if(data.senha!==data.confirmar_senha){
    message.classList.add("error");
    message.textContent="As senhas informadas não coincidem.";
    return;
  }

  const button=document.querySelector("#saveUser");
  button.disabled=true;
  button.textContent="Cadastrando...";

  const result=await post({
    action:"criarUsuario",
    nome:data.nome,
    email:data.email,
    cargo:data.cargo,
    setor:data.setor,
    gestor:data.gestor,
    perfil:data.perfil,
    senha:data.senha
  });

  if(result.sucesso){
    message.classList.add("success");
    message.textContent="Usuário cadastrado com sucesso.";
    form.reset();
    setStep(1);
    await loadUsers();
  }else{
    message.classList.add("error");
    message.textContent=result.erro||"Não foi possível cadastrar.";
  }

  button.disabled=false;
  button.textContent="Cadastrar usuário";
});

function renderBars(id,data,labels){
  const max=Math.max(...Object.values(data),1);
  document.querySelector(id).innerHTML=Object.keys(labels).map(key=>`
    <div class="bar">
      <strong>${labels[key]}</strong>
      <div class="track"><div class="fill" style="width:${Math.round((data[key]||0)/max*100)}%"></div></div>
      <span>${data[key]||0}</span>
    </div>
  `).join("");
}

async function loadThermometer(){
  const result=await post({action:"resumoTermometro90"});
  if(!result.sucesso)return;

  document.querySelector("#todayResponses").textContent=result.hoje.total;
  document.querySelector("#todayAverage").textContent=Number(result.hoje.media||0).toFixed(1).replace(".",",");
  document.querySelector("#total90").textContent=result.resumo90.total_respostas;
  document.querySelector("#days90").textContent=result.resumo90.dias_com_dados;

  renderBars("#moodChart",result.hoje.humores,{"1":"Estressado","2":"Cansado","3":"Neutro","4":"Ótimo"});
  renderBars("#energyChart",result.hoje.energia,{"Baixa":"Baixa","Moderada":"Moderada","Alta":"Alta"});

  document.querySelector("#historyBody").innerHTML=(result.historico||[]).map(item=>`
    <tr>
      <td>${item.data}</td>
      <td>${item.total}</td>
      <td>${Number(item.media||0).toFixed(1).replace(".",",")}</td>
      <td>${item.humores["1"]||0}</td>
      <td>${item.humores["2"]||0}</td>
      <td>${item.humores["3"]||0}</td>
      <td>${item.humores["4"]||0}</td>
    </tr>
  `).join("");
}

document.querySelectorAll("[data-tab]").forEach(button=>{
  button.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(tab=>tab.classList.toggle("active",tab.id===button.dataset.tab));
    document.querySelectorAll("[data-tab]").forEach(item=>item.classList.toggle("active",item===button));
    document.querySelector("#adminTitle").textContent=button.dataset.tab==="users"?"Usuários e Acessos":"Dashboard do Termômetro";
    if(button.dataset.tab==="thermo")loadThermometer();
  });
});

document.querySelector("#logoutAdmin").addEventListener("click",()=>{
  sessionStorage.clear();
  location.href="index.html";
});

setStep(1);
loadUsers();
