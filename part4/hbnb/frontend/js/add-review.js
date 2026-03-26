let selectedRating = 5;

// Vérifier si l'utilisateur est connecté
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const headerLoginBtn = document.getElementById('headerLoginBtn');

  if (!isLoggedIn) {
    document.getElementById('authCheck').style.display = 'block';
    document.getElementById('reviewFormContent').classList.add('hidden');
  } else {
    document.getElementById('authCheck').style.display = 'none';
    document.getElementById('reviewFormContent').classList.remove('hidden');
    headerLoginBtn.textContent = 'Déconnexion';
    headerLoginBtn.onclick = function() {
      localStorage.setItem('isLoggedIn', 'false');
      window.location.href = 'index.html';
    };
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  checkLoginStatus();

  const stars = document.querySelectorAll('.star');
  const ratingDisplay = document.getElementById('ratingDisplay');

  // Gérer la notation par les étoiles
  stars.forEach(star => {
    star.addEventListener('click', function() {
      selectedRating = this.dataset.rating;
      ratingDisplay.textContent = `★ ${selectedRating}`;

      // Mettre à jour les étoiles actives
      stars.forEach(s => {
        if (s.dataset.rating <= selectedRating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });

    star.addEventListener('mouseover', function() {
      const hoverRating = this.dataset.rating;
      stars.forEach(s => {
        if (s.dataset.rating <= hoverRating) {
          s.style.color = 'var(--accent-color)';
        } else {
          s.style.color = 'inherit';
        }
      });
    });
  });

  document.querySelectorAll('.stars-rating').forEach(container => {
    container.addEventListener('mouseleave', function() {
      stars.forEach(s => {
        if (s.dataset.rating <= selectedRating) {
          s.style.color = 'var(--accent-color)';
        } else {
          s.style.color = 'inherit';
        }
      });
    });
  });

  // Gérer les curseurs de notation
  ['cleanliness', 'communication', 'value'].forEach(id => {
    const slider = document.getElementById(id);
    const display = document.getElementById(id + 'Value');
    slider.addEventListener('input', function() {
      display.textContent = this.value;
    });
  });

  // Gérer la soumission du formulaire
  const form = document.getElementById('addReviewForm');
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('reviewTitle').value;
    const comment = document.getElementById('reviewComment').value;
    const cleanliness = document.getElementById('cleanliness').value;
    const communication = document.getElementById('communication').value;
    const value = document.getElementById('value').value;

    console.log({
      rating: selectedRating,
      title,
      comment,
      cleanliness,
      communication,
      value
    });

    alert('✓ Merci! Votre avis a été soumis avec succès!\n\nNote: ' + selectedRating + '/5');
    this.reset();
    document.getElementById('cleanliness').value = 5;
    document.getElementById('communication').value = 5;
    document.getElementById('value').value = 5;
    document.getElementById('cleanlinessValue').textContent = 5;
    document.getElementById('communicationValue').textContent = 5;
    document.getElementById('valueValue').textContent = 5;

    setTimeout(() => window.history.back(), 1000);
  });
});
