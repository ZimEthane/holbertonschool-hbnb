/**
 * Index page functionality for HBNB application
 * Handles listing places, filtering, and user authentication
 */

const API_BASE_URL = getApiUrl();
const PLACES_ENDPOINT = `${API_BASE_URL}/api/v1/places/`;

let allPlaces = [];

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
 * Initialize price filter event listener
 */
function initPriceFilter() {
    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter) {
        priceFilter.addEventListener('change', (event) => {
            filterPlacesByPrice(event.target.value);
        });
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

        const response = await fetch(PLACES_ENDPOINT, options);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Places data received:', data);

        // Handle different response formats
        if (Array.isArray(data)) {
            allPlaces = data;
        } else if (data.places && Array.isArray(data.places)) {
            allPlaces = data.places;
        } else {
            console.warn('Unexpected data format:', data);
            allPlaces = [];
        }

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
    card.className = 'group cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-red-300 border border-gray-100 rounded-xl overflow-hidden';
    card.id = `place-${place.id}`;

    // Utilise 'price' au lieu de 'price_per_night'
    const priceValue = parseFloat(place.price) || 0;
    card.dataset.price = priceValue;

    const name = place.title || place.name || 'Unnamed Place';
    const price = priceValue;
    const description = place.description || '';
    const imageUrl = getPlaceImage(place);

    card.innerHTML = `
        <div class="relative overflow-hidden">
            <img src="${imageUrl}" alt="${escapeHtml(name)}" class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='/images/logo.png'">
            <div class="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md">
                <span class="font-semibold text-red-500">${price}€</span><span class="text-gray-600 text-sm">/nuit</span>
            </div>
        </div>
        <div class="p-4">
            <h3 class="font-semibold text-gray-900 line-clamp-2 mb-2">${escapeHtml(name)}</h3>
            ${description ? `<p class="text-gray-600 text-sm line-clamp-2 mb-4">${escapeHtml(description)}</p>` : '<div class="mb-4"></div>'}
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
 * Filter places by price
 */
function filterPlacesByPrice(maxPrice) {
    console.log('Filtering by price:', maxPrice);

    const placesGrid = document.getElementById('placesGrid');
    const cards = placesGrid.querySelectorAll('.place-card');

    cards.forEach(card => {
        const price = parseFloat(card.dataset.price);

        if (!maxPrice) {
            // Show all if no filter selected
            card.style.display = 'block';
        } else {
            const max = parseFloat(maxPrice);
            // Show only if price is less than or equal to max
            card.style.display = price <= max ? 'block' : 'none';
        }
    });
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
