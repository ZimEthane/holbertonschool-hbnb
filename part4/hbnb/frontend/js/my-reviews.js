/**
 * My Reviews page functionality for HBNB application
 * Handles fetching, editing and deleting user reviews
 */

const API_BASE_URL = getApiUrl();
let currentToken = null;
let editingReviewId = null;

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
 * Logout user
 */
function logout() {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/index.html';
}

/**
 * Initialize page on load
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('My Reviews page loaded');

    // Check authentication
    currentToken = getToken();
    if (!currentToken) {
        window.location.href = '/login.html';
        return;
    }

    // Load user reviews
    await loadMyReviews();

    // Setup edit form
    setupEditForm();
});

/**
 * Load user reviews from API
 */
async function loadMyReviews() {
    try {
        console.log('Fetching user reviews...');

        const url = `${API_BASE_URL}/api/v1/reviews/user/my-reviews`;
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            throw new Error(`API Error: ${response.status}`);
        }

        const reviews = await response.json();
        console.log('User reviews received:', reviews);

        displayReviews(reviews);

    } catch (error) {
        console.error('Error loading reviews:', error);
        showError(`Erreur: ${error.message}`);
    }
}

/**
 * Display reviews in grid
 */
function displayReviews(reviews) {
    const container = document.getElementById('reviewsContainer');
    const noReviews = document.getElementById('noReviews');

    if (!reviews || reviews.length === 0) {
        container.classList.add('hidden');
        noReviews.classList.remove('hidden');
        return;
    }

    container.classList.remove('hidden');
    noReviews.classList.add('hidden');

    const reviewsHtml = reviews.map(review => `
        <div class="review-item">
            <div class="review-place-info">
                <h3>${escapeHtml(review.place_title || 'Unknown Place')}</h3>
                <p class="review-meta">Avis le ${formatDate(review.created_at || new Date())}</p>
            </div>

            <div class="review-rating">
                <span class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                <span class="rating-number">${review.rating}/5</span>
            </div>

            <div class="review-text">
                <p>${escapeHtml(review.text)}</p>
            </div>

            <div class="review-actions">
                <button class="edit-btn" onclick="openEditModal('${review.id}', '${escapeHtml(review.place_title)}', ${review.rating}, '${escapeHtml(review.text)}')">
                    ✏️ Modifier
                </button>
                <button class="delete-btn" onclick="deleteReview('${review.id}')">
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = reviewsHtml;
}

/**
 * Open edit modal
 */
function openEditModal(reviewId, placeTitle, rating, text) {
    editingReviewId = reviewId;
    document.getElementById('editPlace').value = placeTitle;
    document.getElementById('editRating').value = rating;
    document.getElementById('editRatingValue').textContent = rating;
    document.getElementById('editText').value = text;
    document.getElementById('editModal').classList.remove('hidden');
}

/**
 * Close edit modal
 */
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    editingReviewId = null;
    document.getElementById('editReviewForm').reset();
}

/**
 * Setup edit form submission
 */
function setupEditForm() {
    const form = document.getElementById('editReviewForm');
    const ratingInput = document.getElementById('editRating');

    // Update rating display
    if (ratingInput) {
        ratingInput.addEventListener('input', (e) => {
            document.getElementById('editRatingValue').textContent = e.target.value;
        });
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitEditedReview();
    });
}

/**
 * Submit edited review
 */
async function submitEditedReview() {
    if (!editingReviewId) return;

    try {
        const rating = parseInt(document.getElementById('editRating').value);
        const text = document.getElementById('editText').value.trim();

        if (!text) {
            alert('Veuillez entrer un avis');
            return;
        }

        const url = `${API_BASE_URL}/api/v1/reviews/${editingReviewId}`;
        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                rating: rating,
                text: text,
                place_id: 'dummy'  // Required field but not used in update
            })
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update review');
        }

        alert('Avis mis à jour avec succès!');
        closeEditModal();
        await loadMyReviews();

    } catch (error) {
        console.error('Error updating review:', error);
        alert(`Erreur: ${error.message}`);
    }
}

/**
 * Delete review with confirmation
 */
async function deleteReview(reviewId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis?')) {
        return;
    }

    try {
        const url = `${API_BASE_URL}/api/v1/reviews/${reviewId}`;
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete review');
        }

        alert('Avis supprimé avec succès!');
        await loadMyReviews();

    } catch (error) {
        console.error('Error deleting review:', error);
        alert(`Erreur: ${error.message}`);
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
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Show error message
 */
function showError(message) {
    const container = document.getElementById('reviewsContainer');
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="color: #d32f2f; padding: 20px; text-align: center;">
                ${escapeHtml(message)}
            </div>
        `;
    }
}
