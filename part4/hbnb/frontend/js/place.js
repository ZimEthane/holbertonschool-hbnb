/**
 * Place details page functionality for HBNB application
 * Handles fetching and displaying detailed place information and reviews
 */

const API_BASE_URL = getApiUrl();
let placeId = null;
let currentToken = null;
let allAmenities = [];
let placeOwnerId = null;
let currentUserId = null;
let carouselImages = [];
let currentImageIndex = 0;

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
 * Extract place ID from URL query parameters
 */
function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/**
 * Initialize page on load
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Place details page loaded');
    console.log('API URL:', API_BASE_URL);

    // Get place ID from URL
    placeId = getPlaceIdFromURL();
    if (!placeId) {
        showError('Place ID not provided');
        return;
    }

    // Check authentication
    currentToken = getToken();
    currentUserId = localStorage.getItem('userId');
    updateAuthenticationUI();

    // Load amenities first
    await loadAmenities();

    // Load place details and reviews
    await loadPlaceDetails();
    await loadReviews();

    // Setup review form if authenticated
    if (currentToken) {
        setupReviewForm();
    }
});

/**
 * Update UI based on authentication status
 */
function updateAuthenticationUI() {
    const addReviewSection = document.getElementById('addReviewSection');
    const loginPrompt = document.getElementById('loginPrompt');

    if (currentToken) {
        // Check if user is the owner of the place
        if (placeOwnerId && currentUserId && placeOwnerId === currentUserId) {
            addReviewSection?.classList.add('hidden');
            loginPrompt?.classList.remove('hidden');
            loginPrompt.innerHTML = '<p class="text-center text-yellow-600 font-medium mb-4">⚠️ Vous ne pouvez pas ajouter un avis à votre propre location</p>';
        } else {
            addReviewSection?.classList.remove('hidden');
            loginPrompt?.classList.add('hidden');
        }
    } else {
        addReviewSection?.classList.add('hidden');
        loginPrompt?.classList.remove('hidden');
        loginPrompt.innerHTML = '<p class="text-center text-gray-600 mb-4">Vous devez être connecté pour ajouter un avis</p><div class="text-center"><a href="/login.html" class="inline-block bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 font-semibold transition-colors">Se connecter</a></div>';
    }
}

/**
 * Load all amenities from API
 */
async function loadAmenities() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/amenities/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            allAmenities = await response.json();
        }
    } catch (error) {
        console.error('Error loading amenities:', error);
    }
}

/**
 * Fetch and display place details
 */
