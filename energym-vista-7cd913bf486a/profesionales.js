const clinicalForm=document.getElementById("clinical-form");
const areaSelect=document.getElementById("clinical-area");
const areaMeasures={
  "Ficha clínica":["Medición","Valor y unidad"],
  "Nutrición y bioimpedancia":["Peso (kg)","Masa grasa (%)","Masa muscular (kg)"],
  "Tratamientos especiales":["Objetivo del tratamiento","Etapa o sesión","Evolución"]
};
let clinicalContext="";
function clinicalRecords(name){
  return JSON.parse(localStorage.getItem("energym.profesionales.demo."+name)||"[]");
}
function clinicalTable(container,headers,rows,empty){
  container.replaceChildren();
  if(!rows.length){container.textContent=empty;return;}
  const wrap=document.createElement("div"), table=document.createElement("table");
  wrap.className="tablewrap";wrap.tabIndex=0;
  const head=table.createTHead().insertRow();
  for(const label of headers){
    const cell=document.createElement("th");cell.scope="col";cell.textContent=label;head.append(cell);
  }
  const body=table.createTBody();
  for(const values of rows){
    const row=body.insertRow();
    for(const value of values)row.insertCell().textContent=value||"—";
  }
  wrap.append(table);container.append(wrap);
}
function clinicalDate(date){return date?date.split("-").reverse().join("/"):"";}
function renderProfessional(role,name,intake){
  const isPro=role==="Profesionales", area=areaSelect.value;
  const records=clinicalRecords(name).reverse().sort((a,b)=>b.date.localeCompare(a.date));
  el("professional").hidden=!isPro;
  el("team-guidance").hidden=!["Profesor","Ramiro"].includes(role);
  const context=JSON.stringify([role,name,area]);
  if(context!==clinicalContext){
    clinicalContext=context;
    clinicalForm.reset();clinicalForm.elements.date.value=today();
    el("clinical-editor").open=false;
    el("clinical-measures").replaceChildren();
    for(const [i,label] of areaMeasures[area].entries()){
      const field=document.createElement("label"),input=document.createElement("input");
      field.textContent=label;input.name="measure"+i;input.maxLength=180;
      if(area==="Nutrición y bioimpedancia"){input.type="number";input.min="0";input.step="any";if(i===1)input.max="100";}
      field.append(input);el("clinical-measures").append(field);
    }
    el("clinical-topic").firstChild.textContent=area==="Tratamientos especiales"?"Tratamiento o programa":"Motivo del control";
  }
  el("professional-intake").innerHTML=isPro?fichaIngreso.summary(intake):"";
  if(isPro){
    clinicalTable(el("clinical-log"),["Fecha","Profesional","Motivo",...areaMeasures[area],"Apuntes","Próxima revisión","Compartido con el equipo"],
      records.filter(r=>r.area===area).map(r=>[clinicalDate(r.date),r.author,r.topic,...r.measures,r.notes,clinicalDate(r.next),r.shared]),"Todavía no hay registros en esta ficha.");
  }else el("clinical-log").replaceChildren();
  if(!el("team-guidance").hidden){
    clinicalTable(el("team-log"),["Fecha","Profesional","Indicación para la clase"],records.filter(r=>r.shared).map(r=>[clinicalDate(r.date),r.author,r.shared]),"Sin indicaciones compartidas para este alumno.");
  }else el("team-log").replaceChildren();
}
areaSelect.onchange=()=>render();
clinicalForm.onsubmit=event=>{
  event.preventDefault();
  const name=el("person").value,area=areaSelect.value,data=new FormData(clinicalForm);
  if(document.querySelector("input[name=role]:checked").value!=="Profesionales")return;
  const values=Object.fromEntries(data);
  const item={area,date:values.date,author:values.author.trim(),topic:values.topic.trim(),notes:values.notes.trim(),shared:values.shared.trim(),next:values.next,measures:areaMeasures[area].map((_,i)=>values["measure"+i].trim())};
  if(!item.author||!item.topic)return;
  localStorage.setItem("energym.profesionales.demo."+name,JSON.stringify([...clinicalRecords(name),item]));
  clinicalContext="";render();
  el("status").textContent="Registro guardado en la ficha de "+name+".";
};
