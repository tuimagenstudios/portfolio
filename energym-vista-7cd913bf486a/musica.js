// Música de fondo rotativa con botón de parlante.
// Los navegadores no dejan sonar música sola: arranca cuando la persona toca el parlante,
// y se recuerda la preferencia (prendida o apagada) en este navegador.
(() => {
  const temas = ["assets/musica/tema-1.mp3", "assets/musica/tema-2.mp3", "assets/musica/tema-3.mp3"];
  const KEY = "energym.musica";
  const audio = new Audio();
  audio.preload = "none";
  audio.volume = 0;
  const MAX = 0.5; // tope: nunca más del 50 %
  let nivel = 100;  // posición del deslizador (0–100) dentro de ese tope
  try { const n = Number(localStorage.getItem("energym.musica.nivel")); if (n >= 0 && n <= 100 && localStorage.getItem("energym.musica.nivel") !== null) nivel = n; } catch {}
  const objetivo = () => MAX * nivel / 100;

  // Orden aleatorio, sin repetir el mismo tema seguido.
  let orden = [], pos = 0, ultimo = -1;
  function mezclar() {
    orden = temas.map((_, i) => i).sort(() => Math.random() - .5);
    if (orden[0] === ultimo && orden.length > 1) orden.push(orden.shift());
    pos = 0;
  }
  function siguiente() {
    if (pos >= orden.length) mezclar();
    ultimo = orden[pos++];
    audio.src = temas[ultimo];
  }
  mezclar(); siguiente();

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "music-btn";
  btn.innerHTML =
    '<span class="music-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
    '<svg class="on" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
    '<svg class="off" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
    '<span class="music-label">Activar música</span>';
  const caja = document.createElement("div");
  caja.className = "music-box";
  const vol = document.createElement("input");
  vol.type = "range"; vol.min = "0"; vol.max = "100"; vol.step = "1"; vol.value = String(nivel);
  vol.className = "music-vol"; vol.setAttribute("aria-label", "Volumen de la música");
  const pintarVol = () => vol.style.setProperty("--p", vol.value + "%");
  pintarVol();
  vol.addEventListener("input", () => {
    nivel = Number(vol.value); pintarVol();
    clearInterval(fadeTimer); audio.volume = objetivo();
    try { localStorage.setItem("energym.musica.nivel", String(nivel)); } catch {}
    if (nivel === 0 && !audio.paused) apagar();
    else if (nivel > 0 && audio.paused && btn.getAttribute("aria-pressed") !== "true") prender();
  });
  caja.append(btn, vol);
  document.body.append(caja);

  let fadeTimer;
  function fade(to, done, step = 0.03) {
    clearInterval(fadeTimer);
    fadeTimer = setInterval(() => {
      const d = to - audio.volume;
      if (Math.abs(d) < step) { audio.volume = to; clearInterval(fadeTimer); done && done(); return; }
      audio.volume = Math.min(1, Math.max(0, audio.volume + Math.sign(d) * step));
    }, 100);
  }
  function pintar(sonando) {
    btn.classList.toggle("playing", sonando);
    btn.setAttribute("aria-pressed", String(sonando));
    btn.setAttribute("aria-label", sonando ? "Apagar la música" : "Prender la música");
    btn.title = sonando ? "Apagar la música" : "Prender la música";
    btn.querySelector(".music-label").textContent = sonando ? "Silenciar" : "Activar música";
  }
  async function prender() {
    try { audio.volume = 0; await audio.play(); fade(objetivo(), null, 0.0125); pintar(true); try { localStorage.setItem(KEY, "on"); } catch {} }
    catch { pintar(false); }
  }
  function apagar() {
    fade(0, () => audio.pause());
    pintar(false);
    try { localStorage.setItem(KEY, "off"); } catch {}
  }
  btn.addEventListener("click", () => (audio.paused || btn.getAttribute("aria-pressed") !== "true") ? prender() : apagar());
  audio.addEventListener("ended", () => { siguiente(); audio.volume = 0; audio.play().then(() => fade(objetivo(), null, 0.0125)).catch(() => pintar(false)); });
  audio.addEventListener("error", () => { siguiente(); });
  pintar(false);

  // Arranca sola (salvo que la persona la haya silenciado antes), subiendo de a poco.
  // Si el navegador bloquea el sonido automático, arranca con el primer toque en la página.
  let pref = null; try { pref = localStorage.getItem(KEY); } catch {}
  if (pref !== "off") {
    const auto = async () => {
      try { audio.volume = 0; await audio.play(); fade(objetivo(), null, 0.0125); pintar(true); return true; }
      catch { return false; }
    };
    auto().then(ok => {
      if (ok) return;
      const eventos = ["pointerdown", "keydown", "touchstart"];
      const primerToque = e => {
        eventos.forEach(ev => removeEventListener(ev, primerToque, true));
        if (e.target.closest && e.target.closest(".music-box")) return; // el botón ya se encarga
        if (btn.getAttribute("aria-pressed") !== "true") prender();
      };
      eventos.forEach(ev => addEventListener(ev, primerToque, { capture: true, passive: true }));
    });
  }
})();
