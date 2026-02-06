// Dirigir al cliente hacia screen/cart/indexedDB.html

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#login-form');
  const splashScreen = document.querySelector('#splash-screen');
  const usernameInput = document.querySelector('#username');
  const existingUser = sessionStorage.getItem('donCerdonio_user');

  if (existingUser) {
    // splashScreen.classList.add('hidden');
    initStore();
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = usernameInput.value.trim();

    if (name) {
      sessionStorage.setItem('donCerdonio_user', name);
      splashScreen.style.opacity = '0';
      splashScreen.style.transition = 'opacity 0.3s ease';

      setTimeout(() => {
        splashScreen.classList.add('hidden');
        // Success message in plain text to avoid console highlighting
        console.log(`${name}, Welcome to Don Cerdonio `);
        initStore(name);
      }, 400);
    }
  });
});

function initStore() {
  window.location.href = './cart/index.html';
}

