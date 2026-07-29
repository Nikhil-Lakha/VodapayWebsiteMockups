document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const header = document.querySelector('.site-header');

navToggle.addEventListener('click', () => {
  header.classList.toggle('nav-open');
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => header.classList.remove('nav-open'));
});