async function loadPlaceDetails() {
    try {
        console.log('Fetching place details for ID:', placeId);

        const url = `${API_BASE_URL}/api/v1/places/${placeId}`;
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (currentToken) {
            options.headers['Authorization'] = `Bearer ${currentToken}`;
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const place = await response.json();
        console.log('Place details received:', place);

        // Store owner ID
        placeOwnerId = place.owner_id;

        displayPlaceDetails(place);

        // Update UI now that we know the owner
        updateAuthenticationUI();

    } catch (error) {
        console.error('Error loading place details:', error);
        showError(`Erreur: ${error.message}`);
    }
}

/**
 * Display place details in HTML
 */
function displayPlaceDetails(place) {
    const detailsContainer = document.getElementById('placeDetails');
    if (!detailsContainer) return;

    const title = place.title || 'Unnamed Place';
    const price = place.price || 'N/A';
    const description = place.description || 'No description available';
    const ownerName = place.owner_name || 'Unknown';
    const latitude = place.latitude || 'N/A';
    const longitude = place.longitude || 'N/A';
    carouselImages = normalizeImageUrls(place.image_urls);
    if (carouselImages.length === 0) {
        carouselImages = ['/images/logo.png'];
    }
    currentImageIndex = 0;

    // Build amenities HTML
    const amenitiesHtml = place.amenities && place.amenities.length > 0
        ? `<div class="border-t border-gray-200 pt-6">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">✨ Aménités</h4>
                <div class="flex flex-wrap gap-2">
                    ${place.amenities.map(amenityId => {
                        const amenity = allAmenities.find(a => a.id === amenityId);
                        return amenity ? `<span class="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-full border border-red-200">${escapeHtml(amenity.name)}</span>` : '';
                    }).join('')}
                </div>
            </div>`
        : '';

    const html = `
        <!-- Carousel Section -->
        <div class="relative bg-gray-100 rounded-t-lg overflow-hidden">
            <img id="placeHeroImage" src="${carouselImages[0]}" alt="${escapeHtml(title)}" class="w-full h-96 object-cover" onerror="this.src='/images/logo.png'">
            ${carouselImages.length > 1 ? `
                <button type="button" class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full transition-all z-10" onclick="changePlaceImage(-1)" aria-label="Image precedente">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full transition-all z-10" onclick="changePlaceImage(1)" aria-label="Image suivante">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
                <div id="placeHeroDots" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    ${carouselImages.map((_, index) => `
                        <button type="button" class="hero-dot w-2.5 h-2.5 rounded-full transition-all ${index === 0 ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'}" onclick="goToPlaceImage(${index})" aria-label="Aller a l'image ${index + 1}"></button>
                    `).join('')}
                </div>
            ` : ''}
        </div>

        <!-- Header Section -->
        <div class="border-b border-gray-200 px-6 md:px-8 py-6">
            <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 class="text-3xl md:text-4xl font-bold text-gray-900">${escapeHtml(title)}</h1>
                </div>
                <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-bold text-red-500">${price}€</span>
                    <span class="text-gray-600 font-medium">/nuit</span>
                </div>
            </div>
        </div>

        <!-- Info Grid Section -->
        <div class="px-6 md:px-8 py-8 space-y-6">
            <!-- Description -->
            <div class="border-b border-gray-200 pb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">📝 Description</h3>
                <p class="text-gray-700 leading-relaxed">${escapeHtml(description)}</p>
            </div>

            <!-- Owner & Location Grid -->
            <div class="grid md:grid-cols-2 gap-8 border-b border-gray-200 pb-6">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-3">👤 Propriétaire</h3>
                    <p class="text-gray-700">${escapeHtml(ownerName)}</p>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-3">📍 Localisation</h3>
                    <div class="text-gray-700 space-y-1">
                        <p><span class="font-medium">Latitude:</span> ${latitude}</p>
                        <p><span class="font-medium">Longitude:</span> ${longitude}</p>
                    </div>
                </div>
            </div>

            <!-- Amenities -->
            ${amenitiesHtml}
        </div>
    `;

    detailsContainer.innerHTML = html;
}

function normalizeImageUrls(imageUrls) {
    if (!imageUrls) {
        return [];
    }

    if (Array.isArray(imageUrls)) {
        return imageUrls.filter(url => typeof url === 'string' && url.trim() !== '');
    }

    if (typeof imageUrls === 'string') {
        try {
            const parsed = JSON.parse(imageUrls);
            if (Array.isArray(parsed)) {
                return parsed.filter(url => typeof url === 'string' && url.trim() !== '');
            }
        } catch {
            return [];
        }
    }

    return [];
}

function changePlaceImage(direction) {
    if (carouselImages.length <= 1) {
        return;
    }

    const total = carouselImages.length;
    currentImageIndex = (currentImageIndex + direction + total) % total;
    updatePlaceImageDisplay();
}

function goToPlaceImage(index) {
    if (index < 0 || index >= carouselImages.length) {
        return;
    }

    currentImageIndex = index;
    updatePlaceImageDisplay();
}

function updatePlaceImageDisplay() {
    const heroImage = document.getElementById('placeHeroImage');
    if (!heroImage || carouselImages.length === 0) {
        return;
    }

    heroImage.src = carouselImages[currentImageIndex] || '/images/logo.png';

    const dots = document.querySelectorAll('#placeHeroDots .hero-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentImageIndex);
    });
}

