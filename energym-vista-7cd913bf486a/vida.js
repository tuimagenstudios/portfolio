// Movimiento de la portada: aparición al hacer scroll e inclinación 3D de las tarjetas.
(() => {
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  const targets = document.querySelectorAll(".intro.card, .nutrition img, .nutrition > div, .reels h2, .reels figure, .contact .wrap > *");
  targets.forEach((el, i) => { el.classList.add("reveal"); el.style.setProperty("--d", (i % 6) * 90 + "ms"); });
  if (calm || !("IntersectionObserver" in window)) { targets.forEach(el => el.classList.add("in")); }
  else {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: .15, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(el => io.observe(el));
  }

  if (calm || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  for (const card of document.querySelectorAll(".intro.card, .reels figure")) {
    const max = card.classList.contains("card") ? 7 : 10;
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--rx", ((.5 - y) * max).toFixed(2) + "deg");
      card.style.setProperty("--ry", ((x - .5) * max).toFixed(2) + "deg");
      card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      card.classList.add("tilt");
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("tilt");
      card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg");
    });
  }
})();
