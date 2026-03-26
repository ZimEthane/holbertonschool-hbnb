/**
 * Add review page functionality for HBNB application
 * Handles review submission for authenticated users only
 */

const API_BASE_URL = getApiUrl();
let selectedRating = 5;
let placeId = null;
let currentToken = null;

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
 * Check authentication and redirect if not logged in
 */
function checkAuthentication() {
    currentToken = getToken();
    placeId = getPlaceIdFromURL();

    if (!currentToken) {
        // Redirect to index if not authenticated
        window.location.href = '/index.html';
        return false;
    }

    if (!placeId) {
        showError('Aucune place sélectionnée');
        return false;
    }

    return true;
}

/**
 * Initialize page on load
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Add review page loaded');

    // Check authentication
    if (!checkAuthentication()) {
        return;
    }

    setupStarRating();
    setupReviewForm();
});

/**
 * Setup star rating interaction
 */
function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    const ratingDisplay = document.getElementById('ratingDisplay');

    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            ratingDisplay.textContent = `★ ${selectedRating}`;

            // Update active stars
            stars.forEach(s => {
                if (parseInt(s.dataset.rating) <= selectedRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });

        star.addEventListener('mouseover', function() {
            const hoverRating = parseInt(this.dataset.rating);
            stars.forEach(s => {
                if (parseInt(s.dataset.rating) <= hoverRating) {
                    s.style.color = 'var(--accent-color)';
                } else {
                    s.style.color = 'inherit';
                }
            });
        });
    });

    const container = document.getElementById('starsContainer');
    if (container) {
        container.addEventListener('mouseleave', function() {
            stars.forEach(s => {
                if (parseInt(s.dataset.rating) <= selectedRating) {
                    s.style.color = 'var(--accent-color)';
                } else {
                    s.style.color = 'inherit';
                }
            });
        });
    }
}

/**
 * Setup review form submission
 */
function setupReviewForm() {
    const form = document.getElementById('addReviewForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const comment = document.getElementById('reviewComment').value.trim();

        if (!comment) {
            showError('Veuillez entrer votre avis');
            return;
        }

        await submitReview(selectedRating, comment);
    });
}

/**
 * Submit review to API
 */
async function submitReview(rating, comment) {
    try {
        console.log('Submitting review for place:', placeId);

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

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erreur ${response.status}`);
        }

        const data = await response.json();
        console.log('Review submitted successfully:', data);

        showSuccess('Avis soumis avec succès!');

        // Reset form
        document.getElementById('addReviewForm').reset();
        selectedRating = 5;
        document.getElementById('ratingDisplay').textContent = '★ 5';

        // Update star display
        document.querySelectorAll('.star').forEach(s => {
            if (parseInt(s.dataset.rating) <= 5) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });

        // Redirect back after 2 seconds
        setTimeout(() => {
            window.location.href = `/place.html?id=${placeId}`;
        }, 2000);

    } catch (error) {
        console.error('Error submitting review:', error);
        showError(`Erreur: ${error.message}`);
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');

    if (successMsg) {
        successMsg.textContent = `✓ ${message}`;
        successMsg.classList.remove('hidden');
    }

    if (errorMsg) {
        errorMsg.classList.add('hidden');
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');

    if (errorMsg) {
        errorMsg.textContent = `✕ ${message}`;
        errorMsg.classList.remove('hidden');
    }

    if (successMsg) {
        successMsg.classList.add('hidden');
    }
}