/**
 * Fetch and display reviews
 */
async function loadReviews() {
    try {
        console.log('Fetching reviews for place:', placeId);

        const url = `${API_BASE_URL}/api/v1/places/${placeId}/reviews`;
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (currentToken) {
            options.headers['Authorization'] = `Bearer ${currentToken}`;
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const reviews = await response.json();
        console.log('Reviews received:', reviews);

        displayReviews(reviews);

    } catch (error) {
        console.error('Error loading reviews:', error);
        // Ne pas afficher d'erreur, juste laisser vide
        displayReviews([]);
    }
}

/**
 * Display reviews in HTML
 */
function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;

    if (!reviews || reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-center text-gray-600 py-12">Aucun avis pour cette place. Soyez le premier!</p>';
        return;
    }

    const reviewsHtml = reviews.map(review => {
        const userAvatar = review.user_profile_picture || review.profile_picture || '/images/default-avatar.svg';
        return `
        <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-start gap-4">
                    <img src="${userAvatar}" alt="${escapeHtml(review.user_name || 'Utilisateur')}" class="w-12 h-12 rounded-full object-cover bg-gray-200" onerror="this.src='/images/default-avatar.svg'">
                    <div>
                        <p class="font-semibold text-gray-900">${escapeHtml(review.user_name || 'Utilisateur')}</p>
                        <p class="text-sm text-gray-600">${formatDate(review.created_at || new Date())}</p>
                    </div>
                </div>
                <div class="flex items-center gap-1 text-yellow-400">
                    <span class="text-lg">★</span>
                    <span class="font-semibold text-gray-900">${review.rating || 5}<span class="text-sm text-gray-600">/5</span></span>
                </div>
            </div>
            <p class="text-gray-700 leading-relaxed">${escapeHtml(review.text || review.comment || '')}</p>
        </div>
    `;
    }).join('');

    reviewsList.innerHTML = reviewsHtml;
}

/**
 * Setup review form submission
 */
function setupReviewForm() {
    const form = document.getElementById('addReviewForm');
    if (!form) return;

    // Update rating display
    const ratingInput = document.getElementById('reviewRating');
    if (ratingInput) {
        ratingInput.addEventListener('input', (e) => {
            document.getElementById('ratingValue').textContent = e.target.value;
        });
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rating = parseInt(document.getElementById('reviewRating').value);
        const comment = document.getElementById('reviewComment').value.trim();

        if (!comment) {
            Swal.fire('Attention!', 'Veuillez entrer un avis', 'warning');
            return;
        }

        await submitReview(rating, comment);
    });
}

/**
 * Submit review to API
 */
async function submitReview(rating, comment) {
    try {
        const url = `${API_BASE_URL}/api/v1/reviews/`;
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                rating: rating,
                text: comment,
                place_id: placeId
            })
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();

            // Check for ownership error
            if (response.status === 403) {
                throw new Error('⚠️ Vous ne pouvez pas ajouter un avis à votre propre location');
            }

            throw new Error(errorData.error || 'Failed to submit review');
        }

        Swal.fire('Succès!', 'Avis soumis avec succès!', 'success');
        document.getElementById('addReviewForm').reset();
        document.getElementById('reviewRating').value = 5;
        document.getElementById('ratingValue').textContent = '5';

        // Reload reviews
        await loadReviews();

    } catch (error) {
        console.error('Error submitting review:', error);
        Swal.fire('Erreur!', `Erreur: ${error.message}`, 'error');
    }
}

/**
 * Format date to French format
 */
function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return 'Date inconnue';
    }
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
function showError(message) {
    const detailsContainer = document.getElementById('placeDetails');
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <div class="text-center py-12 px-6">
                <div class="inline-block bg-red-50 border border-red-200 rounded-lg p-6">
                    <p class="text-red-600 font-medium">${escapeHtml(message)}</p>
                </div>
            </div>
        `;
    }
}
