const SPREADSHEET_ID = "1LzSTNrh9A3TE6t7W87hOktEAXLqGBIar40Tl_7nQeeU";
const SESSION_HOURS = 8;

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  if (action === "comunicados") return jsonResponse(getComunicados());
  return jsonResponse({ status: "online", sistema: "Portal RH CMIVET", mensagem: "API funcionando" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const action = data.action || "";
    if (action === "novoComunicado") return jsonResponse(novoComunicado(data));
    if (action === "termometro") return jsonResponse(salvarTermometro(data));
    if (action === "cafeRH") return jsonResponse(salvarCafeRH(data));
    if (action === "login") return jsonResponse(login(data));
    if (action === "criarUsuario") return jsonResponse(criarUsuario(data));
    if (action === "listarUsuarios") return jsonResponse(listarUsuarios(data));
    return jsonResponse({ sucesso:false, erro:"Ação não reconhecida" });
  } catch (error) {
    return jsonResponse({ sucesso:false, erro:error.message });
  }
}

function getSheet(name, headers) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length) sheet.appendRow(headers);
  }
  return sheet;
}

function hashPassword(password, salt) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + "|" + password, Utilities.Charset.UTF_8);
  return bytes.map(function(b){ const v=(b<0?b+256:b).toString(16); return v.length===1?"0"+v:v; }).join("");
}

function createToken() {
  return Utilities.getUuid() + Utilities.getUuid().replace(/-/g,"");
}

function login(data) {
  const sheet = getSheet("Usuarios", ["id","nome","email","cargo","setor","gestor","perfil","salt","senha_hash","ativo","criado_em"]);
  const rows = sheet.getDataRange().getValues();
  for (let i=1;i<rows.length;i++) {
    const row=rows[i];
    if (String(row[2]).toLowerCase()===String(data.email).toLowerCase() && String(row[9]).toLowerCase()==="sim") {
      if (hashPassword(String(data.senha||""), String(row[7])) !== String(row[8])) return {sucesso:false,erro:"E-mail ou senha inválidos"};
      const token=createToken();
      const sessions=getSheet("Sessoes",["token","usuario_id","perfil","expira_em","criado_em"]);
      const expires=new Date(Date.now()+SESSION_HOURS*60*60*1000);
      sessions.appendRow([token,row[0],row[6],expires,new Date()]);
      return {sucesso:true,token:token,nome:row[1],perfil:row[6]};
    }
  }
  return {sucesso:false,erro:"E-mail ou senha inválidos"};
}

function validateAdmin(token) {
  const sessions=getSheet("Sessoes",["token","usuario_id","perfil","expira_em","criado_em"]);
  const rows=sessions.getDataRange().getValues();
  for(let i=1;i<rows.length;i++){
    if(String(rows[i][0])===String(token) && new Date(rows[i][3]).getTime()>Date.now() && String(rows[i][2])==="admin") return true;
  }
  return false;
}

function criarUsuario(data) {
  if (!validateAdmin(data.token)) return {sucesso:false,codigo:"SESSAO_INVALIDA",erro:"Sessão administrativa inválida"};
  const sheet=getSheet("Usuarios",["id","nome","email","cargo","setor","gestor","perfil","salt","senha_hash","ativo","criado_em"]);
  const rows=sheet.getDataRange().getValues();
  for(let i=1;i<rows.length;i++) if(String(rows[i][2]).toLowerCase()===String(data.email).toLowerCase()) return {sucesso:false,erro:"E-mail já cadastrado"};
  const salt=Utilities.getUuid();
  sheet.appendRow([Utilities.getUuid(),data.nome||"",String(data.email||"").toLowerCase(),data.cargo||"",data.setor||"",data.gestor||"",data.perfil||"colaborador",salt,hashPassword(String(data.senha||""),salt),"sim",new Date()]);
  return {sucesso:true};
}

function listarUsuarios(data) {
  if (!validateAdmin(data.token)) return {sucesso:false,codigo:"SESSAO_INVALIDA",erro:"Sessão administrativa inválida"};
  const sheet=getSheet("Usuarios",["id","nome","email","cargo","setor","gestor","perfil","salt","senha_hash","ativo","criado_em"]);
  const rows=sheet.getDataRange().getValues();
  return {sucesso:true,usuarios:rows.slice(1).map(r=>({id:r[0],nome:r[1],email:r[2],cargo:r[3],setor:r[4],gestor:r[5],perfil:r[6],ativo:r[9]}))};
}

// Execute UMA VEZ no editor para criar o primeiro administrador.
function criarPrimeiroAdministrador() {
  const sheet=getSheet("Usuarios",["id","nome","email","cargo","setor","gestor","perfil","salt","senha_hash","ativo","criado_em"]);
  const email="rh@cmivet.com.br";
  const senha="TrocarSenha123!";
  const rows=sheet.getDataRange().getValues();
  for(let i=1;i<rows.length;i++) if(String(rows[i][2]).toLowerCase()===email) return;
  const salt=Utilities.getUuid();
  sheet.appendRow([Utilities.getUuid(),"Administrador RH",email,"Recursos Humanos","Administrativo","Diretoria","admin",salt,hashPassword(senha,salt),"sim",new Date()]);
  Logger.log("Administrador criado. E-mail: "+email+" | Senha inicial: "+senha);
}

function getComunicados() {
  const sheet=getSheet("Comunicados",["id","titulo","categoria","descricao","link_drive","tipo_arquivo","fixado","ativo"]);
  const rows=sheet.getDataRange().getValues(); if(rows.length<=1)return [];
  return rows.slice(1).filter(r=>String(r[7]).trim().toLowerCase()==="sim").map(r=>({id:r[0],titulo:r[1],categoria:r[2],descricao:r[3],link_drive:r[4],tipo_arquivo:r[5],fixado:r[6],ativo:r[7]}));
}

function novoComunicado(data) {
  const sheet=getSheet("Comunicados",["id","titulo","categoria","descricao","link_drive","tipo_arquivo","fixado","ativo"]);
  const id="COM-"+new Date().getTime();
  sheet.appendRow([id,data.titulo||"",data.categoria||"Comunicado Geral",data.descricao||"",data.link_drive||"",data.tipo_arquivo||"",data.fixado||"não","sim"]);
  return {sucesso:true,mensagem:"Comunicado publicado",id:id};
}

function salvarTermometro(data) {
  const sheet=getSheet("Termometro_Emocional",["data_hora","data_chave","nome","setor","humor","energia","observacao"]);
  sheet.appendRow([new Date(),data.data_chave||"",data.nome||"",data.setor||"",data.humor||"",data.energia||"",data.observacao||""]);
  return {sucesso:true,mensagem:"Termômetro registrado"};
}

function salvarCafeRH(data) {
  const sheet=getSheet("Cafe_RH_1_1",["data_hora","nome","setor","contato","motivo","urgencia","status"]);
  sheet.appendRow([new Date(),data.nome||"",data.setor||"",data.contato||"",data.motivo||"",data.urgencia||"Normal","Pendente"]);
  return {sucesso:true,mensagem:"Solicitação registrada"};
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
