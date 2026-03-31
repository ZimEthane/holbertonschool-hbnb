/**
 * Index page functionality for HBNB application
 * Handles listing places, filtering, and user authentication
 */

const API_BASE_URL = getApiUrl();
const PLACES_ENDPOINT = `${API_BASE_URL}/api/v1/places/`;
const REVIEWS_ENDPOINT = `${API_BASE_URL}/api/v1/reviews/`;

let allPlaces = [];
let allReviews = [];

/**
 * Auto-détecte l'URL de l'API selon l'environnement
 */
function getApiUrl() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // GitHub Codespaces
    if (hostname.includes('app.github.dev')) {
        const newHostname = hostname.replace(/(\d+)\.app\.github\.dev/, '5000.app.github.dev');
        return `${protocol}//${newHostname}`;
    }

    // Localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }

    return `${protocol}//${hostname}:5000`;
}

/**
 * Get JWT token from cookie
 */
function getToken() {
    const name = 'access_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let cookie of cookieArray) {
        cookie = cookie.trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length);
        }
    }
    return null;
}

/**
 * Initialize page on load
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Index page loaded');
    console.log('API URL:', API_BASE_URL);

    initPriceFilter();
    loadPlaces();
});

/**
 * Initialize page on load
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Index page loaded');
    console.log('API URL:', API_BASE_URL);

    initFilters();
    loadPlaces();
});

/**
 * Initialize all filters event listeners
 */
function initFilters() {
    const priceFilter = document.getElementById('priceFilter');
    const sortPrice = document.getElementById('sortPrice');
    const sortRating = document.getElementById('sortRating');
    const searchInput = document.getElementById('searchInput');
    const resetBtn = document.getElementById('resetFiltersBtn');

    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }
    if (sortPrice) {
        sortPrice.addEventListener('change', applyFilters);
    }
    if (sortRating) {
        sortRating.addEventListener('change', applyFilters);
    }
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

/**
 * Fetch places from API
 */
async function loadPlaces() {
    try {
        console.log('Fetching places from:', PLACES_ENDPOINT);

        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // Add token if user is authenticated
        const token = getToken();
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch places and reviews in parallel
        const [placesResponse, reviewsResponse] = await Promise.all([
            fetch(PLACES_ENDPOINT, options),
            fetch(REVIEWS_ENDPOINT, options)
        ]);

        if (!placesResponse.ok) {
            throw new Error(`API Error: ${placesResponse.status} ${placesResponse.statusText}`);
        }

        const placesData = await placesResponse.json();
        const reviewsData = reviewsResponse.ok ? await reviewsResponse.json() : [];
        
        console.log('Places data received:', placesData);
        console.log('Reviews data received:', reviewsData);

        // Handle different response formats
        if (Array.isArray(placesData)) {
            allPlaces = placesData;
        } else if (placesData.places && Array.isArray(placesData.places)) {
            allPlaces = placesData.places;
        } else {
            console.warn('Unexpected data format:', placesData);
            allPlaces = [];
        }

        // Store reviews
        allReviews = Array.isArray(reviewsData) ? reviewsData : [];

        // Calculate average rating for each place
        allPlaces.forEach(place => {
            const placeReviews = allReviews.filter(r => r.place_id === place.id);
            place.reviewCount = placeReviews.length;
            place.avgRating = placeReviews.length > 0
                ? placeReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / placeReviews.length
                : 0;
        });

        displayPlaces(allPlaces);

    } catch (error) {
        console.error('Error loading places:', error);
        showPlacesError(`Erreur lors du chargement des places: ${error.message}`);
    }
}

/**
 * Display places in grid
 */
function displayPlaces(places) {
    const placesGrid = document.getElementById('placesGrid');

    if (!placesGrid) {
        console.error('Places grid container not found');
        return;
    }

    // Clear existing places
    placesGrid.innerHTML = '';

    if (!places || places.length === 0) {
        placesGrid.innerHTML = '<p class="col-span-full text-center py-16 text-gray-500 text-lg">Aucune place disponible</p>';
        return;
    }

    // Create place cards
    places.forEach(place => {
        const placeCard = createPlaceCard(place);
        placesGrid.appendChild(placeCard);
    });
}

/**
 * Create a place card element
 */
