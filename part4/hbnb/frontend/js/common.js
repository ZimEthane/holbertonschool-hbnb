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
    localStorage.removeItem('userId');

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
        // User is logged in - change button to logout and add nav links
        headerLoginBtn.textContent = 'Déconnexion';
        headerLoginBtn.className = 'login-button logout';
        headerLoginBtn.onclick = logoutUser;

        // Add user nav links if not already there
        addUserNavLinks();
    } else {
        // User is not logged in - show login button
        headerLoginBtn.textContent = 'Connexion';
        headerLoginBtn.className = 'login-button';
        headerLoginBtn.onclick = () => {
            window.location.href = '/login.html';
        };

        // Remove user nav links if they exist
        removeUserNavLinks();
    }
}

/**
 * Add user navigation links (Profil, Mes Locations)
 */
function addUserNavLinks() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Check if links already exist
    if (document.getElementById('userNavLinks')) {
        return;
    }

    // Profil link
    const profileLink = document.createElement('a');
    profileLink.href = '/user-profile.html';
    profileLink.textContent = '👤 Profil';
    profileLink.style.color = 'white';
    profileLink.style.textDecoration = 'none';
    profileLink.style.fontWeight = '500';
    profileLink.style.padding = '0.5rem 1rem';
    profileLink.style.borderRadius = '8px';
    profileLink.style.transition = 'all 0.3s ease';

    profileLink.onmouseover = () => {
        profileLink.style.background = 'rgba(255, 255, 255, 0.1)';
    };
    profileLink.onmouseout = () => {
        profileLink.style.background = 'transparent';
    };

    // Mes Locations link
    const placesLink = document.createElement('a');
    placesLink.href = '/my-places.html';
    placesLink.textContent = '🏠 Mes Locations';
    placesLink.style.color = 'white';
    placesLink.style.textDecoration = 'none';
    placesLink.style.fontWeight = '500';
    placesLink.style.padding = '0.5rem 1rem';
    placesLink.style.borderRadius = '8px';
    placesLink.style.transition = 'all 0.3s ease';

    placesLink.onmouseover = () => {
        placesLink.style.background = 'rgba(255, 255, 255, 0.1)';
    };
    placesLink.onmouseout = () => {
        placesLink.style.background = 'transparent';
    };

    // Add a marker div to track that we added these links
    const marker = document.createElement('div');
    marker.id = 'userNavLinks';
    marker.style.display = 'none';

    // Insert links before the marker
    nav.appendChild(profileLink);
    nav.appendChild(placesLink);
    nav.appendChild(marker);
}

/**
 * Remove user navigation links
 */
function removeUserNavLinks() {
    const userNavLinks = document.getElementById('userNavLinks');
    if (userNavLinks) {
        userNavLinks.remove();
    }
}

// Initialize header login status when DOM is ready
document.addEventListener('DOMContentLoaded', initHeaderLoginStatus);


