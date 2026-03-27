/**
 * Admin Amenities Management page functionality for HBNB application
 * Handles CRUD operations for amenities (admin only)
 */

const API_BASE_URL = getApiUrl();
let currentToken = null;
let userIsAdmin = false;
let editingAmenityId = null;

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
 * Decode JWT to check if user is admin
 */
function isUserAdmin(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        return payload.is_admin === true;
    } catch (error) {
        console.error('Error decoding token:', error);
        return false;
    }
}

/**
 * Initialize page on load
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin Amenities page loaded');

    // Check authentication
    currentToken = getToken();
    if (!currentToken) {
        window.location.href = '/login.html';
        return;
    }

    // Check if user is admin
    userIsAdmin = isUserAdmin(currentToken);
    if (!userIsAdmin) {
        Swal.fire('Erreur!', '❌ Accès refusé! Cette page est réservée aux administrateurs.', 'error').then(() => {
            window.location.href = '/index.html';
        });
        return;
    }

    // Load amenities
    await loadAmenities();

    // Setup form
    setupAddForm();
});

/**
 * Load all amenities
 */
async function loadAmenities() {
    try {
        console.log('Fetching amenities...');

        const url = `${API_BASE_URL}/api/v1/amenities/`;
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
            throw new Error(`API Error: ${response.status}`);
        }

        const amenities = await response.json();
        console.log('Amenities received:', amenities);

        displayAmenities(amenities);

    } catch (error) {
        console.error('Error loading amenities:', error);
        showError(`Erreur: ${error.message}`);
    }
}

/**
 * Display amenities in grid
 */
function displayAmenities(amenities) {
    const container = document.getElementById('amenitiesContainer');
    const noAmenities = document.getElementById('noAmenities');
    const countBadge = document.getElementById('amenitiesCount');

    if (!amenities || amenities.length === 0) {
        container.classList.add('hidden');
        noAmenities.classList.remove('hidden');
        countBadge.textContent = '0';
        return;
    }

    container.classList.remove('hidden');
    noAmenities.classList.add('hidden');
    countBadge.textContent = amenities.length;

    const amenitiesHtml = amenities.map(amenity => `
        <div class="amenity-card">
            <div class="amenity-info">
                <h3>${escapeHtml(amenity.name)}</h3>
                <p class="amenity-id">ID: ${amenity.id.substring(0, 8)}...</p>
            </div>

            <div class="amenity-actions">
                <button class="edit-btn" onclick="openEditModal('${amenity.id}', '${escapeHtml(amenity.name)}')">
                    ✏️ Modifier
                </button>
                <button class="delete-btn" onclick="deleteAmenity('${amenity.id}')">
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = amenitiesHtml;
}

/**
 * Setup add form
 */
function setupAddForm() {
    const form = document.getElementById('addAmenityForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addAmenity();
    });
}

/**
 * Add amenity
 */
async function addAmenity() {
    try {
        const name = document.getElementById('amenityName').value.trim();

        if (!name) {
            Swal.fire('Attention!', 'Veuillez entrer un nom d\'aménité', 'warning');
            return;
        }

        const url = `${API_BASE_URL}/api/v1/amenities/`;
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ name: name })
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.error || 'Failed to add amenity');
        }

        const newAmenity = await response.json();
        console.log('Amenity added:', newAmenity);

        Swal.fire('Succès!', 'Aménité ajoutée avec succès!', 'success');
        document.getElementById('addAmenityForm').reset();
        await loadAmenities();

    } catch (error) {
        console.error('Error adding amenity:', error);
        Swal.fire('Erreur!', `Erreur: ${error.message}`, 'error');
    }
}

/**
 * Open edit modal
 */
function openEditModal(amenityId, amenityName) {
    editingAmenityId = amenityId;
    document.getElementById('editAmenityName').value = amenityName;
    document.getElementById('editModal').classList.remove('hidden');
}

/**
 * Close edit modal
 */
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    editingAmenityId = null;
    document.getElementById('editAmenityForm').reset();
}

/**
 * Setup edit form
 */
(function setupEditForm() {
    const form = document.getElementById('editAmenityForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitEditAmenity();
    });
})();

/**
 * Submit edit amenity
 */
async function submitEditAmenity() {
    if (!editingAmenityId) return;

    try {
        const name = document.getElementById('editAmenityName').value.trim();

        if (!name) {
            Swal.fire('Attention!', 'Veuillez entrer un nom d\'aménité', 'warning');
            return;
        }

        const url = `${API_BASE_URL}/api/v1/amenities/${editingAmenityId}`;
        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ name: name })
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.error || 'Failed to update amenity');
        }

        Swal.fire('Succès!', 'Aménité mise à jour avec succès!', 'success');
        closeEditModal();
        await loadAmenities();

    } catch (error) {
        console.error('Error updating amenity:', error);
        Swal.fire('Erreur!', `Erreur: ${error.message}`, 'error');
    }
}

/**
 * Delete amenity
 */
async function deleteAmenity(amenityId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette aménité?')) {
        return;
    }

    try {
        const url = `${API_BASE_URL}/api/v1/amenities/${amenityId}`;
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
            throw new Error(errorData.message || errorData.error || 'Failed to delete amenity');
        }

        Swal.fire('Succès!', 'Aménité supprimée avec succès!', 'success');
        await loadAmenities();

    } catch (error) {
        console.error('Error deleting amenity:', error);
        Swal.fire('Erreur!', `Erreur: ${error.message}`, 'error');
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
    const container = document.getElementById('amenitiesContainer');
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="color: #d32f2f; padding: 20px; text-align: center;">
                ${escapeHtml(message)}
            </div>
        `;
    }
}
