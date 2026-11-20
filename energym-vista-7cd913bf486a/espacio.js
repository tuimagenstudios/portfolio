const el = id => document.getElementById(id);
const key = "energym.fichas.demo.v1";
const records = JSON.parse(localStorage.getItem(key) || "null") || [
  ["Martina López","2026-11-18","Elevaciones laterales",0.8,3,10],
  ["Martina López","2026-11-03","Elevaciones laterales",0.5,3,10],
  ["Tomás Díaz","2026-11-17","Prensa",40,3,12]
];
const noticeKey = "energym.avisos.demo.v1";
function notices(){return JSON.parse(localStorage.getItem(noticeKey)||"[]");}
function renderNotices(role,blocked){
  const owner=role==="Ramiro";
  const items=notices().filter(n=>owner||!n.readBy?.includes(role));
  el("avisos").hidden=!owner&&(blocked||!["Alumno","Profesor"].includes(role));
  el("notice-form").hidden=!owner;
  el("sound-toggle").hidden=owner;
  el("notice-heading").textContent=owner?"Avisos para mis alumnos":"Avisos del gimnasio";
  const list=el("notice-list");
  list.replaceChildren();
  if(el("avisos").hidden)return;
  if(!items.length)el("sound-status").textContent="";
  if(!items.length)list.textContent=owner?"Todavía no publicaste avisos.":"";
  for(const item of items){
    const article=document.createElement("article");
    const message=document.createElement("p");
    message.textContent=item.body;
    const button=document.createElement("button");
    button.textContent=owner?"Retirar aviso":"Marcar como leído";

    button.onclick=()=>{
      const updated=owner?notices().filter(n=>n.id!==item.id):notices().map(n=>n.id===item.id?{...n,readBy:[...new Set([...(n.readBy||[]),role])]}:n);
      localStorage.setItem(noticeKey,JSON.stringify(updated));
      render();
    };
    article.append(message,button);
    list.append(article);
  }
}
el("notice-form").onsubmit=event=>{
  event.preventDefault();
  const body=event.target.elements.body.value.trim();
  if(!body)return;
  localStorage.setItem(noticeKey,JSON.stringify([{id:crypto.randomUUID(),body,read:false},...notices()]));
  event.target.reset();
  render();
};
if(location.hash==="#avisos")document.querySelector("input[value=Ramiro]").checked=true;
function render() {
  const role = document.querySelector("input[name=role]:checked").value;
  const student = role === "Alumno";
  const name = student ? (sessionStorage.getItem("energym.demo.pupil")||"Martina López") : el("person").value;
  const active = localStorage.getItem("energym.acceso.demo."+name) !== "0";
  const blocked = student && !active;
  renderNotices(role,blocked);
  el("access-list").hidden = student;
  el("access-toggle").hidden = role !== "Ramiro";
  el("access-toggle").setAttribute("aria-checked",String(active));
  el("access-toggle").textContent = active ? "Acceso activo" : "Acceso pausado";
  el("paused").hidden = !blocked;
  el("journal").hidden = blocked || role==="Profesionales";
  el("code-demo").hidden=!student;
  el("new-code").hidden=role!=="Ramiro"||!active;
  el("issued-code").textContent=role==="Ramiro"&&active?(localStorage.getItem("energym.demo.code."+name)||""):"";
  el("billing").hidden = role !== "Ramiro";
  if (role === "Ramiro") renderPayments();
  const intake=JSON.parse(localStorage.getItem("energym.ingreso.demo."+name)||"{}");
  el("intake-summary").innerHTML="<h2>Ficha de ingreso</h2>"+fichaIngreso.summary(intake);
  renderProfessional(role,name,intake);
  el("controls").hidden = !student || blocked;
  el("settings").hidden = role !== "Ramiro";
  el("roster").hidden = el("entry").hidden = student;
  el("caption").textContent = student ? name : "Equipo Energym";
  el("title").textContent = student ? "Mi progreso." : role === "Ramiro" ? "Panel de Ramiro." : role==="Profesionales" ? "Profesionales." : "Mis alumnos.";
  el("subtitle").textContent = student ? "Historial de mis clases" : "Cuaderno de clases";
  const history = el("history");
  history.replaceChildren();
  for (const [,date,exercise,weight,sets,reps] of records.filter(r => r[0] === name).sort((a,b) => b[1].localeCompare(a[1]))) {
    const row = history.insertRow();
    for (const value of [date.split("-").reverse().join("/"),exercise,Number(weight).toLocaleString("es-AR")+" kg",sets+" × "+reps]) row.insertCell().textContent = value;
  }
}
for (const field of document.querySelectorAll("input[name=role], #person")) field.onchange = () => { el("status").textContent = ""; el("entry").open = false; render(); };
const admin = el("admin");
for (const [name,value] of Object.entries(readAgenda())) if (admin.elements[name]) admin.elements[name].value = value;
admin.onsubmit = event => {
  event.preventDefault();
  localStorage.setItem(agendaKey,JSON.stringify({...readAgenda(), ...Object.fromEntries(new FormData(admin))}));
  el("status").textContent = "Cambios guardados. Se actualizó la fecha de cierre.";
};
const form = el("record");
function today() { const now = new Date(); return new Date(now - now.getTimezoneOffset()*60000).toISOString().slice(0,10); }
form.elements.date.value = today();
form.onsubmit = event => {
  event.preventDefault();
  const data = new FormData(form);
  records.push([el("person").value,...["date","exercise","weight","sets","reps"].map(name => data.get(name))]);
  localStorage.setItem(key,JSON.stringify(records));
  form.reset(); form.elements.date.value = today(); render();
  el("status").textContent = "Ejercicio guardado en la ficha de "+el("person").value+".";
};
render();





