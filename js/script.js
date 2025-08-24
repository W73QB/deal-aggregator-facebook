(function () {
  console.log('[nav] script loaded');
  document.addEventListener('DOMContentLoaded', function () {
    console.log('[nav] DOM ready');
    var hamburger = document.querySelector('.hamburger');
    var nav = document.querySelector('.nav-menu');
    console.log('[nav] hamburger found?', !!hamburger);
    console.log('[nav] nav found?', !!nav);

    if (!hamburger || !nav) return;

    function toggleMenu() {
      console.log('[nav] toggleMenu called');
      var expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', (!expanded).toString());
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
      console.log('[nav] hamburger active?', hamburger.classList.contains('active'));
      console.log('[nav] nav active?', nav.classList.contains('active'));
      console.log('[nav] aria-expanded:', hamburger.getAttribute('aria-expanded'));
    }

    hamburger.addEventListener('click', toggleMenu);
    console.log('[nav] click event listener attached');

    // Close menu when clicking on nav links
    var navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
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