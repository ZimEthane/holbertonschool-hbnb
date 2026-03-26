// Données de démonstration
const placesData = {
  1: {
    id: 1,
    name: "Cosy Studio au Centre-Ville",
    price: 75,
    bedrooms: 1,
    bathrooms: 1,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=400&fit=crop",
    description: "Un studio moderne et confortable au cœur de la ville",
    host: "Marie Dupont",
    address: "123 Rue de la Paix, Paris 75001",
    amenities: ["WiFi", "Climatisation", "Cuisine équipée"],
    reviews: [
      { author: "Jean Martin", rating: 5, comment: "Très confortable et bien situé!", date: "2026-03-20" },
      { author: "Sophie Lambert", rating: 4, comment: "Bon rapport qualité-prix", date: "2026-03-15" }
    ]
  },
  2: {
    id: 2,
    name: "Appartement de Luxe",
    price: 150,
    bedrooms: 2,
    bathrooms: 2,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=400&fit=crop",
    description: "Apartement élégant avec vue panoramique",
    host: "Pierre Moreau",
    address: "456 Avenue Montaigne, Paris 75008",
    amenities: ["WiFi", "Télévision", "Climatisation", "Vue panoramique"],
    reviews: [
      { author: "Luc Bernard", rating: 5, comment: "Magnifique vue et luxe confirmé!", date: "2026-03-18" }
    ]
  },
  3: {
    id: 3,
    name: "Maison de Famille",
    price: 120,
    bedrooms: 3,
    bathrooms: 2,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=400&fit=crop",
    description: "Grande maison parfaite pour les familles",
    host: "Isabelle Leclerc",
    address: "789 Rue du Parc, Versailles 78000",
    amenities: ["WiFi", "Jardin", "Parking", "Cuisine équipée", "Buanderie"],
    reviews: [
      { author: "François Renard", rating: 5, comment: "Idéale pour une famille!", date: "2026-03-10" },
      { author: "Nathalie Petit", rating: 5, comment: "Magnifique séjour", date: "2026-03-05" }
    ]
  }
};

// Récupérer l'ID de la place depuis l'URL
function getPlaceId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Charger les détails de la place
function loadPlaceDetails() {
  const placeId = getPlaceId();
  const place = placesData[placeId];

  if (!place) {
    document.getElementById('placeDetails').innerHTML = '<p style="text-align: center; color: red;">Place non trouvée</p>';
    return;
  }

  const detailsHTML = `
    <img src="${place.image}" alt="${place.name}" class="place-hero-image">

    <h1 style="margin-bottom: 1rem;">${place.name}</h1>

    <div class="place-info">
      <div class="info-block">
        <h4>Prix</h4>
        <p style="font-size: 1.8rem; color: var(--primary-color); font-weight: bold;">$${place.price}/nuit</p>
      </div>

      <div class="info-block">
        <h4>Hôte</h4>
        <p>${place.host}</p>
      </div>

      <div class="info-block">
        <h4>Adresse</h4>
        <p>${place.address}</p>
      </div>

      <div class="info-block">
        <h4>Chambres & Salles de bain</h4>
        <p>🛏️ ${place.bedrooms} chambre(s) | 🚿 ${place.bathrooms} salle(s) de bain</p>
      </div>
    </div>

    <div class="place-description">
      <h3>Description</h3>
      <p>${place.description}</p>
    </div>

    <div>
      <h3 style="margin-bottom: 1.5rem;">Équipements</h3>
      <div class="amenities">
        ${place.amenities.map(amenity => `
          <div class="amenity">
            <span>${getAmenityIcon(amenity)}</span>
            <span>${amenity}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('placeDetails').innerHTML = detailsHTML;
}

// Charger les avis
function loadReviews() {
  const placeId = getPlaceId();
  const place = placesData[placeId];

  if (!place || place.reviews.length === 0) {
    document.getElementById('reviewsList').innerHTML = '<p style="text-align: center; color: var(--text-color);">Pas d\'avis encore. Soyez le premier!</p>';
    return;
  }

  const reviewsHTML = place.reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <span class="review-author">${review.author}</span>
        <span class="review-rating">★ ${review.rating}<span>/5</span></span>
      </div>
      <p class="review-comment">${review.comment}</p>
      <p class="review-date">${new Date(review.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  `).join('');

  document.getElementById('reviewsList').innerHTML = reviewsHTML;
}

// Obtenir l'icône de l'équipement
function getAmenityIcon(amenity) {
  const icons = {
    'WiFi': '📶',
    'Climatisation': '❄️',
    'Cuisine équipée': '🍽️',
    'Télévision': '📺',
    'Vue panoramique': '🏙️',
    'Jardin': '🌳',
    'Parking': '🚗',
    'Buanderie': '🧺'
  };
  return icons[amenity] || '✓';
}

// Vérifier si l'utilisateur est connecté
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const headerLoginBtn = document.getElementById('headerLoginBtn');

  if (isLoggedIn) {
    document.getElementById('addReviewSection').classList.remove('hidden');
    document.getElementById('loginPrompt').classList.add('hidden');
    headerLoginBtn.textContent = 'Déconnexion';
    headerLoginBtn.onclick = function() {
      localStorage.setItem('isLoggedIn', 'false');
      window.location.href = 'index.html';
    };
  } else {
    document.getElementById('addReviewSection').classList.add('hidden');
    document.getElementById('loginPrompt').classList.remove('hidden');
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  loadPlaceDetails();
  loadReviews();
  checkLoginStatus();

  // Mise à jour de la valeur du curseur
  const ratingInput = document.getElementById('reviewRating');
  if (ratingInput) {
    ratingInput.addEventListener('input', function() {
      document.getElementById('ratingValue').textContent = this.value;
    });
  }

  // Soumission du formulaire
  const form = document.getElementById('addReviewForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Avis soumis avec succès!');
      this.reset();
      document.getElementById('reviewRating').value = 5;
      document.getElementById('ratingValue').textContent = '5';
    });
  }
});
