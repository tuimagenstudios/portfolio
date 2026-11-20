const editing = new URLSearchParams(location.search).has("editar");
const form = document.getElementById("planForm");
const list = document.getElementById("plans");
const storageKey = "energym.planes.demo.v1";
let selected = null;
function readPlans(){
  const stored = localStorage.getItem(storageKey);
  if (stored) return JSON.parse(stored);
  const legacy = readAgenda().precio;
  return legacy ? [{id:"mensual", nombre:"Plan mensual", precio:Number(legacy.replace(/\./g,"").replace(",","."))}] : [];
}
function renderPlans(){
  list.replaceChildren();
  const plans = readPlans();
  if (!plans.length) list.textContent = editing ? "Cargá el primer plan del gimnasio." : "Próximamente vas a encontrar acá los planes del gimnasio.";
  for (const plan of plans){
    const row = document.createElement("div");
    row.className = "actions";
    const label = document.createElement("strong");
    label.textContent = plan.nombre+" · "+Number(plan.precio).toLocaleString("es-AR",{style:"currency",currency:"ARS"});
    row.append(label);
    if(editing){
      const edit = document.createElement("button");
      edit.textContent="Editar";
      edit.onclick=()=>{
        selected=plan.id;
        form.elements.nombre.value=plan.nombre;
        form.elements.precio.value=plan.precio;
        form.elements.precio.focus();
      };
      row.append(edit);
    }
    list.append(row);
  }
}
form.hidden=!editing;
form.onsubmit=event=>{
  event.preventDefault();
  if(!editing) return;
  const plans=readPlans();
  const id=selected || crypto.randomUUID();
  const item={id,nombre:form.elements.nombre.value.trim(),precio:form.elements.precio.valueAsNumber};
  if(!item.nombre) return;
  const index=plans.findIndex(plan=>plan.id===id);
  if(index<0) plans.push(item);
  else plans[index]=item;
  localStorage.setItem(storageKey,JSON.stringify(plans));
  form.reset();
  selected=null;
  renderPlans();
  document.getElementById("feedback").textContent="Plan guardado.";
};
window.addEventListener("storage",renderPlans);
window.addEventListener("pageshow",renderPlans);
renderPlans();
