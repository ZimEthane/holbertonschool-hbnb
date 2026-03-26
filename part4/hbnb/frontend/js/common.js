// Utilitaires communs
function initHeaderLoginStatus() {
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  if (!headerLoginBtn) return;

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (isLoggedIn) {
    headerLoginBtn.textContent = 'Déconnexion';
    headerLoginBtn.onclick = function() {
      localStorage.setItem('isLoggedIn', 'false');
      window.location.href = 'index.html';
    };
  } else {
    headerLoginBtn.textContent = 'Connexion';
    headerLoginBtn.onclick = function() {
      window.location.href = 'login.html';
    };
  }
}

// Initialiser le statut de connexion du header
document.addEventListener('DOMContentLoaded', initHeaderLoginStatus);
