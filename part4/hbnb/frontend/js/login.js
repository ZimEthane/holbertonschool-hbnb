// Gestion du formulaire de connexion
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Sauvegarder le statut de connexion dans localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);

    alert(`Bienvenue ${email}!`);
    window.location.href = 'index.html';
  });
});
