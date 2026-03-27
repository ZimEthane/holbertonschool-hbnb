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
            loginPrompt.innerHTML = '<p>⚠️ Vous ne pouvez pas ajouter un avis à votre propre location</p>';
        } else {
            addReviewSection?.classList.remove('hidden');
            loginPrompt?.classList.add('hidden');
        }
    } else {
        addReviewSection?.classList.add('hidden');
        loginPrompt?.classList.remove('hidden');
        loginPrompt.innerHTML = '<p>Vous devez être connecté pour ajouter un avis</p><a href="/login.html" class="login-button">Se connecter</a>';
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

    // Build amenities HTML
    const amenitiesHtml = place.amenities && place.amenities.length > 0
        ? `<div class="info-block">
                <h4>Aménités</h4>
                <div class="amenities-list">
                    ${place.amenities.map(amenityId => {
                        const amenity = allAmenities.find(a => a.id === amenityId);
                        return amenity ? `<span class="amenity-tag">${escapeHtml(amenity.name)}</span>` : '';
                    }).join('')}
                </div>
            </div>`
        : '';

    const html = `
        <div class="place-hero">
            <img src="/images/logo.png" alt="${escapeHtml(title)}" class="place-hero-image">
        </div>

        <div class="place-header">
            <h1>${escapeHtml(title)}</h1>
            <div class="place-price-tag">${price}€ <span>/nuit</span></div>
        </div>

        <div class="place-info-grid">
            <div class="info-block">
                <h4>Description</h4>
                <p>${escapeHtml(description)}</p>
            </div>

            <div class="info-block">
                <h4>Propriétaire</h4>
                <p>${escapeHtml(ownerName)}</p>
            </div>

            <div class="info-block">
                <h4>Localisation</h4>
                <p>Latitude: ${latitude}</p>
                <p>Longitude: ${longitude}</p>
            </div>

            ${amenitiesHtml}
        </div>
    `;

    detailsContainer.innerHTML = html;
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
        reviewsList.innerHTML = '<p class="no-reviews">Aucun avis pour cette place. Soyez le premier!</p>';
        return;
    }

    const reviewsHtml = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <span class="review-author">${escapeHtml(review.user_name || 'Utilisateur')}</span>
                <span class="review-rating">★ ${review.rating || 5}<span>/5</span></span>
            </div>
            <p class="review-comment">${escapeHtml(review.text || review.comment || '')}</p>
            <p class="review-date">${formatDate(review.created_at || new Date())}</p>
        </div>
    `).join('');

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
            <div class="error-message" style="color: #d32f2f; padding: 20px; text-align: center;">
                ${escapeHtml(message)}
            </div>
        `;
    }
}
