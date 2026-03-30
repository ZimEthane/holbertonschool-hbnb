/**
 * User Profile Page
 * Handles user profile editing and management
 */

const API_BASE_URL = getApiUrl();
let currentUser = null;
let currentToken = null;

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

function getCurrentUserId() {
    // Stocké dans localStorage lors du login
    return localStorage.getItem('userId');
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Profile page loaded');

    currentToken = getToken();

    // Redirect to login if not authenticated
    if (!currentToken) {
        window.location.href = '/login.html';
        return;
    }

    // Load user data
    await loadUserProfile();
    await loadUserStats();
    setupEventListeners();
});

async function loadUserProfile() {
    try {
        const userId = getCurrentUserId();
        if (!userId) {
            showMessage('Erreur: ID utilisateur non trouvé', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Impossible de charger le profil');
        }

        currentUser = await response.json();
        populateForm();

    } catch (error) {
        console.error('Error loading profile:', error);
        showMessage(`Erreur: ${error.message}`, 'error');
    }
}

function populateForm() {
    if (!currentUser) return;

    document.getElementById('firstName').value = currentUser.first_name || '';
    document.getElementById('lastName').value = currentUser.last_name || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('phone').value = currentUser.phone || '';
    document.getElementById('displayName').textContent = `${currentUser.first_name} ${currentUser.last_name}`;
    document.getElementById('displayEmail').textContent = currentUser.email;

    if (currentUser.photo_url) {
        document.getElementById('avatarDisplay').src = currentUser.photo_url;
    }
}

function calculateStats() {
    // Jours depuis création du compte
    const createdDate = new Date(currentUser.created_at || new Date());
    const today = new Date();
    const days = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
    document.getElementById('accountAge').textContent = days;
}

async function loadUserStats() {
    try {
        const userId = getCurrentUserId();
        if (!userId) return;

        // Load user's places
        const placesResponse = await fetch(`${API_BASE_URL}/api/v1/places/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Accept': 'application/json'
            }
        });

        if (placesResponse.ok) {
            const places = await placesResponse.json();
            const userPlaces = places.filter(p => p.owner_id === userId);
            document.getElementById('placesCount').textContent = userPlaces.length;
        }

        // Load user's reviews
        const reviewsResponse = await fetch(`${API_BASE_URL}/api/v1/reviews/user/my-reviews`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Accept': 'application/json'
            }
        });

        if (reviewsResponse.ok) {
            const reviews = await reviewsResponse.json();
            document.getElementById('reviewsCount').textContent = reviews.length;
        }

        // Calculate account age
        calculateStats();

    } catch (error) {
        console.error('Error loading user stats:', error);
        // Keep default values if error
        calculateStats();
    }
}

function setupEventListeners() {
    const profileForm = document.getElementById('profileForm');
    const deleteBtn = document.getElementById('deleteAccountBtn');
    const avatarInput = document.getElementById('avatarInput');

    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteAccount);
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!firstName || !lastName || !email) {
        showMessage('Veuillez remplir tous les champs requis', 'error');
        return;
    }

    try {
        const userId = getCurrentUserId();
        const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la mise à jour');
        }

        const updatedUser = await response.json();
        currentUser = updatedUser;
        populateForm();
        showMessage('✓ Profil mis à jour avec succès!', 'success');

    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage(`Erreur: ${error.message}`, 'error');
    }
}

async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const base64Image = event.target.result;

        try {
            const userId = getCurrentUserId();
            const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${currentToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    photo_url: base64Image
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors du téléchargement de l\'avatar');
            }

            const updatedUser = await response.json();
            currentUser = updatedUser;
            document.getElementById('avatarDisplay').src = base64Image;
            showMessage('✓ Avatar mis à jour avec succès!', 'success');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showMessage(`Erreur: ${error.message}`, 'error');
        }
    };
    reader.readAsDataURL(file);
}

async function handleDeleteAccount() {
    const confirmed = confirm(
        '⚠️ Êtes-vous certain de vouloir supprimer votre compte?\n\n' +
        'Cela supprimera également toutes vos locations et données.\n\n' +
        'Cette action ne peut pas être annulée.'
    );

    if (!confirmed) return;

    const doubleConfirm = prompt(
        'Entrez votre email pour confirmer la suppression:\n' + currentUser.email
    );

    if (doubleConfirm !== currentUser.email) {
        showMessage('Email incorrect. Suppression annulée.', 'error');
        return;
    }

    try {
        const userId = getCurrentUserId();
        const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression');
        }

        // Clear auth data
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');

        showMessage('✓ Compte supprimé. Redirection...', 'success');

        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2000);

    } catch (error) {
        console.error('Error deleting account:', error);
        showMessage(`Erreur: ${error.message}`, 'error');
    }
}

function showMessage(message, type = 'error') {
    const msgEl = document.getElementById('profileMessage');
    msgEl.textContent = message;
    msgEl.className = `message ${type}`;
    msgEl.classList.remove('hidden');

    setTimeout(() => {
        msgEl.classList.add('hidden');
    }, 5000);
}
