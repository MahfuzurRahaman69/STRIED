// ===== START: REGISTER FORM =====
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('register-msg');
    msg.innerHTML = '';
    try {
      const data = await api.post('/auth/register', {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user.name);
      window.location.href = 'account.html';
    } catch (err) {
      msg.innerHTML = `<div class="error-msg">${err.message}</div>`;
    }
  });
}
// ===== END: REGISTER FORM =====

// ===== START: LOGIN FORM =====
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('login-msg');
    msg.innerHTML = '';
    try {
      const data = await api.post('/auth/login', {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user.name);
      window.location.href = 'account.html';
    } catch (err) {
      msg.innerHTML = `<div class="error-msg">${err.message}</div>`;
    }
  });
}
// ===== END: LOGIN FORM =====
