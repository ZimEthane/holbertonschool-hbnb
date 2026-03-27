// ==================== HAMBURGER MENU ==================== //

document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks = document.querySelectorAll('.mobile-menu a');

  // Créer le hamburger si n'existe pas
  if (!hamburger) {
    createHamburgerMenu();
  }

  // Gérer le clic sur le hamburger
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      if (mobileMenu) {
        mobileMenu.classList.toggle('active');
      }
    });
  }

  // Fermer le menu quand on clique sur un lien
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (hamburger) {
        hamburger.classList.remove('active');
      }
      if (mobileMenu) {
        mobileMenu.classList.remove('active');
      }
    });
  });

  // Fermer le menu quand on redimensionne au-delà de 768px
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      if (hamburger) {
        hamburger.classList.remove('active');
      }
      if (mobileMenu) {
        mobileMenu.classList.remove('active');
      }
    }
  });

  // Fermer le menu au clic en dehors
  document.addEventListener('click', function(event) {
    const isClickInsideHeader = document.querySelector('header').contains(event.target);
    if (!isClickInsideHeader && hamburger && mobileMenu) {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
    }
  });

  // Gérer les boutons visibles/cachés
  updateResponsiveElements();
  window.addEventListener('resize', updateResponsiveElements);
});

function createHamburgerMenu() {
  const header = document.querySelector('header');
  if (!header) return;

  // Créer le bouton hamburger
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  
  // Insérer avant le bouton login
  const loginButton = header.querySelector('.login-button');
  if (loginButton) {
    header.insertBefore(hamburger, loginButton);
  }

  // Créer le menu mobile
  const nav = header.querySelector('nav');
  if (nav) {
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    
    // Copier les liens de la navigation
    const links = nav.querySelectorAll('a');
    links.forEach(link => {
      const newLink = link.cloneNode(true);
      mobileMenu.appendChild(newLink);
    });

    // Insérer après le header
    header.parentNode.insertBefore(mobileMenu, header.nextSibling);
  }
}

function updateResponsiveElements() {
  const header = document.querySelector('header');
  const loginButton = document.querySelector('.login-button');
  
  if (window.innerWidth <= 768) {
    // Mode mobile
    if (header) {
      header.style.flexWrap = 'wrap';
    }
  } else {
    // Mode desktop
    if (header) {
      header.style.flexWrap = 'nowrap';
    }
    // Fermer le menu si ouvert
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (hamburger) {
      hamburger.classList.remove('active');
    }
    if (mobileMenu) {
      mobileMenu.classList.remove('active');
    }
  }
}

// Ajuster les font sizes au chargement
function adjustFontSizes() {
  const width = window.innerWidth;
  const htmlElement = document.documentElement;

  if (width <= 360) {
    htmlElement.style.fontSize = '12px';
  } else if (width <= 480) {
    htmlElement.style.fontSize = '13px';
  } else if (width <= 640) {
    htmlElement.style.fontSize = '14px';
  } else if (width <= 768) {
    htmlElement.style.fontSize = '15px';
  } else if (width <= 1024) {
    htmlElement.style.fontSize = '15px';
  } else {
    htmlElement.style.fontSize = '16px';
  }
}

// Initialiser et redimensionner
adjustFontSizes();
window.addEventListener('resize', adjustFontSizes);
