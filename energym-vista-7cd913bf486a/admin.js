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
      err.textContent = "Clave incorrecta."; pass.select(); return;
    }
    sessionStorage.setItem(OK, "1");
    dialog.close();
    ramiro.checked = true;
    render();
  });
  dialog.querySelector("#admin-reset").onclick = () => {
    if (confirm("¿Borrar la clave de administrador de esta demo? Vas a poder crear una nueva.")) { localStorage.removeItem(HASH); open(); }
  };

  for (const r of radios) r.addEventListener("change", () => {
    if (r !== ramiro) { previous = r; return; }
    if (unlocked()) return;
    previous.checked = true;
    render();
    open();
  });

  // Botón para cerrar el panel.
  const lock = document.createElement("button");
  lock.type = "button"; lock.id = "admin-lock"; lock.className = "social"; lock.textContent = "Cerrar panel de administrador";
  document.getElementById("title").after(lock);
  lock.onclick = () => { sessionStorage.removeItem(OK); previous.checked = true; render(); };
  const sync = () => { lock.hidden = !(ramiro.checked && unlocked()); };
  const original = window.render;
  window.render = function () { original(); sync(); };

  // Si la página se abrió directo en la vista Ramiro (por ejemplo #avisos) sin clave.
  if (ramiro.checked && !unlocked()) { previous.checked = true; render(); open(); } else sync();
})();
