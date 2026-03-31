/**
 * Admin Dashboard page functionality for HBNB application
 * Displays statistics and analytics for administrators
 * Includes full user management (CRUD)
 */

const API_BASE_URL = getApiUrl();
let currentToken = null;
let allUsers = [];
let editingUserId = null;

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
    const cookieName = 'access_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let cookie of cookieArray) {
        cookie = cookie.trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length);
        }
    }

    return localStorage.getItem('access_token');
}

/**
 * Check admin access
 */
function checkAdminAccess() {
    const token = getToken();
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    currentToken = token;
    return true;
}

/**
 * Fetch all statistics data
 */
async function fetchAllStats() {
    try {
        const [users, places, reviews, amenities] = await Promise.all([
            fetch(`${API_BASE_URL}/api/v1/users/`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            }).then(r => r.ok ? r.json() : []),
            
            fetch(`${API_BASE_URL}/api/v1/places/`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            }).then(r => r.ok ? r.json() : []),
            
            fetch(`${API_BASE_URL}/api/v1/reviews/`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            }).then(r => r.ok ? r.json() : []),
            
            fetch(`${API_BASE_URL}/api/v1/amenities/`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            }).then(r => r.ok ? r.json() : [])
        ]);

        allUsers = users;
        return { users, places, reviews, amenities };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { users: [], places: [], reviews: [], amenities: [] };
    }
}

/**
 * Display main statistics
 */
function displayMainStats(stats) {
    document.getElementById('userCount').textContent = stats.users.length;
    document.getElementById('placeCount').textContent = stats.places.length;
    document.getElementById('reviewCount').textContent = stats.reviews.length;
    document.getElementById('amenityCount').textContent = stats.amenities.length;
}

/**
 * Display users table
 */
function displayUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">Aucun utilisateur</td></tr>';
        return;
    }

    const usersHtml = users.map(user => {
        const date = new Date(user.created_at);
        const formattedDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
        const role = user.is_admin ? '👑 Admin' : '👤 User';
        const roleBadge = user.is_admin 
            ? '<span class="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">👑 Admin</span>'
            : '<span class="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">👤 User</span>';
        
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3 px-4">
                    <div class="font-semibold text-gray-900">${escapeHtml(fullName)}</div>
                </td>
                <td class="py-3 px-4 text-gray-700">${escapeHtml(user.email)}</td>
                <td class="py-3 px-4 text-gray-600">${escapeHtml(user.phone || '-')}</td>
                <td class="py-3 px-4">${roleBadge}</td>
                <td class="py-3 px-4 text-gray-600 text-sm">${formattedDate}</td>
                <td class="py-3 px-4">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="openEditUserModal('${user.id}')" 
                                class="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                            ✏️ Modifier
                        </button>
                        <button onclick="deleteUser('${user.id}')" 
                                class="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = usersHtml;
}

/**
 * Open create user modal
 */
function openCreateUserModal() {
    editingUserId = null;
    document.getElementById('userModalTitle').textContent = 'Nouvel Utilisateur';
    document.getElementById('userForm').reset();
    document.getElementById('passwordField').style.display = 'block';
    document.getElementById('userPassword').required = true;
    document.getElementById('userModal').classList.remove('hidden');
}

/**
 * Open edit user modal
 */
function openEditUserModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    editingUserId = userId;
    document.getElementById('userModalTitle').textContent = 'Modifier l\'Utilisateur';
    document.getElementById('userFirstName').value = user.first_name || '';
    document.getElementById('userLastName').value = user.last_name || '';
    document.getElementById('userEmail').value = user.email || '';
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userIsAdmin').checked = user.is_admin || false;
    
    // Hide password field for edit
    document.getElementById('passwordField').style.display = 'none';
    document.getElementById('userPassword').required = false;
    
    document.getElementById('userModal').classList.remove('hidden');
}

/**
 * Close user modal
 */
function closeUserModal() {
    document.getElementById('userModal').classList.add('hidden');
    document.getElementById('userForm').reset();
    editingUserId = null;
}

/**
 * Setup user form
 */
function setupUserForm() {
    const form = document.getElementById('userForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            first_name: document.getElementById('userFirstName').value.trim(),
            last_name: document.getElementById('userLastName').value.trim(),
            email: document.getElementById('userEmail').value.trim(),
            phone: document.getElementById('userPhone').value.trim() || null,
            is_admin: document.getElementById('userIsAdmin').checked
        };

        // Add password only for new users
        if (!editingUserId) {
            userData.password = document.getElementById('userPassword').value;
        }

        if (editingUserId) {
            await updateUser(editingUserId, userData);
        } else {
            await createUser(userData);
        }
    });
}

/**
 * Create user
 */
async function createUser(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            await Swal.fire({
                icon: 'success',
                title: 'Utilisateur créé !',
                text: 'L\'utilisateur a été créé avec succès.',
                timer: 2000,
                showConfirmButton: false
            });
            closeUserModal();
            await refreshData();
        } else {
            const error = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.message || 'Impossible de créer l\'utilisateur.'
            });
        }
    } catch (error) {
        console.error('Error creating user:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la création.'
        });
    }
}

/**
 * Update user
 */
