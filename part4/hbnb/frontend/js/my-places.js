/**
 * My Places Page
 * Handles user places management (CRUD operations)
 */

const API_BASE_URL = getApiUrl();
let currentToken = null;
let currentUserId = null;
let allPlaces = [];
let allAmenities = [];
let editingPlaceId = null;
let map = null;
let marker = null;

function getApiUrl() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (hostname.includes('app.github.dev')) {
        const newHostname = hostname.replace(/(\d+)\.app\.github\.dev/, '5000.app.github.dev');
        return `${protocol}//${newHostname}`;
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }

    return `${protocol}//${hostname}:5000`;
}

function getToken() {
    // D'abord, chercher dans localStorage (priorité)
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
        return storedToken;
    }

    // Ensuite, chercher dans les cookies
    const name = 'access_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let cookie of cookieArray) {
        cookie = cookie.trim();
        if (cookie.indexOf(name) === 0) {
            const encodedToken = cookie.substring(name.length);
            // Décoder le token qui est encodé en URL
            return decodeURIComponent(encodedToken);
        }
    }
    return null;
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('My places page loaded');

    currentToken = getToken();
    currentUserId = localStorage.getItem('userId');

    console.log('Token:', currentToken ? '✓ Present' : '✗ Missing');
    console.log('UserId:', currentUserId);

    // Redirect to login if not authenticated
    if (!currentToken || !currentUserId) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = '/login.html';
        return;
    }

    setupEventListeners();
    await loadAmenities();
    await loadUserPlaces();
});

function setupEventListeners() {
    const addBtn = document.getElementById('addPlaceBtn');
    const emptyAddBtn = document.getElementById('emptyAddBtn');
    const cancelBtn = document.getElementById('cancelFormBtn');
    const form = document.getElementById('placeFormSubmit');
    const editForm = document.getElementById('editPlaceForm');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const searchBtn = document.getElementById('searchBtn');
    const locationSearch = document.getElementById('locationSearch');

    if (addBtn) addBtn.addEventListener('click', showAddForm);
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', showAddForm);
    if (cancelBtn) cancelBtn.addEventListener('click', hideAddForm);
    if (form) form.addEventListener('submit', handleAddPlace);
    if (editForm) editForm.addEventListener('submit', handleEditPlace);
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', hideModal);
    if (searchBtn) searchBtn.addEventListener('click', searchLocation);
    if (locationSearch) {
        locationSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchLocation();
            }
        });
    }
}

async function loadUserPlaces() {
    try {
        console.log('Loading user places...');

        const response = await fetch(`${API_BASE_URL}/api/v1/places/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des places');
        }

        const places = await response.json();

        // Filter places owned by current user
        allPlaces = places.filter(p => p.owner_id === currentUserId);

        displayPlaces();

    } catch (error) {
        console.error('Error loading places:', error);
        showError(`Erreur: ${error.message}`);
    }
}

async function loadAmenities() {
    try {
        console.log('Loading amenities...');

        const response = await fetch(`${API_BASE_URL}/api/v1/amenities/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des aménités');
        }

        allAmenities = await response.json();
        console.log('Amenities loaded:', allAmenities.length);
        displayAmenities();

    } catch (error) {
        console.error('Error loading amenities:', error);
    }
}

function displayAmenities() {
    const container = document.getElementById('amenitiesContainer');
    if (!container) return;

    if (allAmenities.length === 0) {
        container.innerHTML = '<p class="no-amenities">Aucune aménité disponible</p>';
        return;
    }

    const html = allAmenities.map(amenity => `
        <label class="amenity-checkbox">
            <input type="checkbox" name="amenities" value="${amenity.id}">
            <span>${escapeHtml(amenity.name)}</span>
        </label>
    `).join('');

    container.innerHTML = html;
}

