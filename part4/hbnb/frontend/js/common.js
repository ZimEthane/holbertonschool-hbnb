/**
 * Common utilities for HBNB application
 */

const COOKIE_NAME = 'access_token';

/**
 * Get token from cookie
 */
function getTokenFromCookie() {
    const name = `${COOKIE_NAME}=`;
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
 * Check if user is logged in
 */
function isUserLoggedIn() {
    // Check cookie first (primary method)
    const token = getTokenFromCookie();
    if (token) {
        return true;
    }
    // Fallback to localStorage
    return localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Logout user
 */
function logoutUser() {
    // Clear cookie
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;

    // Clear localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('access_token');
    localStorage.removeItem('userEmail');

    // Redirect to login
    window.location.href = '/login.html';
}

/**
 * Initialize header login button status
 */
function initHeaderLoginStatus() {
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    if (!headerLoginBtn) return;

    headerLoginBtn.disabled = false;

    if (isUserLoggedIn()) {
        headerLoginBtn.textContent = 'Déconnexion';
        headerLoginBtn.className = 'login-button logout';
        headerLoginBtn.onclick = logoutUser;
    } else {
        headerLoginBtn.textContent = 'Connexion';
        headerLoginBtn.className = 'login-button';
        headerLoginBtn.onclick = () => {
            window.location.href = '/login.html';
        };
    }
}

// Initialize header login status when DOM is ready
document.addEventListener('DOMContentLoaded', initHeaderLoginStatus);

