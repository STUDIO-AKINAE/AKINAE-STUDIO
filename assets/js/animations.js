/* ================================
   ANIMATIONS.JS
   Intersection Observer — activa
   animaciones al hacer scroll
================================ */

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Una vez visible, deja de observar (eficiencia)
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,  // se activa cuando el 15% es visible
    rootMargin: '0px 0px -50px 0px'  // pequeño delay visual
  }
);

// Observar todos los elementos con clases de animación
document.querySelectorAll(
  '.fade-up, .fade-in, .slide-left'
).forEach(el => observer.observe(el));

/* ================================
   CONTADOR ANIMADO
   Para mostrar métricas (opcional)
================================ */
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}