function displayPlaces() {
    const placesList = document.getElementById('placesList');
    const emptyState = document.getElementById('emptyState');

    if (allPlaces.length === 0) {
        placesList.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    placesList.classList.remove('hidden');
    emptyState.classList.add('hidden');

    placesList.innerHTML = allPlaces.map(place => {
        const amenitiesHtml = place.amenities && place.amenities.length > 0
            ? `<div class="place-amenities">
                ${place.amenities.map(amenityId => {
                    const amenity = allAmenities.find(a => a.id === amenityId);
                    return amenity ? `<span class="amenity-tag">${escapeHtml(amenity.name)}</span>` : '';
                }).join('')}
                </div>`
            : '';

        return `
        <div class="place-item">
            <div class="place-item-header">
                <h3>${escapeHtml(place.title)}</h3>
                <div class="place-badges">
                    <span class="badge price">${place.price}€/nuit</span>
                </div>
            </div>

            <p class="place-description">${escapeHtml(place.description || '')}</p>

            ${amenitiesHtml}

            <div class="place-meta">
                <div class="meta-item">
                    <span class="label">Coordonnées:</span>
                    <span>${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}</span>
                </div>
            </div>

            <div class="place-actions">
                <a href="/place.html?id=${place.id}" class="btn-view">👁️ Voir</a>
                <button class="btn-edit" onclick="editPlace('${place.id}')">✏️ Modifier</button>
                <button class="btn-delete" onclick="deletePlace('${place.id}')">🗑️ Supprimer</button>
            </div>
        </div>
    `}).join('');
}

function showAddForm() {
    document.getElementById('addPlaceForm').classList.remove('hidden');

    // Initialize map on form show
    setTimeout(() => {
        initializeMap();
    }, 100);

    document.getElementById('cancelFormBtn').scrollIntoView({ behavior: 'smooth' });
}

// ==================== MAP INITIALIZATION ====================
function initializeMap() {
    const mapElement = document.getElementById('placeMap');
    if (!mapElement || map !== null) return;

    // Default center (Paris)
    const defaultLat = 48.8566;
    const defaultLng = 2.3522;

    // Initialize map
    map = L.map('placeMap').setView([defaultLat, defaultLng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Handle map clicks to set coordinates
    map.on('click', function(e) {
        setLocationFromMap(e.latlng.lat, e.latlng.lng);
    });

    // Add initial marker at default location
    setLocationFromMap(defaultLat, defaultLng);
}

function setLocationFromMap(lat, lng) {
    // Remove old marker
    if (marker) {
        map.removeLayer(marker);
    }

    // Add new marker
    marker = L.marker([lat, lng], {
        icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            shadowSize: [41, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowAnchor: [12, 41]
        })
    }).addTo(map);

    // Update input fields
    document.getElementById('placeLatitude').value = lat.toFixed(6);
    document.getElementById('placeLongitude').value = lng.toFixed(6);

    // Pan map to marker
    map.panTo([lat, lng]);
}

// ==================== LOCATION SEARCH ====================
async function searchLocation() {
    const searchInput = document.getElementById('locationSearch').value.trim();
    if (!searchInput) return;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&limit=5`
        );
        const results = await response.json();

        if (results.length === 0) {
            showSearchResults([]);
            return;
        }

        displaySearchResults(results);
    } catch (error) {
        console.error('Erreur de recherche:', error);
    }
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    if (results.length === 0) {
        resultsContainer.classList.add('hidden');
        return;
    }

    resultsContainer.innerHTML = results.map((result, index) => `
        <div class="search-result-item" onclick="selectSearchResult(${result.lat}, ${result.lon}, '${escapeHtml(result.display_name)}')">
            <strong>${escapeHtml(result.display_name.split(',')[0])}</strong>
            <br>
            <small style="color: #999;">${escapeHtml(result.display_name)}</small>
        </div>
    `).join('');

    resultsContainer.classList.remove('hidden');
}

function selectSearchResult(lat, lon, name) {
    // Mettre à jour la map et les coordonnées
    setLocationFromMap(lat, lon);

    // Mettre à jour le champ de recherche
    document.getElementById('locationSearch').value = name;

    // Masquer les résultats
    document.getElementById('searchResults').classList.add('hidden');
}

function hideAddForm() {
    document.getElementById('addPlaceForm').classList.add('hidden');
    document.getElementById('placeFormSubmit').reset();

    // Clean up map
    if (map) {
        map.remove();
        map = null;
        marker = null;
    }
}

async function handleAddPlace(e) {
    e.preventDefault();

    const title = document.getElementById('placeName').value.trim();
    const price = parseFloat(document.getElementById('placePrice').value);
    const description = document.getElementById('placeDescription').value.trim();
    const latitude = parseFloat(document.getElementById('placeLatitude').value);
    const longitude = parseFloat(document.getElementById('placeLongitude').value);

    // Get selected amenities
    const amenities = Array.from(document.querySelectorAll('input[name="amenities"]:checked'))
        .map(checkbox => checkbox.value);

    if (!title || !price || !description || !latitude || !longitude) {
        showError('Veuillez remplir tous les champs');
        return;
    }

    try {
        console.log('Creating place with token:', currentToken ? '✓' : '✗');

        const response = await fetch(`${API_BASE_URL}/api/v1/places/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                price,
                description,
                latitude,
                longitude,
                amenities
            })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.error || 'Erreur lors de la création');
        }

        showSuccess('✓ Location créée avec succès!');
        hideAddForm();
        await loadUserPlaces();

    } catch (error) {
        console.error('Error adding place:', error);
        showError(`Erreur: ${error.message}`);
    }
}

