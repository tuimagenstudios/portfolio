const editor = new URLSearchParams(location.search).has("editar");
const byId = id => document.getElementById(id);
const monday = new Date();
monday.setHours(12,0,0,0);
monday.setDate(monday.getDate() - (monday.getDay()+6)%7);
const dateKey = date => [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
const format = (date, options) => date.toLocaleDateString("es-AR", options);
byId("hint").textContent = editor ? "Edición de prueba · Tocá un horario para cambiar su estado: sin definir, libre u ocupado. Los cambios se guardan en este navegador." : "Consultá la disponibilidad por hora. Los turnos sin definir todavía no fueron publicados.";
function draw(){
  const table = byId("slots");
  table.replaceChildren();
  const heading = table.createTHead().insertRow();
  const days = [];
  function header(row, label, scope){
    const th = document.createElement("th");
    th.scope = scope;
    th.textContent = label;
    row.append(th);
  }
  header(heading,"Hora","col");
  for(let i=0;i<7;i++){
    const day = new Date(monday);
    day.setDate(day.getDate()+i);
    days.push(day);
    header(heading,format(day,{weekday:"short",day:"numeric",month:"numeric"}),"col");
  }
  byId("week").textContent = format(monday,{day:"numeric",month:"short"})+" – "+format(days[6],{day:"numeric",month:"short",year:"numeric"});
  const body = table.createTBody();
  const closed = readAgenda().cierre;
  const states = ["Sin definir","Libre","Ocupado"];
  for(let hour=7;hour<23;hour++){
    const row = body.insertRow();
    header(row,hour+":00–"+(hour+1)+":00","row");
    for(const day of days){
      const cell = row.insertCell();
      const date = dateKey(day);
      const key = "energym.turno."+date+"."+hour;
      const value = localStorage.getItem(key);
      const state = states.includes(value) ? value : states[0];
      cell.dataset.state = state;
      if(date===closed){cell.textContent="Cerrado";cell.dataset.state="Cerrado";continue;}
      if(!editor){cell.textContent=state;continue;}
      const button=document.createElement("button");
      button.textContent=state;
      button.setAttribute("aria-label",date+" "+hour+":00 · "+state);
      button.onclick=()=>{
        const next=states[(states.indexOf(state)+1)%states.length];
        localStorage.setItem(key,next);
        const rowIndex=row.rowIndex, colIndex=cell.cellIndex;
        draw();
        table.rows[rowIndex].cells[colIndex].firstChild.focus();
        byId("notice").textContent=date+" · "+hour+":00 · "+next;
      };
      cell.append(button);
    }
  }
}
function move(days){monday.setDate(monday.getDate()+days);draw();}
byId("prev").onclick=()=>move(-7);
byId("next").onclick=()=>move(7);
window.addEventListener("storage",draw);
window.addEventListener("pageshow",draw);
draw();
