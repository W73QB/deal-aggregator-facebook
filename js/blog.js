// Enhanced Blog JavaScript - Vanilla JS version (no imports)
document.addEventListener('DOMContentLoaded', function() {

    // Simple DOM utility functions (inline to avoid imports)
    function $(selector) {
        return document.querySelector(selector);
    }
    
    function $$(selector) {
        return Array.from(document.querySelectorAll(selector));
    }
    
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // DOM elements
    const filterButtons = $$('.filter-btn');
    const articleCards = $$('.article-card');
    const loadMoreBtn = $('.load-more-btn');
    const searchInput = $('.search-input');
    const searchForm = $('.search-container form, form[role="search"]');
    
    if (!filterButtons.length && !articleCards.length) {
        console.log('[blog.js] No blog elements found, skipping blog functionality');
        return;
    }

    let currentFilter = 'all';
    let currentSearch = '';
    let visibleCount = 6; // Show 6 articles initially
    
    // Filter functionality
    function filterArticles(category = 'all', searchTerm = '') {
        let visibleArticles = 0;
        
        articleCards.forEach(card => {
            const cardCategory = card.dataset.category || '';
            const cardTitle = card.querySelector('.article-title')?.textContent.toLowerCase() || '';
            const cardContent = card.querySelector('.article-excerpt, p')?.textContent.toLowerCase() || '';
            
            const matchesCategory = category === 'all' || cardCategory === category;
            const matchesSearch = !searchTerm || 
                cardTitle.includes(searchTerm.toLowerCase()) || 
                cardContent.includes(searchTerm.toLowerCase());
            
            const shouldShow = matchesCategory && matchesSearch && visibleArticles < visibleCount;
            
            if (shouldShow) {
                card.style.display = 'block';
                visibleArticles++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show/hide load more button
        if (loadMoreBtn) {
            const totalMatches = articleCards.filter(card => {
                const cardCategory = card.dataset.category || '';
                const cardTitle = card.querySelector('.article-title')?.textContent.toLowerCase() || '';
                const cardContent = card.querySelector('.article-excerpt, p')?.textContent.toLowerCase() || '';
                
                const matchesCategory = category === 'all' || cardCategory === category;
                const matchesSearch = !searchTerm || 
                    cardTitle.includes(searchTerm.toLowerCase()) || 
                    cardContent.includes(searchTerm.toLowerCase());
                
                return matchesCategory && matchesSearch;
            }).length;
            
            loadMoreBtn.style.display = totalMatches > visibleCount ? 'block' : 'none';
        }
    }
    
    // Filter button event listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.filter || 'all';
            visibleCount = 6; // Reset visible count
            filterArticles(currentFilter, currentSearch);
            
            // Update URL (simple version)
            const url = new URL(window.location);
            if (currentFilter === 'all') {
                url.searchParams.delete('category');
            } else {
                url.searchParams.set('category', currentFilter);
            }
            window.history.replaceState({}, '', url);
        });
    });
    
    // Search functionality
    const debouncedSearch = debounce(function(searchTerm) {
        currentSearch = searchTerm;
        visibleCount = 6; // Reset visible count
        filterArticles(currentFilter, currentSearch);
        
        // Update URL
        const url = new URL(window.location);
        if (searchTerm) {
            url.searchParams.set('search', searchTerm);
        } else {
            url.searchParams.delete('search');
        }
        window.history.replaceState({}, '', url);
    }, 300);
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            debouncedSearch(this.value);
        });
    }
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (searchInput) {
                debouncedSearch(searchInput.value);
            }
        });
    }
    
    // Load more functionality
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            visibleCount += 6;
            filterArticles(currentFilter, currentSearch);
        });
    }
    
    // Initialize from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');
    const urlSearch = urlParams.get('search');
    
    if (urlCategory) {
        currentFilter = urlCategory;
        const filterBtn = $(`.filter-btn[data-filter="${urlCategory}"]`);
        if (filterBtn) {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            filterBtn.classList.add('active');
        }
    }
    
    if (urlSearch && searchInput) {
        currentSearch = urlSearch;
        searchInput.value = urlSearch;
    }
    
    // Apply initial filters
    filterArticles(currentFilter, currentSearch);
    
    // Smooth scroll for anchor links
    $$('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const target = $(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});