function editPlace(placeId) {
    const place = allPlaces.find(p => p.id === placeId);
    if (!place) return;

    editingPlaceId = placeId;

    // Populate form with place data
    document.getElementById('editPlaceName').value = place.title;
    document.getElementById('editPlacePrice').value = place.price;
    document.getElementById('editPlaceDescription').value = place.description || '';
    document.getElementById('editPlaceLatitude').value = place.latitude;
    document.getElementById('editPlaceLongitude').value = place.longitude;

    // Display amenities with place's current amenities checked
    displayEditAmenities(place.amenities || []);

    // Show modal
    document.getElementById('editPlaceModal').classList.remove('hidden');
}

function displayEditAmenities(selectedAmenityIds) {
    const container = document.getElementById('editAmenitiesContainer');
    if (!container) return;

    if (allAmenities.length === 0) {
        container.innerHTML = '<p class="no-amenities">Aucune aménité disponible</p>';
        return;
    }

    const html = allAmenities.map(amenity => {
        const isChecked = selectedAmenityIds.includes(amenity.id) ? 'checked' : '';
        return `
        <label class="amenity-checkbox">
            <input type="checkbox" name="editAmenities" value="${amenity.id}" ${isChecked}>
            <span>${escapeHtml(amenity.name)}</span>
        </label>
    `;
    }).join('');

    container.innerHTML = html;
}

function hideModal() {
    document.getElementById('editPlaceModal').classList.add('hidden');
    document.getElementById('editPlaceForm').reset();
    editingPlaceId = null;
}

async function handleEditPlace(e) {
    e.preventDefault();

    if (!editingPlaceId) return;

    const title = document.getElementById('editPlaceName').value.trim();
    const price = parseFloat(document.getElementById('editPlacePrice').value);
    const description = document.getElementById('editPlaceDescription').value.trim();
    const latitude = parseFloat(document.getElementById('editPlaceLatitude').value);
    const longitude = parseFloat(document.getElementById('editPlaceLongitude').value);

    // Get selected amenities
    const amenities = Array.from(document.querySelectorAll('input[name="editAmenities"]:checked'))
        .map(checkbox => checkbox.value);

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/places/${editingPlaceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                price,
                description,
                latitude,
                longitude,
                amenities
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la modification');
        }

        showSuccess('✓ Location mise à jour!');
        hideModal();
        await loadUserPlaces();

    } catch (error) {
        console.error('Error updating place:', error);
        showError(`Erreur: ${error.message}`);
    }
}

async function deletePlace(placeId) {
    const confirmed = confirm('⚠️ Êtes-vous certain de vouloir supprimer cette location?');
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/places/${placeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression');
        }

        showSuccess('✓ Location supprimée!');
        await loadUserPlaces();

    } catch (error) {
        console.error('Error deleting place:', error);
        showError(`Erreur: ${error.message}`);
    }
}

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

function showError(message) {
    console.error(message);
    alert(message);
}

function showSuccess(message) {
    console.log(message);
    // Peut être amélioré avec une notification toast
}
