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

    // === ENHANCED DEAL CARDS: Countdown Timer Functionality ===
    function initCountdownTimers() {
      const countdownTimers = document.querySelectorAll('.countdown-timer');
      
      countdownTimers.forEach(function(timer) {
        const endTime = timer.getAttribute('data-end');
        if (!endTime) return;
        
        const targetDate = new Date(endTime).getTime();
        
        function updateCountdown() {
          const now = new Date().getTime();
          const distance = targetDate - now;
          
          if (distance < 0) {
            timer.innerHTML = '<span class="timer-label">Deal Expired</span>';
            return;
          }
          
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          
          const timerDisplay = timer.querySelector('.timer-display');
          if (timerDisplay) {
            const dayUnit = timerDisplay.querySelector('.time-unit:nth-child(1) .number');
            const hourUnit = timerDisplay.querySelector('.time-unit:nth-child(3) .number');
            const minuteUnit = timerDisplay.querySelector('.time-unit:nth-child(5) .number');
            
            if (dayUnit) dayUnit.textContent = String(days).padStart(2, '0');
            if (hourUnit) hourUnit.textContent = String(hours).padStart(2, '0');
            if (minuteUnit) minuteUnit.textContent = String(minutes).padStart(2, '0');
          }
        }
        
        updateCountdown();
        setInterval(updateCountdown, 60000); // Update every minute
      });
    }

    // === ENHANCED DEAL CARDS: Rating Stars Animation ===
    function initRatingStars() {
      const ratingElements = document.querySelectorAll('.deal-rating .stars');
      
      ratingElements.forEach(function(stars) {
        stars.addEventListener('mouseenter', function() {
          stars.style.transform = 'scale(1.1)';
          stars.style.transition = 'transform 0.2s ease';
        });
        
        stars.addEventListener('mouseleave', function() {
          stars.style.transform = 'scale(1)';
        });
      });
    }

    // === ENHANCED DEAL CARDS: Enhanced CTA Tracking ===
    function initEnhancedCTATracking() {
      const enhancedCTAs = document.querySelectorAll('.deal-button.enhanced-cta');
      
      enhancedCTAs.forEach(function(button) {
        button.addEventListener('click', function(e) {
          const dealCard = button.closest('.deal-card');
          const dealTitle = dealCard.querySelector('.deal-title');
          const dealPrice = dealCard.querySelector('.new-price');
          const isFlashDeal = dealCard.classList.contains('flash-deal');
          const isFeatured = dealCard.classList.contains('featured');
          
          if (typeof gtag !== 'undefined') {
            gtag('event', 'enhanced_deal_click', {
              'event_category': 'deals',
              'event_label': dealTitle ? dealTitle.textContent : 'Unknown Deal',
              'value': dealPrice ? parseFloat(dealPrice.textContent.replace(/[^\d.]/g, '')) : 0,
              'deal_type': isFlashDeal ? 'flash' : (isFeatured ? 'featured' : 'regular'),
              'transport_type': 'beacon'
            });
          }
        });
      });
    }

    // === ENHANCED DEAL CARDS: Affiliate Disclosure Compliance ===
    function initAffiliateDisclosureCompliance() {
      const affiliateBadges = document.querySelectorAll('.badge-affiliate');
      
      affiliateBadges.forEach(function(badge) {
        badge.addEventListener('mouseenter', function() {
          badge.title = 'This is an affiliate link. We may earn a commission from qualifying purchases at no extra cost to you.';
        });
      });
    }

    // Initialize all enhanced deal card features
    initCountdownTimers();
    initRatingStars();
    initEnhancedCTATracking();
    initAffiliateDisclosureCompliance();

  });
})();