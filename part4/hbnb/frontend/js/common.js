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
async function initHeaderLoginStatus() {
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    if (!headerLoginBtn) return;

    headerLoginBtn.disabled = false;

    if (isUserLoggedIn()) {
        // Hide immediately to avoid visual flicker while profile menu initializes
        headerLoginBtn.style.visibility = 'hidden';
        headerLoginBtn.style.pointerEvents = 'none';

        // User is logged in - replace button with profile dropdown
        await createProfileDropdown(headerLoginBtn);
    } else {
        // User is not logged in - show login button
        headerLoginBtn.textContent = 'Connexion';
        headerLoginBtn.className = 'px-6 py-2 text-gray-900 font-medium hover:text-red-500 transition-colors border border-gray-300 hover:border-red-500 rounded-lg';
        headerLoginBtn.onclick = () => {
            window.location.href = '/login.html';
        };

        // Remove user nav links if they exist
        removeUserNavLinks();
    }
}

/**
 * Create profile dropdown with user avatar and menu
 */
async function createProfileDropdown(headerLoginBtn) {
    const header = document.querySelector('header');
    if (!header) return;

    // Check if profile dropdown already exists
    if (document.getElementById('profileDropdown')) {
        headerLoginBtn.style.display = 'none';
        return;
    }

    // Hide button immediately while fetching user data
    headerLoginBtn.style.display = 'none';

    // Render immediately with fallback data, then hydrate from API.
    const fallbackName = 'Profil';
    const fallbackEmail = localStorage.getItem('userEmail') || '';
    const fallbackAvatar = '/images/default-avatar.svg';
    const userId = localStorage.getItem('userId');
    const token = getTokenFromCookie();

    // Create profile dropdown HTML
    const profileDropdown = document.createElement('div');
    profileDropdown.className = 'relative';
    profileDropdown.id = 'profileDropdown';

    const profileBtn = document.createElement('button');
    profileBtn.className = 'flex items-center gap-2 px-4 py-2 text-gray-900 font-medium hover:text-red-500 transition-colors border border-gray-300 hover:border-red-500 rounded-lg';
    profileBtn.type = 'button';
    profileBtn.setAttribute('aria-label', 'Profil utilisateur');

    const userName = fallbackName;
    const userEmail = fallbackEmail;
    const userAvatar = fallbackAvatar;

    profileBtn.innerHTML = `
        <img src="${userAvatar}" alt="Avatar" class="h-8 w-8 rounded-full object-cover" onerror="this.src='/images/default-avatar.svg'">
        <span class="hidden md:inline text-sm">${userName.substring(0, 15)}</span>
        <span class="hidden md:inline text-xs">▼</span>
    `;

    const profileMenu = document.createElement('div');
    profileMenu.className = 'hidden absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10';

    profileMenu.innerHTML = `
        <div class="flex items-center gap-3 p-4 border-b border-gray-200">
            <img src="${userAvatar}" alt="Avatar" class="h-12 w-12 rounded-full object-cover" onerror="this.src='/images/default-avatar.svg'">
            <div class="flex-1 min-w-0">
                <h3 class="font-bold text-gray-900 truncate">${escapeHtml(userName)}</h3>
                <p class="text-sm text-gray-600 truncate">${escapeHtml(userEmail)}</p>
            </div>
        </div>
        <div class="py-2">
            <a href="/user-profile.html" class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-colors text-sm">
                <span>👤</span> Profil
            </a>
            <a href="/my-places.html" class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-colors text-sm">
                <span>🏠</span> Mes Locations
            </a>
            <a href="/my-reviews.html" class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-colors text-sm">
                <span>📝</span> Mes Avis
            </a>
            ${isUserAdmin() ? `
            <div class="border-t border-gray-200 my-2"></div>
            <a href="/admin-amenities.html" class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-colors text-sm">
                <span>⚙️</span> Aménités (Admin)
            </a>
            ` : ''}
            <div class="border-t border-gray-200 my-2"></div>
            <button class="logout w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-colors text-sm text-left">
                <span>🚪</span> Déconnexion
            </button>
        </div>
    `;

    profileDropdown.appendChild(profileBtn);
    profileDropdown.appendChild(profileMenu);

    // Replace login button with profile dropdown
    headerLoginBtn.parentNode.insertBefore(profileDropdown, headerLoginBtn);

    // Setup event listeners
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        profileMenu.classList.toggle('hidden');
    });

    // Close menu when clicking on a link
    const menuLinks = profileMenu.querySelectorAll('a, button');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.classList.contains('logout')) {
                e.preventDefault();
                logoutUser();
            } else {
                profileMenu.classList.add('hidden');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideDropdown = profileDropdown.contains(event.target);
        if (!isClickInsideDropdown) {
            profileMenu.classList.add('hidden');
        }
    });

    // Add user nav links to nav bar
    addUserNavLinks();

    // Fetch and apply user data after dropdown is visible (same UX for admin/non-admin)
    if (userId && token) {
        try {
            const API_BASE_URL = getApiBaseUrl();
            const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Profil';
                const email = userData.email || '';
                const avatar = userData.profile_picture || '/images/default-avatar.svg';

                const profileAvatar = profileBtn.querySelector('.profile-avatar');
                const profileName = profileBtn.querySelector('span');
                const menuAvatar = profileMenu.querySelector('.profile-menu-avatar');
                const menuName = profileMenu.querySelector('.profile-menu-info h3');
                const menuEmail = profileMenu.querySelector('.profile-menu-info p');

                if (profileAvatar) profileAvatar.src = avatar;
                if (profileName) profileName.textContent = fullName.substring(0, 15);
                if (menuAvatar) menuAvatar.src = avatar;
                if (menuName) menuName.textContent = fullName;
                if (menuEmail) menuEmail.textContent = email;
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
}

/**
 * Get API base URL
 */
function getApiBaseUrl() {
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
 * Add user navigation links (kept for mobile menu compatibility)
 */
function addUserNavLinks() {
    // Links are now in the profile dropdown, no need to add sep. nav links
    // But keep this for compatibility with mobile menu
    return;
}

/**
 * Remove user navigation links
 */
function removeUserNavLinks() {
    const marker = document.getElementById('userNavLinks');
    if (marker) {
        marker.remove();
    }
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
        hamburger.className = 'md:hidden flex flex-col gap-1.5 p-2 text-gray-900 hover:text-red-500 transition-colors';
        hamburger.innerHTML = '<span class="w-6 h-0.5 bg-current block"></span><span class="w-6 h-0.5 bg-current block"></span><span class="w-6 h-0.5 bg-current block"></span>';
        hamburger.setAttribute('aria-label', 'Toggle menu');
        hamburger.setAttribute('aria-expanded', 'false');

        // Insert before login button
        const loginButton = header.querySelector('button:not(.hamburger)');
        if (loginButton) {
            header.insertBefore(hamburger, loginButton);
        } else {
            header.appendChild(hamburger);
        }
    }

    // Get or create mobile menu
    let mobileMenu = document.querySelector('.mobile-menu');
    if (!mobileMenu) {
        mobileMenu = document.createElement('div');
        mobileMenu.className = 'hidden md:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40';

        // Clone nav links into mobile menu
        const nav = header.querySelector('nav');
        if (nav) {
            const links = nav.querySelectorAll('a');
            const menuContainer = document.createElement('div');
            menuContainer.className = 'flex flex-col';
            links.forEach(link => {
                const clonedLink = link.cloneNode(true);
                clonedLink.className = 'px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-colors border-b border-gray-100 text-sm font-medium';
                menuContainer.appendChild(clonedLink);
            });
            mobileMenu.appendChild(menuContainer);
        }

        // Insert after header
        header.parentNode.insertBefore(mobileMenu, header.nextSibling);
    }

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('hidden');
        hamburger.setAttribute('aria-expanded',
            hamburger.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    });

    // Close menu when clicking on a link
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileMenu.classList.add('hidden');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideHeader = header.contains(event.target);
        const isClickInsideMenu = mobileMenu.contains(event.target);

        if (!isClickInsideHeader && !isClickInsideMenu) {
            hamburger.classList.remove('active');
            mobileMenu.classList.add('hidden');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    // Close menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            mobileMenu.classList.add('hidden');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

// Initialize hamburger menu when DOM is ready
document.addEventListener('DOMContentLoaded', initHamburgerMenu);