function createPlaceCard(place) {
    const card = document.createElement('div');
    card.className = 'place-card group cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-red-300 border border-gray-100 rounded-xl overflow-hidden bg-white';
    card.id = `place-${place.id}`;

    // Store data for filtering
    const priceValue = parseFloat(place.price) || 0;
    const title = (place.title || place.name || 'Unnamed Place').toLowerCase();
    const avgRating = place.avgRating || 0;
    const reviewCount = place.reviewCount || 0;

    card.dataset.price = priceValue;
    card.dataset.title = title;
    card.dataset.rating = avgRating;

    const name = place.title || place.name || 'Unnamed Place';
    const price = priceValue;
    const description = place.description || '';
    const imageUrl = getPlaceImage(place);

    // Format rating display
    const ratingDisplay = avgRating > 0 
        ? `<div class="flex items-center gap-1 text-sm">
             <span class="text-yellow-500">⭐</span>
             <span class="font-semibold text-gray-900">${avgRating.toFixed(1)}</span>
             <span class="text-gray-500">(${reviewCount} avis)</span>
           </div>`
        : `<div class="text-sm text-gray-500">Pas encore d'avis</div>`;

    card.innerHTML = `
        <div class="relative overflow-hidden">
            <img src="${imageUrl}" alt="${escapeHtml(name)}" class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='/images/logo.png'">
            <div class="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md">
                <span class="font-semibold text-red-500">${price}€</span><span class="text-gray-600 text-sm">/nuit</span>
            </div>
        </div>
        <div class="p-4">
            <h3 class="font-semibold text-gray-900 line-clamp-2 mb-2">${escapeHtml(name)}</h3>
            ${description ? `<p class="text-gray-600 text-sm line-clamp-2 mb-3">${escapeHtml(description)}</p>` : '<div class="mb-3"></div>'}
            <div class="flex items-center justify-between mb-3">
                ${ratingDisplay}
            </div>
            <a href="/place.html?id=${place.id}" class="inline-block text-red-500 font-medium hover:text-red-700 transition-colors text-sm">Voir plus →</a>
        </div>
    `;

    return card;
}

function getPlaceImage(place) {
    const imageUrls = place.image_urls;

    if (Array.isArray(imageUrls) && imageUrls.length > 0 && typeof imageUrls[0] === 'string') {
        return imageUrls[0];
    }

    if (typeof imageUrls === 'string') {
        try {
            const parsed = JSON.parse(imageUrls);
            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                return parsed[0];
            }
        } catch (error) {
            return '/images/logo.png';
        }
    }

    return '/images/logo.png';
}

/**
 * Apply all filters and sorting
 */
function applyFilters() {
    const priceFilter = document.getElementById('priceFilter').value;
    const sortPrice = document.getElementById('sortPrice').value;
    const sortRating = document.getElementById('sortRating').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    const placesGrid = document.getElementById('placesGrid');
    const cards = Array.from(placesGrid.querySelectorAll('.place-card'));

    // Filter cards
    let visibleCards = cards.filter(card => {
        const price = parseFloat(card.dataset.price);
        const title = card.dataset.title;

        // Prix filter
        if (priceFilter) {
            if (priceFilter === '100+') {
                // "Plus de 100€" - affiche seulement les prix > 100
                if (price <= 100) {
                    return false;
                }
            } else {
                if (price > parseFloat(priceFilter)) {
                    return false;
                }
            }
        }

        // Recherche
        if (searchInput && !title.includes(searchInput)) {
            return false;
        }

        return true;
    });

    // Sort cards
    if (sortPrice) {
        visibleCards.sort((a, b) => {
            const priceA = parseFloat(a.dataset.price);
            const priceB = parseFloat(b.dataset.price);

            if (sortPrice === 'asc') {
                return priceA - priceB;
            } else if (sortPrice === 'desc') {
                return priceB - priceA;
            }
            return 0;
        });
    }

    // Sort by rating
    if (sortRating) {
        visibleCards.sort((a, b) => {
            const ratingA = parseFloat(a.dataset.rating) || 0;
            const ratingB = parseFloat(b.dataset.rating) || 0;

            if (sortRating === 'asc') {
                return ratingA - ratingB;  // Notes les plus basses d'abord
            } else if (sortRating === 'desc') {
                return ratingB - ratingA;  // Meilleures notes d'abord
            }
            return 0;
        });
    }

    // Réorganiser les cartes dans le DOM
    visibleCards.forEach(card => {
        placesGrid.appendChild(card);
        card.style.display = 'block';
    });

    // Cacher les cartes non visibles
    cards.forEach(card => {
        if (!visibleCards.includes(card)) {
            card.style.display = 'none';
        }
    });

    // Afficher message si aucun résultat
    let emptyMsg = placesGrid.querySelector('.empty-state');
    if (visibleCards.length === 0) {
        if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-state col-span-full text-center py-16 text-gray-500 text-lg';
            placesGrid.appendChild(emptyMsg);
        }
        emptyMsg.textContent = 'Aucune location correspondant à vos critères';
        emptyMsg.style.display = 'block';
    } else {
        if (emptyMsg) emptyMsg.style.display = 'none';
    }
}

/**
 * Reset all filters
 */
function resetFilters() {
    document.getElementById('priceFilter').value = '';
    document.getElementById('sortPrice').value = '';
    document.getElementById('sortRating').value = '';
    document.getElementById('searchInput').value = '';
    applyFilters();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Show error message
 */
function showPlacesError(message) {
    const placesGrid = document.getElementById('placesGrid');
    if (placesGrid) {
        placesGrid.innerHTML = `<div class="col-span-full bg-red-50 text-red-600 p-4 rounded-lg text-center border border-red-200">${escapeHtml(message)}</div>`;
    }
}