async function updateUser(userId, userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            await Swal.fire({
                icon: 'success',
                title: 'Utilisateur modifié !',
                text: 'Les modifications ont été enregistrées.',
                timer: 2000,
                showConfirmButton: false
            });
            closeUserModal();
            await refreshData();
        } else {
            const error = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.message || 'Impossible de modifier l\'utilisateur.'
            });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la modification.'
        });
    }
}

/**
 * Delete user
 */
async function deleteUser(userId) {
    const result = await Swal.fire({
        title: 'Confirmer la suppression',
        text: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            await Swal.fire({
                icon: 'success',
                title: 'Utilisateur supprimé !',
                text: 'L\'utilisateur a été supprimé avec succès.',
                timer: 2000,
                showConfirmButton: false
            });
            await refreshData();
        } else {
            const error = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.message || 'Impossible de supprimer l\'utilisateur.'
            });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la suppression.'
        });
    }
}

/**
 * Refresh all data
 */
async function refreshData() {
    const stats = await fetchAllStats();
    displayMainStats(stats);
    displayUsersTable(stats.users);
}

/**
 * Display financial statistics
 */
function displayFinancialStats(stats) {
    const places = stats.places;
    const reviews = stats.reviews;

    // Prix moyen (le champ est "price" pas "price_per_night")
    if (places.length > 0) {
        const avgPrice = places.reduce((sum, place) => sum + (place.price || 0), 0) / places.length;
        document.getElementById('avgPrice').textContent = `${avgPrice.toFixed(0)} €`;
    } else {
        document.getElementById('avgPrice').textContent = '0 €';
    }

    // Revenu potentiel total
    const totalRevenue = places.reduce((sum, place) => sum + (place.price || 0), 0);
    document.getElementById('totalRevenue').textContent = `${totalRevenue.toFixed(0)} €`;

    // Notation moyenne
    if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length;
        document.getElementById('avgRating').textContent = `${avgRating.toFixed(1)} ⭐`;
    } else {
        document.getElementById('avgRating').textContent = 'N/A';
    }
}

/**
 * Display top rated places
 */
async function displayTopPlaces(places, reviews) {
    const container = document.getElementById('topPlacesContainer');
    
    if (places.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-600 py-8">Aucune location disponible</p>';
        return;
    }

    // Calculer les notes moyennes pour chaque place
    const placesWithRatings = places.map(place => {
        const placeReviews = reviews.filter(r => r.place_id === place.id);
        const avgRating = placeReviews.length > 0
            ? placeReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / placeReviews.length
            : 0;
        return { ...place, avgRating, reviewCount: placeReviews.length };
    });

    // Trier par note moyenne (descendant) et prendre les 5 premiers
    const topPlaces = placesWithRatings
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 5);

    if (topPlaces.every(p => p.avgRating === 0)) {
        container.innerHTML = '<p class="text-center text-gray-600 py-8">Aucun avis disponible</p>';
        return;
    }

    const placesHtml = topPlaces.map((place, index) => `
        <div class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
            <div class="flex items-center gap-3 flex-1">
                <span class="text-lg font-bold text-gray-400">#${index + 1}</span>
                <div class="flex-1">
                    <h3 class="font-semibold text-gray-900">${escapeHtml(place.title)}</h3>
                    <p class="text-xs text-gray-500">${place.reviewCount} avis</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-lg font-bold text-yellow-600">${place.avgRating > 0 ? place.avgRating.toFixed(1) : 'N/A'} ⭐</p>
                <p class="text-xs text-gray-600">${place.price || 0}€/nuit</p>
            </div>
        </div>
    `).join('');

    container.innerHTML = placesHtml;
}

/**
 * Display recent reviews
 */
async function displayRecentReviews(reviews) {
    const container = document.getElementById('recentReviewsContainer');
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-600 py-8">Aucun avis disponible</p>';
        return;
    }

    // Trier par date (les plus récents en premier) et prendre les 5 premiers
    const recentReviews = reviews
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    const reviewsHtml = recentReviews.map(review => {
        const date = new Date(review.created_at);
        const formattedDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        
        return `
            <div class="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-yellow-500 font-bold">${'⭐'.repeat(review.rating || 0)}</span>
                        <span class="text-xs text-gray-500">${formattedDate}</span>
                    </div>
                </div>
                <p class="text-sm text-gray-700 line-clamp-2">${escapeHtml(review.text || 'Aucun commentaire')}</p>
            </div>
        `;
    }).join('');

    container.innerHTML = reviewsHtml;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize dashboard
 */
async function initDashboard() {
    console.log('Admin Dashboard page loaded');
    console.log('API URL:', API_BASE_URL);

    // Check admin access
    if (!checkAdminAccess()) {
        return;
    }

    // Setup forms
    setupUserForm();

    // Fetch all data
    console.log('Fetching dashboard data...');
    const stats = await fetchAllStats();
    console.log('Dashboard data received:', stats);

    // Display all sections
    displayMainStats(stats);
    displayUsersTable(stats.users);
    displayFinancialStats(stats);
    await displayTopPlaces(stats.places, stats.reviews);
    await displayRecentReviews(stats.reviews);

    console.log('Dashboard loaded successfully');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);
