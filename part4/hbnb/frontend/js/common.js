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
 * Check if user is admin from JWT
 */
function isUserAdmin() {
    const token = getTokenFromCookie();
    if (!token) return false;

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
 * Add user navigation links (Profil, Mes Locations, Mes Avis, + Admin si admin)
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

    // Mes Avis link
    const reviewsLink = document.createElement('a');
    reviewsLink.href = '/my-reviews.html';
    reviewsLink.textContent = '📝 Mes Avis';
    reviewsLink.style.color = 'white';
    reviewsLink.style.textDecoration = 'none';
    reviewsLink.style.fontWeight = '500';
    reviewsLink.style.padding = '0.5rem 1rem';
    reviewsLink.style.borderRadius = '8px';
    reviewsLink.style.transition = 'all 0.3s ease';

    reviewsLink.onmouseover = () => {
        reviewsLink.style.background = 'rgba(255, 255, 255, 0.1)';
    };
    reviewsLink.onmouseout = () => {
        reviewsLink.style.background = 'transparent';
    };

    // Add a marker div to track that we added these links
    const marker = document.createElement('div');
    marker.id = 'userNavLinks';
    marker.style.display = 'none';

    // Insert links before the marker
    nav.appendChild(profileLink);
    nav.appendChild(placesLink);
    nav.appendChild(reviewsLink);

    // Admin link - only for admins
    if (isUserAdmin()) {
        const adminLink = document.createElement('a');
        adminLink.href = '/admin-amenities.html';
        adminLink.textContent = '⚙️ Aménités';
        adminLink.style.color = 'white';
        adminLink.style.textDecoration = 'none';
        adminLink.style.fontWeight = '500';
        adminLink.style.padding = '0.5rem 1rem';
        adminLink.style.borderRadius = '8px';
        adminLink.style.transition = 'all 0.3s ease';
        adminLink.style.background = 'rgba(255, 152, 0, 0.3)';

        adminLink.onmouseover = () => {
            adminLink.style.background = 'rgba(255, 152, 0, 0.5)';
        };
        adminLink.onmouseout = () => {
            adminLink.style.background = 'rgba(255, 152, 0, 0.3)';
        };

        nav.appendChild(adminLink);
    }

    nav.appendChild(marker);
}

// Initialize header login status when DOM is ready
document.addEventListener('DOMContentLoaded', initHeaderLoginStatus);

/**
 * Initialize hamburger menu for mobile responsiveness
 */
function initHamburgerMenu() {
    const header = document.querySelector('header');
    if (!header) return;

    // Get or create hamburger button
    let hamburger = document.querySelector('.hamburger');
    if (!hamburger) {
        hamburger = document.createElement('button');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = '<span></span><span></span><span></span>';
        hamburger.setAttribute('aria-label', 'Toggle menu');
        hamburger.setAttribute('aria-expanded', 'false');
        
        // Insert before login button
        const loginButton = header.querySelector('.login-button');
        if (loginButton) {
            header.insertBefore(hamburger, loginButton);
        }
    }

    // Get or create mobile menu
    let mobileMenu = document.querySelector('.mobile-menu');
    if (!mobileMenu) {
        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        // Clone nav links into mobile menu
        const nav = header.querySelector('nav');
        if (nav) {
            const links = nav.querySelectorAll('a');
            links.forEach(link => {
                const clonedLink = link.cloneNode(true);
                mobileMenu.appendChild(clonedLink);
            });
        }
        
        // Insert after header
        header.parentNode.insertBefore(mobileMenu, header.nextSibling);
    }

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', 
            hamburger.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    });

    // Close menu when clicking on a link
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideHeader = header.contains(event.target);
        const isClickInsideMenu = mobileMenu.contains(event.target);
        
        if (!isClickInsideHeader && !isClickInsideMenu) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    // Close menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

// Initialize hamburger menu when DOM is ready
document.addEventListener('DOMContentLoaded', initHamburgerMenu);

