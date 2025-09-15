/**
 * =� DealRadarUS - Enhanced GA4 Analytics Tracking
 * Comprehensive event tracking for user interactions
 */

// Enhanced Newsletter Signup Tracking
document.addEventListener('DOMContentLoaded', function() {
    // Newsletter form tracking
    const newsletterForms = document.querySelectorAll('form[action*="newsletter"], .newsletter-signup, #newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            gtag('event', 'newsletter_submit', {
                'event_category': 'engagement',
                'event_label': 'newsletter_signup',
                'value': 1
            });
        });
    });

    // Search functionality tracking
    const searchInputs = document.querySelectorAll('input[type="search"], .search-input, #search');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                gtag('event', 'search_used', {
                    'event_category': 'engagement',
                    'search_term': this.value.trim(),
                    'event_label': 'site_search'
                });
            }
        });
    });

    // Deal card impression tracking using Intersection Observer
    const dealCards = document.querySelectorAll('.deal-card, .product-card, .deal-item');
    if (dealCards.length > 0) {
        const impressionObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const dealCard = entry.target;
                    const dealTitle = dealCard.querySelector('h3, .deal-title, .product-name')?.textContent?.trim();
                    
                    gtag('event', 'deal_impression', {
                        'event_category': 'ecommerce',
                        'event_label': dealTitle || 'unknown_deal',
                        'value': 1
                    });
                    
                    impressionObserver.unobserve(dealCard);
                }
            });
        }, {
            threshold: 0.5
        });

        dealCards.forEach(card => impressionObserver.observe(card));
    }

    // Email and Social media click tracking
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link) {
            // Track mailto: clicks
            if (link.href.startsWith('mailto:')) {
                const email = (link.getAttribute('href').match(/mailto:([^?]+)/)||[])[1] || 'unknown';
                gtag('event', 'mailto_click', {
                    'event_category': 'engagement',
                    'event_label': email,
                    'value': 1
                });
            }
            
            // Track social media clicks
            var socialRegex = /facebook\.com|twitter\.com|instagram\.com|linkedin\.com|youtube\.com/i;
            
            if (socialRegex.test(link.href)) {
                let platform = 'unknown';
                if (/facebook\.com/i.test(link.href)) platform = 'facebook';
                else if (/twitter\.com/i.test(link.href)) platform = 'twitter';
                else if (/instagram\.com/i.test(link.href)) platform = 'instagram';
                else if (/linkedin\.com/i.test(link.href)) platform = 'linkedin';
                else if (/youtube\.com/i.test(link.href)) platform = 'youtube';
                
                gtag('event', 'social_click', {
                    'event_category': 'engagement',
                    'social_platform': platform,
                    'event_label': platform + '_follow',
                    'value': 1
                });
            }
        }
    });

    console.log('=� DealRadarUS Enhanced Analytics loaded successfully');
});