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
const MAX_PLACE_IMAGES = 6;
const MAX_IMAGE_SIZE_MB = 5;
let addPlaceImages = [];
let editPlaceImages = [];

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
    const addImagesInput = document.getElementById('placeImages');
    const editImagesInput = document.getElementById('editPlaceImages');
    const addImagesPreview = document.getElementById('placeImagesPreview');
    const editImagesPreview = document.getElementById('editPlaceImagesPreview');

    if (addBtn) addBtn.addEventListener('click', showAddForm);
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', showAddForm);
    if (cancelBtn) cancelBtn.addEventListener('click', hideAddForm);
    if (form) form.addEventListener('submit', handleAddPlace);
    if (editForm) editForm.addEventListener('submit', handleEditPlace);
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', hideModal);
    if (searchBtn) searchBtn.addEventListener('click', searchLocation);
    if (addImagesInput) addImagesInput.addEventListener('change', (e) => handleImagesSelection(e, 'add'));
    if (editImagesInput) editImagesInput.addEventListener('change', (e) => handleImagesSelection(e, 'edit'));
    if (addImagesPreview) addImagesPreview.addEventListener('click', (e) => handleImageRemoval(e, 'add'));
    if (editImagesPreview) editImagesPreview.addEventListener('click', (e) => handleImageRemoval(e, 'edit'));
    if (locationSearch) {
        locationSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchLocation();
            }
        });
    }

    renderImagePreviews('add');
    renderImagePreviews('edit');
}

async function handleImagesSelection(event, mode) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
        return;
    }

    const targetArray = mode === 'edit' ? editPlaceImages : addPlaceImages;
    const remainingSlots = MAX_PLACE_IMAGES - targetArray.length;

    if (remainingSlots <= 0) {
        showError(`Vous pouvez ajouter au maximum ${MAX_PLACE_IMAGES} images.`);
        event.target.value = '';
        return;
    }

    const filesToProcess = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
        showError(`Seulement ${remainingSlots} image(s) ajoutee(s). Limite: ${MAX_PLACE_IMAGES}.`);
    }

    for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) {
            showError(`Le fichier \"${file.name}\" n'est pas une image.`);
            continue;
        }

        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            showError(`\"${file.name}\" depasse ${MAX_IMAGE_SIZE_MB} Mo.`);
            continue;
        }

        try {
            const base64Image = await fileToBase64(file);
            targetArray.push(base64Image);
        } catch (error) {
            console.error('Erreur lecture image:', error);
            showError(`Impossible de lire \"${file.name}\".`);
        }
    }

    renderImagePreviews(mode);
    event.target.value = '';
}

function handleImageRemoval(event, mode) {
    const removeButton = event.target.closest('.remove-image-btn');
    if (!removeButton) {
        return;
    }

    const index = parseInt(removeButton.dataset.index, 10);
    if (Number.isNaN(index) || index < 0) {
        return;
    }

    const targetArray = mode === 'edit' ? editPlaceImages : addPlaceImages;
    targetArray.splice(index, 1);
    renderImagePreviews(mode);
}

