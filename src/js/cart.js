// Asegurar que coloquen primero su nombre en el src/index.html

document.addEventListener('DOMContentLoaded', () => {
  const name = sessionStorage.getItem('donCerdonio_user');
  const userDisplay = document.querySelector('#user-display');

  if (name && userDisplay) {
    userDisplay.textContent = name;
    console.log('Customer session active: ' + name);
  } else {
    window.location.href = '../index.html'
  }
})