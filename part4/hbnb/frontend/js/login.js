/**
 * Login functionality for HBNB application
 * Handles form submission, API authentication, and token storage
 */

/**
 * Auto-détecte l'URL de l'API selon l'environnement
 */
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

// API Configuration
const API_BASE_URL = getApiUrl();
const LOGIN_ENDPOINT = `${API_BASE_URL}/api/v1/auth/login`;

let loginForm = null;
let emailInput = null;
let passwordInput = null;
let errorContainer = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Login page loaded');
    console.log('API URL:', LOGIN_ENDPOINT);

    checkLoggedIn();
    initializeLoginForm();
});

/**
 * Initialize the login form and attach event listeners
 */
function initializeLoginForm() {
    loginForm = document.getElementById('loginForm');

    if (!loginForm) {
        console.warn('Login form not found');
        return;
    }

    emailInput = document.getElementById('email');
    passwordInput = document.getElementById('password');

    // Create error container for messages
    errorContainer = document.querySelector('.error-message');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.style.display = 'none';
        loginForm.insertBefore(errorContainer, loginForm.firstChild);
    }

    // Attach submit event listener
    loginForm.addEventListener('submit', handleLoginSubmit);
}

/**
 * Handle login form submission
 */
async function handleLoginSubmit(event) {
    event.preventDefault();

    const email = emailInput?.value?.trim();
    const password = passwordInput?.value;

    // Validate inputs
    if (!email || !password) {
        showError('Veuillez remplir tous les champs');
        return;
    }

    // Disable submit button during request
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Connexion en cours...';

    try {
        console.log('Sending login request to:', LOGIN_ENDPOINT);

        const response = await fetch(LOGIN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Login successful');
            handleLoginSuccess(data);
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.error || 'Erreur d\'authentification';
            console.error('Login failed:', errorMessage);
            showError(errorMessage);
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Erreur de connexion: ' + error.message);
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Handle successful login
 */
function handleLoginSuccess(data) {
    if (!data.access_token) {
        showError('Token non reçu du serveur');
        return;
    }

    // Extract user ID from JWT token
    const userId = extractUserIdFromToken(data.access_token);
    if (!userId) {
        showError('Impossible de récupérer l\'ID utilisateur');
        return;
    }

    console.log('Storing token and user ID...');

    // Store token in cookie (86400 = 24 heures)
    const date = new Date();
    date.setTime(date.getTime() + 86400 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const path = 'path=/';
    document.cookie = `access_token=${encodeURIComponent(data.access_token)}; ${expires}; ${path}; SameSite=Lax`;

    // Also store in localStorage as backup
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', userId);

    console.log('Stored user ID:', userId);

    // Clear error message
    if (errorContainer) {
        errorContainer.style.display = 'none';
        errorContainer.textContent = '';
    }

    // Show success message
    showSuccess('✓ Connexion réussie! Redirection...');

    // Redirect to index after short delay
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 500);
}

/**
 * Extract user ID from JWT token
 */
function extractUserIdFromToken(token) {
    try {
        // Split token into parts
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }

        // Decode payload (second part)
        const payload = parts[1];
        const decoded = JSON.parse(atob(payload));

        // Extract "sub" which is the user ID
        console.log('Decoded JWT:', decoded);
        return decoded.sub;
    } catch (error) {
        console.error('Error extracting user ID from token:', error);
        return null;
    }
}

/**
 * Display error message
 */
function showError(message) {
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.className = 'error-message error';
        errorContainer.style.display = 'block';
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorContainer.style.display === 'block') {
                errorContainer.style.display = 'none';
            }
        }, 5000);
    } else {
        console.error('Error:', message);
        Swal.fire('Erreur!', message, 'error');
    }
}

/**
 * Display success message
 */
function showSuccess(message) {
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.className = 'success-message';
        errorContainer.style.display = 'block';
    } else {
        console.log('Success:', message);
    }
}

/**
 * Check if user is already logged in
 */
function checkLoggedIn() {
    const token = getTokenFromCookie();
    if (token) {
        console.log('User already logged in, redirecting to index');
        window.location.href = '/index.html';
    }
}

/**
 * Get token from cookie
 */
function getTokenFromCookie() {
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
