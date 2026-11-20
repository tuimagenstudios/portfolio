// Muestra en la portada si hay turnos libres en los próximos 14 días (los que Ramiro marca en el calendario).
(() => {
  const pad = n => String(n).padStart(2, "0");
  const key = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  function cierre() { try { return (JSON.parse(localStorage.getItem("energym.agenda.demo.v1") || "{}").cierre) || ""; } catch { return ""; } }

  function buscar() {
    const ahora = new Date(), cerrado = cierre(), libres = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(ahora); d.setDate(d.getDate() + i);
      const k = key(d);
      if (k === cerrado) continue;
      for (let h = 7; h < 23; h++) {
        if (i === 0 && h <= ahora.getHours()) continue;
        let v = null; try { v = localStorage.getItem("energym.turno." + k + "." + h); } catch {}
        if (v === "Libre") libres.push({ d, h });
      }
    }
    return libres;
  }

  function texto(t) {
    const hoy = new Date(), man = new Date(); man.setDate(hoy.getDate() + 1);
    const dia = key(t.d) === key(hoy) ? "hoy" : key(t.d) === key(man) ? "mañana" : t.d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric" });
    return dia + " a las " + t.h + ":00";
  }

  const ctas = document.querySelector(".hero-ctas");
  const verTurnos = document.querySelector('.hero-ctas a[href="calendario.html"]');
  const badge = document.createElement("a");
  badge.href = "calendario.html";
  badge.className = "turnos-badge";
  badge.hidden = true;
  if (ctas) ctas.before(badge);
  const turnosCard = document.querySelector("#turnos .actions");
  const cardNote = document.createElement("p");
  cardNote.className = "turnos-note";
  cardNote.hidden = true;
  if (turnosCard) turnosCard.before(cardNote);

  function pintar() {
    const libres = buscar();
    const hay = libres.length > 0;
    badge.hidden = cardNote.hidden = !hay;
    verTurnos?.classList.toggle("available", hay);
    if (!hay) return;
    const cant = libres.length === 1 ? "1 turno disponible" : libres.length + " turnos disponibles";
    badge.innerHTML = '<span class="dot" aria-hidden="true"></span><b>Hay ' + cant + '</b><span class="next">Próximo: ' + texto(libres[0]) + '</span><span aria-hidden="true">→</span>';
    cardNote.innerHTML = '<span class="dot" aria-hidden="true"></span>Hay ' + cant + '. Próximo: <b>' + texto(libres[0]) + '</b>.';
  }
  pintar();
  addEventListener("storage", pintar);
  addEventListener("pageshow", pintar);
})();
