/* ================================
   MAIN.JS — Lógica global
   Navbar scroll, cursor, utilidades
================================ */

// Navbar: añade clase .scrolled al hacer scroll
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Cursor personalizado (añadir HTML del cursor al body)
const cursor     = document.querySelector('.cursor');
const cursorDot  = document.querySelector('.cursor-dot');

if (cursor) {
  document.addEventListener('mousemove', (e) => {
    cursor.style.transform    = `translate(${e.clientX}px, ${e.clientY}px)`;
    cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  // Cursor crece al pasar sobre links y botones
  document.querySelectorAll('a, button, .btn-primary, .btn-ghost')
    .forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// Smooth scroll para links internos (#seccion)
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});