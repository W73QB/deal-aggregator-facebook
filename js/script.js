// Main JavaScript file for DealRadarUS
import { $, $$, debounce, syncURL, loadState, saveState } from './shared/dom-utils.js';

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Update aria-expanded
            const isExpanded = hamburger.classList.contains('active');
            hamburger.setAttribute('aria-expanded', isExpanded);
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', false);
            });
        });
    }
    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const searchIcon = document.querySelector('.search-icon');
    
    if (searchInput && searchIcon) {
        searchIcon.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                // Simulate search functionality
                console.log('Searching for:', searchTerm);
                // In a real application, this would trigger a search
                alert(`Searching for: "${searchTerm}"`);
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchIcon.click();
            }
        });
    }
    
    // Newsletter form handling
    const newsletterForm = document.querySelector('.newsletter-form');
    const newsletterSuccess = document.querySelector('#newsletter-success');
    
    if (newsletterForm && newsletterSuccess) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = document.querySelector('#newsletter-email');
            const email = emailInput.value.trim();
            
            if (email && validateEmail(email)) {
                // Simulate API call
                setTimeout(() => {
                    newsletterSuccess.style.display = 'block';
                    emailInput.value = '';
                    
                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        newsletterSuccess.style.display = 'none';
                    }, 5000);
                }, 500);
            }
        });
    }
    
    // Email validation helper
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Deal button click tracking
    document.querySelectorAll('.deal-button').forEach(button => {
        button.addEventListener('click', function(e) {
            // For affiliate links (a tags), allow normal navigation
            if (this.tagName === 'A') {
                console.log('Navigating to affiliate link:', this.href);
                return; // Allow default behavior for affiliate links
            }
            
            // For buttons, simulate the old behavior
            e.preventDefault();
            
            // Add loading state
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.disabled = true;
            
            // Simulate redirect delay
            setTimeout(() => {
                // In a real application, this would be the affiliate link
                console.log('Redirecting to deal...');
                alert('Redirecting to deal page...');
                
                // Reset button
                this.textContent = originalText;
                this.disabled = false;
            }, 1000);
        });
    });
    
    // Category card interactions
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const categoryTitle = this.querySelector('h3').textContent;
            console.log('Category clicked:', categoryTitle);
            // In a real application, this would navigate to the category page
            alert(`Viewing ${categoryTitle} deals...`);
        });
    });
    
    // Social media link tracking
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('span').textContent;
            console.log('Social media click:', platform);
            alert(`Opening ${platform} page...`);
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // CTA button animations
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Handle button action based on text
            const buttonText = this.textContent.trim();
            if (buttonText.includes('Browse')) {
                alert('Browsing today\'s deals...');
            } else if (buttonText.includes('Subscribe')) {
                // Scroll to newsletter section
                const newsletter = document.querySelector('.newsletter');
                if (newsletter) {
                    newsletter.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Deal card hover effects
    document.querySelectorAll('.deal-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Countdown timer for featured deal
    function startCountdown() {
        const dealMeta = document.querySelector('.deal-meta span');
        if (dealMeta && dealMeta.textContent.includes('Ends in')) {
            let hours = 23;
            let minutes = 47;
            let seconds = 0;
            
            const timer = setInterval(() => {
                seconds--;
                if (seconds < 0) {
                    seconds = 59;
                    minutes--;
                    if (minutes < 0) {
                        minutes = 59;
                        hours--;
                        if (hours < 0) {
                            clearInterval(timer);
                            dealMeta.innerHTML = '<i class="fas fa-clock"></i> Deal Expired';
                            return;
                        }
                    }
                }
                
                const formattedTime = `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
                dealMeta.innerHTML = `<i class="fas fa-clock"></i> Ends in ${formattedTime}`;
            }, 1000);
        }
    }
    
    // Start countdown if on homepage
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        startCountdown();
    }
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.deal-card, .category-card, .social-link').forEach(el => {
        observer.observe(el);
    });

    // Deals.html filtering logic with URL sync and enhanced features
    if (window.location.pathname.includes('deals.html')) {
        // Query all deal cards and filter controls
        const dealCards = document.querySelectorAll('.deal-card');
        const filterPills = document.querySelectorAll('.filter-pill');
        const merchantFilter = document.getElementById('merchantFilter');
        const priceFilter = document.getElementById('priceFilter');
        const headerSearch = document.getElementById('search-input');
        const clearFilters = document.getElementById('clearFilters');
        const sortSelect = document.getElementById('sortSelect');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        // Cache extra nodes for new features
        const resultsCount = $('#resultsCount');
        const noResults = $('#noResults');
        const noResultsClear = $('#noResultsClear');
        const copyFilterLink = $('#copyFilterLink');
        
        // Pagination state
        let currentPage = 1;
        const itemsPerPage = 6;
        
        // Read & apply initial state from URL and localStorage
        const params = new URLSearchParams(location.search);
        const savedFilters = loadState('dealFilters') || {};
        
        const q = params.get('q') || savedFilters.search || '';
        const merParam = params.get('merchant') || savedFilters.merchant || 'all';
        const priceParam = params.get('price') || savedFilters.price || '2000';
        const sortParam = params.get('sort') || savedFilters.sort || 'relevance';
        const categoryParam = params.get('category') || savedFilters.category || 'all';
        const discountParam = params.get('discount') || savedFilters.discount || null;
        
        if (merchantFilter) merchantFilter.value = merParam;
        if (priceFilter) {
            priceFilter.value = priceParam;
            const pv = $('#priceValue');
            if (pv) pv.textContent = `Up to $${priceFilter.value}`;
        }
        if (headerSearch) headerSearch.value = q;
        if (sortSelect) sortSelect.value = sortParam;
        
        // Set active category pill
        filterPills.forEach(pill => {
            pill.classList.toggle('active', pill.dataset.category === categoryParam);
        });
        
        // Set active discount pill
        if (discountParam) {
            filterPills.forEach(pill => {
                if (pill.dataset.discount === discountParam) {
                    pill.classList.add('active');
                }
            });
        }
        
        // Save filters to localStorage
        function saveFilters() {
            const activeDiscountPill = document.querySelector('.filter-pill[data-discount].active');
            const filters = {
                category: (document.querySelector('.filter-pill[data-category].active')?.dataset.category) || 'all',
                merchant: merchantFilter ? merchantFilter.value : 'all',
                price: priceFilter ? priceFilter.value : '2000',
                search: headerSearch ? headerSearch.value.trim() : '',
                sort: sortSelect ? sortSelect.value : 'relevance',
                discount: activeDiscountPill ? activeDiscountPill.dataset.discount : null
            };
            saveState('dealFilters', filters);
        }
        
        // Create a function to sync URL without page reload
        function syncURLState() {
            const cat = (document.querySelector('.filter-pill[data-category].active')?.dataset.category) || 'all';
            const mer = merchantFilter ? merchantFilter.value : 'all';
            const p = priceFilter ? priceFilter.value : '2000';
            const q = headerSearch ? headerSearch.value.trim() : '';
            const s = sortSelect ? sortSelect.value : 'relevance';
            const d = document.querySelector('.filter-pill[data-discount].active')?.dataset.discount || null;
            
            const params = {};
            if (cat && cat !== 'all') params.category = cat;
            if (mer && mer !== 'all') params.merchant = mer;
            if (p && p !== '2000') params.price = p;
            if (q) params.q = q;
            if (s && s !== 'relevance') params.sort = s;
            if (d) params.discount = d;
            
            syncURL(params);
            saveFilters();
        }
        
        // Sort function
        function sortDeals(deals) {
            const sortValue = sortSelect ? sortSelect.value : 'relevance';
            
            return deals.sort((a, b) => {
                switch (sortValue) {
                    case 'price-asc':
                        return parseInt(a.dataset.price) - parseInt(b.dataset.price);
                    case 'price-desc':
                        return parseInt(b.dataset.price) - parseInt(a.dataset.price);
                    case 'newest':
                        return new Date(b.dataset.date) - new Date(a.dataset.date);
                    case 'relevance':
                    default:
                        return 0; // Keep original order
                }
            });
        }
        
        // Enhanced applyFilters function with pagination
        function applyFilters() {
            // Get active category and discount
            const activeCategory = document.querySelector('.filter-pill[data-category].active')?.getAttribute('data-category') || 'all';
            const activeDiscount = document.querySelector('.filter-pill[data-discount].active')?.dataset.discount || null;
            
            // Get filter values
            const selectedMerchant = merchantFilter ? merchantFilter.value : 'all';
            const maxPrice = priceFilter ? parseInt(priceFilter.value) : 2000;
            const searchTerm = headerSearch ? headerSearch.value.trim().toLowerCase() : '';
            
            // Get all matching cards
            const matchingCards = Array.from(dealCards).filter(card => {
                const cardCategory = card.getAttribute('data-category');
                const cardMerchant = card.getAttribute('data-merchant');
                const cardPrice = parseInt(card.getAttribute('data-price'));
                const cardTitle = card.querySelector('.deal-title')?.textContent.toLowerCase() || '';
                const cardDiscount = parseInt(card.getAttribute('data-discount') || '0');
                
                // Check all conditions
                const categoryMatch = activeCategory === 'all' || cardCategory === activeCategory;
                const merchantMatch = selectedMerchant === 'all' || cardMerchant === selectedMerchant;
                const priceMatch = cardPrice <= maxPrice;
                const searchMatch = searchTerm === '' || cardTitle.includes(searchTerm);
                const discountMatch = !activeDiscount || cardDiscount >= parseInt(activeDiscount);
                
                return categoryMatch && merchantMatch && priceMatch && searchMatch && discountMatch;
            });
            
            // Sort matching cards
            const sortedCards = sortDeals([...matchingCards]);
            
            // Hide all cards first
            dealCards.forEach(card => {
                card.style.display = 'none';
            });
            
            // Show paginated results
            const startIndex = 0;
            const endIndex = currentPage * itemsPerPage;
            const cardsToShow = sortedCards.slice(startIndex, endIndex);
            
            cardsToShow.forEach(card => {
                card.style.display = '';
            });
            
            // Update results count and pagination
            const totalMatching = sortedCards.length;
            const showing = Math.min(endIndex, totalMatching);
            
            if (resultsCount) {
                resultsCount.textContent = `Showing ${showing} of ${totalMatching} deal${totalMatching === 1 ? '' : 's'}`;
            }
            
            // Toggle load more button
            if (loadMoreBtn) {
                loadMoreBtn.style.display = showing < totalMatching ? 'block' : 'none';
            }
            
            // Toggle no-results message
            if (noResults) noResults.hidden = totalMatching !== 0;
            
            // Sync URL
            syncURLState();
        }
        
        // Add event listeners for filter pills
        filterPills.forEach(pill => {
            pill.addEventListener('click', function() {
                if (this.dataset.category) {
                    // This is a category pill - remove active from category pills only
                    filterPills.forEach(p => {
                        if (p.dataset.category) p.classList.remove('active');
                    });
                    this.classList.add('active');
                } else if (this.dataset.discount) {
                    // This is a discount pill - toggle it
                    if (this.classList.contains('active')) {
                        this.classList.remove('active');
                    } else {
                        // Remove active from other discount pills
                        filterPills.forEach(p => {
                            if (p.dataset.discount) p.classList.remove('active');
                        });
                        this.classList.add('active');
                    }
                }
                // Reset pagination
                currentPage = 1;
                // Apply filters
                applyFilters();
            });
        });
        
        // Add event listener for merchant filter
        if (merchantFilter) {
            merchantFilter.addEventListener('change', () => {
                currentPage = 1;
                applyFilters();
            });
        }
        
        // Add event listener for price filter
        if (priceFilter) {
            priceFilter.addEventListener('input', function() {
                const priceValue = document.getElementById('priceValue');
                if (priceValue) {
                    priceValue.textContent = `Up to $${this.value}`;
                }
                currentPage = 1;
                applyFilters();
            });
        }
        
        // Add event listener for sort select
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                currentPage = 1;
                applyFilters();
            });
        }
        
        // Add event listener for load more button
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                currentPage++;
                applyFilters();
                
                // Scroll to newly loaded content
                setTimeout(() => {
                    const newlyVisible = document.querySelectorAll('.deal-card[style=""]');
                    if (newlyVisible.length > itemsPerPage) {
                        newlyVisible[newlyVisible.length - itemsPerPage].scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 100);
            });
        }
        
        // Replace search listener with debounced version
        if (headerSearch) {
            headerSearch.addEventListener('input', debounce(() => { 
                currentPage = 1;
                applyFilters(); 
            }, 250));
            headerSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    currentPage = 1;
                    applyFilters();
                }
            });
        }
        
        // Add event listener for clear filters
        if (clearFilters) {
            clearFilters.addEventListener('click', function() {
                // Reset all filters to defaults
                const allPill = document.querySelector('.filter-pill[data-category="all"]');
                $$('.filter-pill').forEach(b => {
                    if (b.dataset.category) {
                        b.classList.toggle('active', b === allPill);
                    } else if (b.dataset.discount) {
                        b.classList.remove('active');
                    }
                });
                
                if (merchantFilter) merchantFilter.value = 'all';
                if (priceFilter) {
                    priceFilter.value = '2000';
                    const pv = $('#priceValue');
                    if (pv) pv.textContent = `Up to $${priceFilter.value}`;
                }
                if (headerSearch) headerSearch.value = '';
                if (sortSelect) sortSelect.value = 'relevance';
                
                // Reset pagination and apply filters
                currentPage = 1;
                applyFilters();
            });
        }
        
        // Wire "no results → clear" button
        if (noResultsClear) {
            noResultsClear.addEventListener('click', () => {
                const allPill = document.querySelector('.filter-pill[data-category="all"]');
                $$('.filter-pill').forEach(b => {
                    if (b.dataset.category) {
                        b.classList.toggle('active', b === allPill);
                    } else if (b.dataset.discount) {
                        b.classList.remove('active');
                    }
                });
                if (merchantFilter) merchantFilter.value = 'all';
                if (priceFilter) {
                    priceFilter.value = '2000';
                    const pv = $('#priceValue');
                    if (pv) pv.textContent = `Up to $${priceFilter.value}`;
                }
                if (headerSearch) headerSearch.value = '';
                if (sortSelect) sortSelect.value = 'relevance';
                currentPage = 1;
                applyFilters();
            });
        }
        
        // Wire "copy link" button
        if (copyFilterLink) {
            copyFilterLink.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(location.href);
                    copyFilterLink.textContent = 'Copied!';
                    setTimeout(() => copyFilterLink.textContent = 'Copy link', 1200);
                } catch {
                    console.log('Clipboard unavailable');
                }
            });
        }
        
        // Apply filters on initial load
        applyFilters();
    }
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .nav-menu.active {
        display: flex !important;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 1rem;
        z-index: 1000;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease-out;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            display: none;
        }
        
        .search-container {
            order: -1;
            margin-bottom: 1rem;
        }
        
        .search-input {
            width: 100%;
        }
    }
`;
document.head.appendChild(style);