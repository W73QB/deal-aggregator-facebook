/**
 * Affiliate Disclosure Component
 * FTC Compliance for affiliate marketing
 * Version: 1.0.0
 */

class AffiliateDisclosure {
  constructor() {
    this.init();
  }

  init() {
    this.addDisclosureNotices();
    this.setupAffiliateTracking();
    this.addTooltips();
    console.log('📋 Affiliate disclosure system initialized');
  }

  // Add disclosure notices to pages
  addDisclosureNotices() {
    // Add global disclosure to footer
    this.addGlobalDisclosure();
    
    // Add inline disclosures near affiliate links
    this.addInlineDisclosures();
    
    // Add modal disclosure
    this.createDisclosureModal();
  }

  addGlobalDisclosure() {
    const footer = document.querySelector('footer, .footer');
    if (!footer) return;

    const disclosureHTML = `
      <div class="affiliate-disclosure" role="complementary" aria-label="Affiliate Disclosure">
        <p class="disclosure-text">
          <strong>🔗 Affiliate Disclosure:</strong> 
          DealRadarUS participates in affiliate marketing programs. When you click on links to 
          retailers and make a purchase, we may earn a commission at no additional cost to you. 
          This helps support our site and allows us to continue finding great deals for you.
          <a href="#affiliate-policy" class="disclosure-link" data-modal-trigger="affiliate-disclosure">
            Learn more
          </a>
        </p>
      </div>
    `;

    footer.insertAdjacentHTML('beforeend', disclosureHTML);
  }

  addInlineDisclosures() {
    // Find all affiliate links
    const affiliateLinks = document.querySelectorAll('a[rel*="sponsored"], a[data-deal-key]');
    
    affiliateLinks.forEach(link => {
      if (!link.querySelector('.affiliate-badge')) {
        const badge = document.createElement('span');
        badge.className = 'affiliate-badge';
        badge.textContent = 'Ad';
        badge.setAttribute('title', 'This is an affiliate link');
        badge.setAttribute('aria-label', 'Sponsored affiliate link');
        
        link.appendChild(badge);
      }
    });
  }

