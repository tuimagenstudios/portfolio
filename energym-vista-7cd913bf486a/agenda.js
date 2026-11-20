const agendaKey = "energym.agenda.demo.v1";
function readAgenda() {
  const saved = JSON.parse(localStorage.getItem(agendaKey) || "{}");
  return { precio: saved.precio || "", cierre: saved.cierre || "" };
}
