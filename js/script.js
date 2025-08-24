(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var hamburger = document.querySelector('.hamburger');
    var nav = document.querySelector('.nav-menu');
    var firstLink = nav ? nav.querySelector('.nav-link') : null;

    if (!hamburger || !nav) return;

    function openMenu() {
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.classList.add('active');
      nav.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (firstLink) firstLink.focus();
      if (typeof gtag !== 'undefined') gtag('event', 'nav_menu_open');
    }

    function closeMenu() {
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('active');
      nav.classList.remove('active');
      document.body.style.overflow = '';
      if (typeof gtag !== 'undefined') gtag('event', 'nav_menu_close');
      hamburger.focus();
    }

    function toggleMenu() {
      hamburger.classList.contains('active') ? closeMenu() : openMenu();
    }

    hamburger.addEventListener('click', toggleMenu);

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && hamburger.classList.contains('active')) {
        closeMenu();
      }
    });

    // Click outside to close
    document.addEventListener('click', function(e) {
      if (!hamburger.classList.contains('active')) return;
      if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    });

    // Close after clicking a menu item
    nav.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', closeMenu);
    });

    // Newsletter form handling
    var newsletterForm = document.querySelector('.newsletter-form');
    var newsletterSuccess = document.getElementById('newsletter-success');

    if (newsletterForm && newsletterSuccess) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var email = newsletterForm.querySelector('input[type="email"]').value;
        if (email) {
          newsletterSuccess.style.display = 'block';
          newsletterForm.querySelector('input[type="email"]').value = '';
          setTimeout(function() {
            newsletterSuccess.style.display = 'none';
          }, 5000);
        }
      });
    }

    // Search functionality
    var searchInput = document.querySelector('.search-input');
    var searchIcon = document.querySelector('.search-icon');
    
    if (searchInput && searchIcon) {
      searchIcon.addEventListener('click', function() {
        var searchTerm = searchInput.value.trim();
        if (searchTerm) {
          console.log('Searching for:', searchTerm);
          alert('Searching for: "' + searchTerm + '"');
        }
      });
      
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          searchIcon.click();
        }
      });
    }
  });
})();