  createDisclosureModal() {
    const modalHTML = `
      <div id="affiliate-disclosure-modal" class="modal" role="dialog" aria-labelledby="disclosure-title" aria-hidden="true">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="disclosure-title">🔗 Affiliate Marketing Disclosure</h2>
            <button class="modal-close" aria-label="Close disclosure">&times;</button>
          </div>
          <div class="modal-body">
            <div class="disclosure-content">
              <h3>How We Make Money</h3>
              <p>
                DealRadarUS operates as an affiliate marketing website. This means when you 
                click on certain links to retailers and make a purchase, we may receive a 
                commission from the retailer.
              </p>
              
              <h3>No Extra Cost to You</h3>
              <p>
                <strong>Important:</strong> You will never pay more because you used our affiliate links. 
                The price you pay is exactly the same whether you use our link or go directly 
                to the retailer.
              </p>
              
              <h3>Our Promise</h3>
              <ul>
                <li>✅ We only recommend products we believe offer genuine value</li>
                <li>✅ Our editorial content is not influenced by affiliate partnerships</li>
                <li>✅ We clearly label all sponsored and affiliate content</li>
                <li>✅ We comply with FTC guidelines for affiliate marketing</li>
              </ul>
              
              <h3>Transparency</h3>
              <p>
                We believe in complete transparency. When you see links marked with "Ad", 
                <span class="affiliate-badge-example">Ad</span>, or "sponsored", 
                these are affiliate links that may earn us a commission.
              </p>
              
              <h3>Questions?</h3>
              <p>
                If you have any questions about our affiliate partnerships or disclosure practices, 
                please contact us at <a href="mailto:deals@dealradarus.com">deals@dealradarus.com</a>.
              </p>
              
              <div class="compliance-note">
                <small>
                  <strong>FTC Compliance:</strong> This disclosure is provided in accordance with 
                  the Federal Trade Commission's guidelines on affiliate marketing and sponsored content.
                  Last updated: ${new Date().toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.setupModalEvents();
  }

  setupModalEvents() {
    const modal = document.getElementById('affiliate-disclosure-modal');
    const triggers = document.querySelectorAll('[data-modal-trigger="affiliate-disclosure"]');
    const closeBtn = modal.querySelector('.modal-close');

    // Open modal
    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        closeBtn.focus();
        
        // Track disclosure view
        if (typeof gtag !== 'undefined') {
          gtag('event', 'affiliate_disclosure_view', {
            event_category: 'compliance',
            event_label: 'modal_opened'
          });
        }
      });
    });

    // Close modal
    const closeModal = () => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
      }
    });
  }

  setupAffiliateTracking() {
    // Track affiliate link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[rel*="sponsored"], a[data-deal-key]');
      if (!link) return;

      const dealKey = link.getAttribute('data-deal-key');
      const retailer = link.getAttribute('data-retailer');
      const linkType = link.getAttribute('data-type') || 'deal_link';

      // Track with GA4
      if (typeof gtag !== 'undefined') {
        gtag('event', 'affiliate_click', {
          event_category: 'affiliate',
          event_label: dealKey || 'unknown',
          affiliate_retailer: retailer || 'unknown',
          link_type: linkType,
          link_url: link.href
        });
      }

      // Track with enhanced analytics if available
      if (window.GA4Tracker) {
        window.GA4Tracker.trackEvent('affiliate_link_click', {
          deal_key: dealKey,
          retailer: retailer,
          link_type: linkType,
          destination_url: link.href
        });
      }

      console.log('🔗 Affiliate link clicked:', {
        deal: dealKey,
        retailer: retailer,
        url: link.href
      });
    });
  }

  addTooltips() {
    const affiliateBadges = document.querySelectorAll('.affiliate-badge');
    
    affiliateBadges.forEach(badge => {
      badge.addEventListener('mouseenter', (e) => {
        this.showTooltip(e.target, 'This is a sponsored affiliate link. We may earn a commission.');
      });
      
      badge.addEventListener('mouseleave', (e) => {
        this.hideTooltip();
      });
    });
  }

  showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'affiliate-tooltip';
    tooltip.textContent = text;
    tooltip.setAttribute('role', 'tooltip');
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.position = 'absolute';
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.bottom + 5 + 'px';
  }

  hideTooltip() {
    const tooltip = document.querySelector('.affiliate-tooltip');
    if (tooltip) tooltip.remove();
  }

  // Add CSS styles
  injectStyles() {
    const styles = `
      .affiliate-disclosure {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 5px;
        padding: 15px;
        margin: 20px 0;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .disclosure-text {
        margin: 0;
        color: #495057;
      }
      
      .disclosure-link {
        color: #007bff;
        text-decoration: underline;
        font-weight: 500;
      }
      
      .affiliate-badge {
        display: inline-block;
        background: #ffc107;
        color: #212529;
        font-size: 10px;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 3px;
        margin-left: 5px;
        text-transform: uppercase;
        cursor: help;
        vertical-align: top;
      }
      
      .affiliate-badge-example {
        background: #ffc107;
        color: #212529;
        font-size: 10px;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 3px;
        text-transform: uppercase;
      }
      
      .affiliate-tooltip {
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        max-width: 200px;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      
      .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      
      .modal-content {
        background: white;
        border-radius: 8px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #dee2e6;
      }
      
      .modal-header h2 {
        margin: 0;
        color: #333;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 5px;
        border-radius: 3px;
      }
      
      .modal-close:hover {
        background: #f8f9fa;
      }
      
      .modal-body {
        padding: 20px;
      }
      
      .disclosure-content h3 {
        color: #333;
        margin-top: 20px;
        margin-bottom: 10px;
      }
      
      .disclosure-content ul {
        padding-left: 0;
        list-style: none;
      }
      
      .disclosure-content li {
        margin: 8px 0;
        padding-left: 0;
      }
      
      .compliance-note {
        background: #e9ecef;
        padding: 15px;
        border-radius: 5px;
        margin-top: 20px;
        color: #495057;
      }
      
      @media (max-width: 768px) {
        .modal-content {
          width: 95%;
          margin: 10px;
        }
        
        .affiliate-disclosure {
          font-size: 12px;
          padding: 10px;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const disclosure = new AffiliateDisclosure();
  disclosure.injectStyles();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AffiliateDisclosure;
} else {
  window.AffiliateDisclosure = AffiliateDisclosure;
}