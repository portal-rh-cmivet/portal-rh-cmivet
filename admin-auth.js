const API_URL="https://script.google.com/macros/s/AKfycbz7dmmQpgyCucCbCFlsXmzp3gf_A_eBUdlkrgx5Ysik5729_U9vsswW3gSfQtGDaFuj/exec";
document.querySelector("#loginForm").addEventListener("submit",async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget);const err=document.querySelector("#loginError");err.textContent="";
  try{
    const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"login",email:f.get("email").trim().toLowerCase(),senha:f.get("senha")})});
    const result=await r.json();if(!result.sucesso)throw new Error(result.erro||"Credenciais inválidas");
    sessionStorage.setItem("cmivet_admin_token",result.token);sessionStorage.setItem("cmivet_admin_nome",result.nome||"Administrador");location.href="usuarios.html";
  }catch(e){err.textContent=e.message||"Não foi possível entrar."}
});