const addedPupils = JSON.parse(localStorage.getItem("energym.alumnos.demo.v1") || "[]");
function appendPupil(name) {
  el("person").add(new Option(name,name));
  paymentForm.elements.pupil.add(new Option(name,name));
}
addedPupils.forEach(appendPupil);
el("add-pupil").onsubmit = event => {
  event.preventDefault();
  const input = event.target.elements.name;
  const name = input.value.trim();
  if (!name) return;
  if (Array.from(el("person").options).some(o=>o.value.toLowerCase()===name.toLowerCase())) {
    input.setCustomValidity("Ya existe una ficha con ese nombre en el boceto.");
    input.reportValidity();
    input.oninput=()=>input.setCustomValidity("");
    return;
  }
  localStorage.setItem("energym.ingreso.demo."+name,JSON.stringify(fichaIngreso.read(new FormData(event.target))));
  localStorage.setItem("energym.acceso.demo."+name,"0");
  addedPupils.push(name);
  localStorage.setItem("energym.alumnos.demo.v1",JSON.stringify(addedPupils));
  appendPupil(name);
  el("person").value=name;
  event.target.reset();
  render();
  el("journal").scrollIntoView();
};

el("intake-fields").innerHTML=fichaIngreso.fields();

el("access-toggle").onclick=()=>{
  const key="energym.acceso.demo."+el("person").value;
  const activate=localStorage.getItem(key)==="0";
  localStorage.setItem(key,activate?"1":"0");
  if(activate)issueDemoCode();else localStorage.removeItem("energym.demo.code."+el("person").value);
  render();
};





function issueDemoCode(){
  const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),b=>b.toString(16).padStart(2,"0")).join("").toUpperCase();
  localStorage.setItem("energym.demo.code."+el("person").value,code.match(/.{4}/g).join("-"));render();
}
el("new-code").onclick=issueDemoCode;
el("code-form").onsubmit=event=>{
  event.preventDefault();
  const input=event.target.elements.code.value.trim().toUpperCase().replace(/[-\s]/g,"");
  const pupil=Array.from(el("person").options,o=>o.value).find(n=>input&&(localStorage.getItem("energym.demo.code."+n)||"").replace(/-/g,"")===input&&localStorage.getItem("energym.acceso.demo."+n)!=="0");
  el("code-feedback").textContent=pupil?"Código aceptado para "+pupil+".":"Código inválido o ya utilizado.";
  if(pupil){sessionStorage.setItem("energym.demo.pupil",pupil);localStorage.removeItem("energym.demo.code."+pupil);event.target.reset();render();}
};
