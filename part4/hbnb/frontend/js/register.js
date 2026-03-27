// ==================== API Configuration ====================
function getApiUrl() {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  return window.location.origin.replace(':8000', ':5000');
}

const API_BASE_URL = getApiUrl();

// ==================== Register Form Handling ====================
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  const headerLoginBtn = document.getElementById('headerLoginBtn');

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  if (headerLoginBtn) {
    headerLoginBtn.addEventListener('click', function() {
      window.location.href = '/login.html';
    });
  }
});

async function handleRegister(e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const termsAccepted = document.getElementById('terms').checked;

  // ==================== Validation ====================
  // Vérifier les mots de passe
  if (password !== confirmPassword) {
    showErrorMessage('Les mots de passe ne correspondent pas');
    return;
  }

  if (password.length < 8) {
    showErrorMessage('Le mot de passe doit contenir au moins 8 caractères');
    return;
  }

  if (!termsAccepted) {
    showErrorMessage('Vous devez accepter les conditions d\'utilisation');
    return;
  }

  if (!firstName || !lastName) {
    showErrorMessage('Veuillez entrer votre prénom et nom');
    return;
  }

  // ==================== Send Registration Request ====================
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        showErrorMessage('Cet email est déjà utilisé');
      } else if (data.message) {
        showErrorMessage(data.message);
      } else {
        showErrorMessage('Erreur lors de l\'inscription');
      }
      return;
    }

    // ==================== Success ====================
    showSuccessMessage('Compte créé avec succès! Redirection...');

    // Redirect to login after 2 seconds
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 2000);

  } catch (error) {
    console.error('Registration error:', error);
    showErrorMessage('Erreur de connexion. Veuillez réessayer.');
  }
}

// ==================== Message Display ====================
function showErrorMessage(message) {
  removeMessages();
  const form = document.getElementById('registerForm');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'error-message error';
  messageDiv.textContent = message;
  form.insertBefore(messageDiv, form.firstChild);
}

function showSuccessMessage(message) {
  removeMessages();
  const form = document.getElementById('registerForm');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'success-message';
  messageDiv.textContent = message;
  form.insertBefore(messageDiv, form.firstChild);
}

function removeMessages() {
  const form = document.getElementById('registerForm');
  const existingMessages = form.querySelectorAll('.error-message, .success-message');
  existingMessages.forEach(msg => msg.remove());
}
