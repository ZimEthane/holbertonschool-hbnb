// Données de démonstration
const places = [
  {
    id: 1,
    name: "Cosy Studio au Centre-Ville",
    price: 75,
    bedrooms: 1,
    bathrooms: 1,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    description: "Un studio moderne et confortable au cœur de la ville"
  },
  {
    id: 2,
    name: "Appartement de Luxe",
    price: 150,
    bedrooms: 2,
    bathrooms: 2,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    description: "Apartement élégant avec vue panoramique"
  },
  {
    id: 3,
    name: "Maison de Famille",
    price: 120,
    bedrooms: 3,
    bathrooms: 2,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop",
    description: "Grande maison parfaite pour les familles"
  },
  {
    id: 4,
    name: "Loft Industrial Chic",
    price: 95,
    bedrooms: 1,
    bathrooms: 1,
    image: "https://images.unsplash.com/photo-1585399490121-75e74e937a3f?w=400&h=300&fit=crop",
    description: "Loft tendance avec style industrial"
  },
  {
    id: 5,
    name: "Villa avec Piscine",
    price: 200,
    bedrooms: 4,
    bathrooms: 3,
    image: "https://images.unsplash.com/photo-1570129477492-45c003cedd70?w=400&h=300&fit=crop",
    description: "Luxueuse villa avec piscine privée"
  },
  {
    id: 6,
    name: "Penthouse Moderne",
    price: 180,
    bedrooms: 3,
    bathrooms: 2,
    image: "https://images.unsplash.com/photo-1520932057f3-99e6d58d5ba0?w=400&h=300&fit=crop",
    description: "Penthouse contemporain avec terrasse"
  }
];

function renderPlaces() {
  const grid = document.getElementById('placesGrid');
  grid.innerHTML = places.map(place => `
    <div class="place-card">
      <img src="${place.image}" alt="${place.name}">
      <div class="place-card-content">
        <h3>${place.name}</h3>
        <div class="place-card-price">$${place.price}<span>/nuit</span></div>
        <div class="place-card-meta">
          <span>🛏️ ${place.bedrooms} chambre${place.bedrooms > 1 ? 's' : ''}</span>
          <span>🚿 ${place.bathrooms} SDB</span>
        </div>
        <button class="details-button" onclick="window.location.href='place.html?id=${place.id}'">
          Voir les détails
        </button>
      </div>
    </div>
  `).join('');
}

// Charger les places au chargement de la page
document.addEventListener('DOMContentLoaded', renderPlaces);