function renderImagePreviews(mode) {
    const targetArray = mode === 'edit' ? editPlaceImages : addPlaceImages;
    const containerId = mode === 'edit' ? 'editPlaceImagesPreview' : 'placeImagesPreview';
    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    if (targetArray.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Aucune image selectionnee.</p>';
        return;
    }

    container.innerHTML = targetArray.map((image, index) => `
        <div class="relative bg-gray-200 rounded-lg overflow-hidden aspect-square">
            <img src="${image}" alt="Image ${index + 1}" class="w-full h-full object-cover">
            <button type="button" class="remove-image-btn absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors" data-index="${index}" aria-label="Retirer l'image">&times;</button>
        </div>
    `).join('');
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
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
        } catch (error) {
            return [];
        }
    }

    return [];
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
        allPlaces = places
            .filter(p => p.owner_id === currentUserId)
            .map(p => ({
                ...p,
                image_urls: normalizeImageUrls(p.image_urls)
            }));

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
        container.innerHTML = '<p class="text-gray-500 col-span-full">Aucune aménité disponible</p>';
        return;
    }

    const html = allAmenities.map(amenity => `
        <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input type="checkbox" name="amenities" value="${amenity.id}" class="w-4 h-4 text-red-500 rounded">
            <span class="text-gray-700 font-medium">${escapeHtml(amenity.name)}</span>
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
            ? `<div class="flex flex-wrap gap-2">
                ${place.amenities.map(amenityId => {
                    const amenity = allAmenities.find(a => a.id === amenityId);
                    return amenity ? `<span class="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">${escapeHtml(amenity.name)}</span>` : '';
                }).join('')}
                </div>`
            : '';

        return `
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            ${place.image_urls && place.image_urls.length > 0 ? `
                <div class="relative h-40 bg-gray-200 overflow-hidden">
                    <img src="${place.image_urls[0]}" alt="${escapeHtml(place.title)}" class="w-full h-full object-cover">
                </div>
            ` : ''}
            <div class="p-6">
                <div class="flex justify-between items-start gap-4 mb-3">
                    <h3 class="text-lg font-bold text-gray-900 flex-1">${escapeHtml(place.title)}</h3>
                    <span class="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-lg text-base font-semibold whitespace-nowrap">${place.price}€/nuit</span>
                </div>

                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${escapeHtml(place.description || '')}</p>

                ${amenitiesHtml}

                <div class="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    📍 ${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}
                </div>

                <div class="mt-4 flex gap-2">
                    <a href="/place.html?id=${place.id}" class="flex-1 text-center bg-gray-100 text-gray-900 font-semibold px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">👁️ Voir</a>
                    <button class="flex-1 bg-blue-500 text-white font-semibold px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm" onclick="editPlace('${place.id}')">✏️ Modifier</button>
                    <button class="flex-1 bg-red-500 text-white font-semibold px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm" onclick="deletePlace('${place.id}')">🗑️ Supprimer</button>
                </div>
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
        <div class="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors" onclick="selectSearchResult(${result.lat}, ${result.lon}, '${escapeHtml(result.display_name)}')">
            <strong class="text-gray-900 block">${escapeHtml(result.display_name.split(',')[0])}</strong>
            <small class="text-gray-500">${escapeHtml(result.display_name)}</small>
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
    addPlaceImages = [];
    renderImagePreviews('add');

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
                amenities,
                image_urls: addPlaceImages
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
    editPlaceImages = normalizeImageUrls(place.image_urls);
    renderImagePreviews('edit');

    // Display amenities with place's current amenities checked
    displayEditAmenities(place.amenities || []);

    // Show modal
    document.getElementById('editPlaceModal').classList.remove('hidden');
}

function displayEditAmenities(selectedAmenityIds) {
    const container = document.getElementById('editAmenitiesContainer');
    if (!container) return;

    if (allAmenities.length === 0) {
        container.innerHTML = '<p class="text-gray-500 col-span-full">Aucune aménité disponible</p>';
        return;
    }

    const html = allAmenities.map(amenity => {
        const isChecked = selectedAmenityIds.includes(amenity.id) ? 'checked' : '';
        return `
        <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input type="checkbox" name="editAmenities" value="${amenity.id}" ${isChecked} class="w-4 h-4 text-red-500 rounded">
            <span class="text-gray-700 font-medium">${escapeHtml(amenity.name)}</span>
        </label>
    `;
    }).join('');

    container.innerHTML = html;
}

function hideModal() {
    document.getElementById('editPlaceModal').classList.add('hidden');
    document.getElementById('editPlaceForm').reset();
    editPlaceImages = [];
    renderImagePreviews('edit');
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
                amenities,
                image_urls: editPlaceImages
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
    Swal.fire('Erreur!', message, 'error');
}

function showSuccess(message) {
    console.log(message);
    // Peut être amélioré avec une notification toast
}
