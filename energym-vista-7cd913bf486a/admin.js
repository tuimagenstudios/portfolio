// Clave de administrador para la vista Ramiro (demo: se guarda cifrada solo en este navegador).
(() => {
  const HASH = "energym.admin.clave", OK = "energym.admin.ok";
  const ramiro = document.querySelector("input[value=Ramiro]");
  const radios = [...document.querySelectorAll("input[name=role]")];
  let previous = radios.find(r => r.checked && r !== ramiro) || radios[0];
  const unlocked = () => sessionStorage.getItem(OK) === "1";
  const hash = async text => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("energym:" + text)))].map(b => b.toString(16).padStart(2, "0")).join("");

  const dialog = document.createElement("dialog");
  dialog.className = "admin-dialog";
  dialog.innerHTML = '<form method="dialog" id="admin-login"><h2 id="admin-title"></h2><p id="admin-help"></p>' +
    '<label>Clave<input name="pass" type="password" minlength="6" maxlength="64" required autocomplete="current-password"></label>' +
    '<label id="admin-repeat">Repetir clave<input name="repeat" type="password" maxlength="64" autocomplete="new-password"></label>' +
    '<p id="admin-error" role="alert"></p><div class="admin-actions"><button value="ok">Entrar</button><button value="cancel" formnovalidate class="ghost">Cancelar</button></div>' +
    '<button type="button" id="admin-reset" class="link">Olvidé la clave (solo en la demo)</button></form>';
  document.body.append(dialog);
  const form = dialog.querySelector("form");

  function open() {
    const first = !localStorage.getItem(HASH);
    dialog.querySelector("#admin-title").textContent = first ? "Creá tu clave de administrador" : "Panel de Ramiro";
    dialog.querySelector("#admin-help").textContent = first
      ? "Es la primera vez. Elegí una clave de al menos 6 caracteres; desde ahora se pide para abrir el panel."
      : "Ingresá tu clave de administrador.";
    const repeat = dialog.querySelector("#admin-repeat");
    repeat.hidden = !first; repeat.querySelector("input").required = first;
    dialog.querySelector("#admin-reset").hidden = first;
    dialog.querySelector("#admin-error").textContent = "";
    form.reset();
    dialog.showModal();
  }

  form.addEventListener("submit", async event => {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const { pass, repeat } = form.elements;
    const err = dialog.querySelector("#admin-error");
    const saved = localStorage.getItem(HASH);
    if (!saved) {
      if (pass.value !== repeat.value) { err.textContent = "Las claves no coinciden."; return; }
      localStorage.setItem(HASH, await hash(pass.value));
    } else if (await hash(pass.value) !== saved) {
      err.textContent = "Clave incorrecta. Buen intento 😏"; pass.select(); return;
    }
    sessionStorage.setItem(OK, "1");
    dialog.close();
    ramiro.checked = true;
    render();
  });
  dialog.querySelector("#admin-reset").onclick = () => {
    if (confirm("¿Borrar la clave de administrador de esta demo? Vas a poder crear una nueva.")) { localStorage.removeItem(HASH); open(); }
  };

  // Carteles para los curiosos.
  const quips = {
    Profesor: ["🕵️ ¡Ey, chusma! Esa es la libreta del profe. Volvé a tus series 💪",
               "📋 Lo que anota el profe queda entre el profe y las pesas. ¡A entrenar!",
               "👀 Te vimos… La vista del profe es solo para profes. Tres series más por curioso 😄"],
    Profesionales: ["🩺 Zona de guardapolvos. Acá entran solo los profesionales… y vos tenés abdominales pendientes.",
               "🥗 Las fichas clínicas no se chusmean, se cuidan. Volvé a tu progreso 😉",
               "🔬 Área restringida: ni con bioimpedancia te dejamos pasar 😅"],
    Ramiro:  ["🔒 El panel de Ramiro está más protegido que la barra olímpica. ¡Volvé a entrenar!",
               "😏 Lindo intento. Las llaves del gimnasio las tiene Ramiro.",
               "🏋️ Para entrar acá hay que levantar más que curiosidad. Solo Ramiro."]
  };
  const toast = document.createElement("div");
  toast.className = "toast"; toast.setAttribute("role", "status"); toast.setAttribute("aria-live", "polite");
  document.body.append(toast);
  let toastTimer;
  function tease(role) {
    const list = quips[role] || quips.Ramiro;
    toast.textContent = list[Math.floor(Math.random() * list.length)];
    toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 4200);
  }
  const pupilHere = () => !!localStorage.getItem("energym.demo.pupil");
  form.querySelector('button[value=cancel]').addEventListener("click", () => tease("Ramiro"));

  for (const r of radios) r.addEventListener("change", () => {
    // Un alumno ingresado en este celular no puede abrir vistas del equipo (salvo que Ramiro haya abierto su panel).
    if (r.value !== "Alumno" && r !== ramiro && pupilHere() && !unlocked()) {
      previous.checked = true; render(); tease(r.value); return;
    }
    if (STAFF.includes(r.value) && !unlocked() && !staffOk(r.value)) {
      previous.checked = true; render();
      if (staffDevice() === r.value && !staffActive(r.value)) { toast.textContent = "⏸️ Tu acceso del equipo está pausado. Consultá con Ramiro."; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 4200); return; }
      if (staffDevice() && staffDevice() !== r.value) { tease(r.value); return; }
      openStaff(r.value); return;
    }
    if (r !== ramiro) { previous = r; return; }
    if (unlocked()) return;
    previous.checked = true;
    render();
    open();
  });

  // ===== Equipo: Profesor y Profesionales entran con código, igual que los alumnos =====
  const STAFF = ["Profesor", "Profesionales"];
  const ls = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }, del: k => { try { localStorage.removeItem(k); } catch {} } };
  const staffDevice = () => ls.get("energym.equipo.dispositivo");
  const staffActive = role => ls.get("energym.equipo.activo." + role) === "1";
  const staffOk = role => staffDevice() === role && staffActive(role) &&
    Number(ls.get("energym.equipo.ingreso") || 0) >= Number(ls.get("energym.equipo.reactivado." + role) || 0);
  const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(16).padStart(2, "0")).join("").toUpperCase().match(/.{4}/g).join("-");

  const sd = document.createElement("dialog");
  sd.className = "admin-dialog";
  sd.innerHTML = '<form method="dialog" id="staff-login"><h2 id="staff-title"></h2><p>Ingresá el código personal que te dio Ramiro. Lo ponés una sola vez y este celular queda habilitado.</p>' +
    '<p class="code-help">Para probar la demo: en la vista <b>Ramiro</b>, sección «Equipo», tocá «Generar código».</p>' +
    '<label>Código del equipo<input name="code" autocomplete="one-time-code" maxlength="20" required></label>' +
    '<p id="staff-error" role="alert"></p><div class="admin-actions"><button value="ok">Entrar</button><button value="cancel" formnovalidate class="ghost">Cancelar</button></div></form>';
  document.body.append(sd);
  const sf = sd.querySelector("form");
  let staffRole = "";
  function openStaff(role) {
    staffRole = role;
    sd.querySelector("#staff-title").textContent = "Ingreso del equipo · " + role;
    sd.querySelector("#staff-error").textContent = "";
    sf.reset(); sd.showModal();
  }
  sf.addEventListener("submit", e => {
    if (e.submitter?.value === "cancel") return;
    e.preventDefault();
    const typed = sf.elements.code.value.trim().toUpperCase().replace(/[-\s]/g, "");
    const saved = (ls.get("energym.equipo.codigo." + staffRole) || "").replace(/-/g, "");
    if (!typed || typed !== saved || !staffActive(staffRole)) { sd.querySelector("#staff-error").textContent = "Código inválido o ya utilizado."; return; }
    ls.set("energym.equipo.dispositivo", staffRole);
    ls.set("energym.equipo.ingreso", String(Date.now()));
    ls.del("energym.equipo.codigo." + staffRole);
    sd.close();
    document.querySelector("input[value=" + staffRole + "]").checked = true;
    previous = document.querySelector("input[value=" + staffRole + "]");
    render();
  });
  sf.querySelector("button[value=cancel]").addEventListener("click", () => tease(staffRole));

  // Panel "Equipo" dentro de la vista Ramiro
  const team = document.createElement("section");
  team.id = "team-access"; team.hidden = true;
  team.innerHTML = "<h2>Equipo</h2><p class=\"code-help\">Generá un código para cada perfil. Lo ponen una vez y quedan habilitados. Si alguien deja de trabajar con vos, pausalo.</p>" +
    STAFF.map(role => '<div class="team-row" data-role="' + role + '"><b>' + role + '</b>' +
      '<button type="button" class="portal-toggle" role="switch" aria-checked="false"></button>' +
      '<button type="button" class="team-code">Generar código</button><output></output></div>').join("");
  (document.getElementById("access-list") || document.getElementById("settings")).after(team);
  function drawTeam() {
    for (const row of team.querySelectorAll(".team-row")) {
      const role = row.dataset.role, on = staffActive(role);
      const t = row.querySelector(".portal-toggle");
      t.setAttribute("aria-checked", String(on)); t.textContent = on ? "Acceso activo" : "Acceso pausado";
      t.setAttribute("aria-label", "Acceso de " + role);
      row.querySelector(".team-code").hidden = !on;
      row.querySelector("output").textContent = on ? (ls.get("energym.equipo.codigo." + role) || "") : "";
    }
  }
  team.addEventListener("click", e => {
    const row = e.target.closest(".team-row"); if (!row) return;
    const role = row.dataset.role;
    if (e.target.classList.contains("portal-toggle")) {
      if (staffActive(role)) { ls.set("energym.equipo.activo." + role, "0"); ls.del("energym.equipo.codigo." + role); }
      else { ls.set("energym.equipo.activo." + role, "1"); ls.set("energym.equipo.reactivado." + role, String(Date.now())); ls.set("energym.equipo.codigo." + role, newCode()); }
    } else if (e.target.classList.contains("team-code")) ls.set("energym.equipo.codigo." + role, newCode());
    drawTeam();
  });

  // Botón para cerrar el panel.
  const lock = document.createElement("button");
  lock.type = "button"; lock.id = "admin-lock"; lock.className = "social"; lock.textContent = "Cerrar panel de administrador";
  document.getElementById("title").after(lock);
  lock.onclick = () => { sessionStorage.removeItem(OK); previous.checked = true; render(); };
  const sync = () => { lock.hidden = !(ramiro.checked && unlocked()); team.hidden = lock.hidden; if (!team.hidden) drawTeam(); };
  const original = window.render;
  window.render = function () {
    original();
    // Guardia: nunca dejar abierta una vista que este celular no tiene permitida.
    const cur = radios.find(x => x.checked);
    const allowed = !cur || cur.value === "Alumno" || unlocked() || (STAFF.includes(cur.value) && staffOk(cur.value));
    if (!allowed) { radios[0].checked = true; previous = radios[0]; original(); }
    sync();
  };

  // Si la página se abrió directo en la vista Ramiro (por ejemplo #avisos) sin clave.
  const cur = radios.find(x => x.checked);
  if (ramiro.checked && !unlocked()) { previous.checked = true; render(); open(); }
  else if (cur && STAFF.includes(cur.value) && !unlocked() && !staffOk(cur.value)) { radios[0].checked = true; previous = radios[0]; render(); }
  else sync();
})();
