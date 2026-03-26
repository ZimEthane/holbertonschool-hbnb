/**
 * Login functionality for HBNB application
 * Handles form submission, API authentication, and token storage
 */

// API Configuration
const API_BASE_URL = '/api/v1';
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`;

let loginForm = null;
let emailInput = null;
let passwordInput = null;
let errorContainer = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('API URL:', LOGIN_ENDPOINT);
    initializeLoginForm();
    checkLoggedIn();
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

    // Store token in cookie (86400 = 24 heures)
    storeCookie(COOKIE_NAME, data.access_token, 86400);

    // Also store in localStorage as backup
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('isLoggedIn', 'true');

    // Clear error message
    if (errorContainer) {
        errorContainer.style.display = 'none';
        errorContainer.textContent = '';
    }

    // Show success message
    showSuccess('Connexion réussie! Redirection...');

    // Redirect to index after short delay
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 500);
}

/**
 * Store token in browser cookie
 */
function storeCookie(name, value, maxAge) {
    const date = new Date();
    date.setTime(date.getTime() + maxAge * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const path = 'path=/';
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; ${path}; SameSite=Lax`;
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
        alert(message);
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('API URL:', LOGIN_ENDPOINT);
    // Check if already logged in
    if (isUserLoggedIn()) {
        window.location.href = '/index.html';
        return;
    }
    initializeLoginForm();
});
