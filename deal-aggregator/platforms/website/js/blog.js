// Enhanced Blog JavaScript with State Management and URL Sync

document.addEventListener('DOMContentLoaded', function() {
    // Helper functions
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    
    function debounce(fn, wait = 250) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
        };
    }

    // DOM elements
    const filterButtons = $$('.filter-btn');
    const articleCards = $$('.article-card');
    const loadMoreBtn = $('.load-more-btn');
    const searchInput = $('.search-input');
    const resultsCount = $('.results-count');
    const copyBlogLink = $('#copyBlogLink');

    // State management
    let state = {
        category: 'all',
        search: '',
        currentPage: 1,
        itemsPerPage: 6
    };

    // Initialize state from URL
    function initializeState() {
        const params = new URLSearchParams(location.search);
        state.category = params.get('category') || 'all';
        state.search = params.get('q') || '';
        state.currentPage = 1;

        // Set active filter button
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === state.category);
            btn.setAttribute('aria-pressed', btn.dataset.category === state.category);
        });

        // Set search input value
        if (searchInput && state.search) {
            searchInput.value = state.search;
        }
    }

    // Save state to localStorage
    function saveState() {
        localStorage.setItem('blogState', JSON.stringify({
            category: state.category,
            search: state.search
        }));
    }

    // Load state from localStorage
    function loadState() {
        const savedState = localStorage.getItem('blogState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            // Only use saved state if no URL params
            const params = new URLSearchParams(location.search);
            if (!params.get('category') && !params.get('q')) {
                state.category = parsed.category || 'all';
                state.search = parsed.search || '';
            }
        }
    }

    // Sync URL with current state
    function syncURL() {
        const params = new URLSearchParams();
        if (state.category && state.category !== 'all') {
            params.set('category', state.category);
        }
        if (state.search) {
            params.set('q', state.search);
        }

        const newUrl = `${location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        history.replaceState(null, '', newUrl);
        saveState();
    }

    // Build share URLs with UTM
    function buildShareTargets(title, url) {
        const u = encodeURIComponent(url + (url.includes('?') ? '&' : '?') + 'utm_source=share&utm_medium=blog&utm_campaign=share_bar');
        const t = encodeURIComponent(title);
        return {
            fb: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
            tw: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
            li: `https://www.linkedin.com/shareArticle?mini=true&url=${u}&title=${t}`,
            rd: `https://www.reddit.com/submit?url=${u}&title=${t}`
        };
    }

    // Init/update floating share buttons
    function updateFloatingShare() {
        const bar = document.querySelector('.share-floating');
        if (!bar) return;
        
        const title = document.querySelector('title')?.textContent || 'DealRadarUS Blog';
        const url = location.href.split('#')[0];
        const targets = buildShareTargets(title, url);

        const fb = bar.querySelector('.fb'); if (fb) fb.href = targets.fb;
        const tw = bar.querySelector('.tw'); if (tw) tw.href = targets.tw;
        const li = bar.querySelector('.li'); if (li) li.href = targets.li;
        const rd = bar.querySelector('.rd'); if (rd) rd.href = targets.rd;

        const cp = bar.querySelector('.cp');
        if (cp && !cp.dataset.wired) {
            cp.dataset.wired = '1';
            cp.addEventListener('click', async () => {
                try { 
                    await navigator.clipboard.writeText(url); 
                    cp.classList.add('copied'); 
                    cp.setAttribute('aria-label', 'Link copied'); 
                } catch(e) {
                    const ta = document.createElement('textarea'); 
                    ta.value = url; 
                    document.body.appendChild(ta);
                    ta.select(); 
                    document.execCommand('copy'); 
                    document.body.removeChild(ta);
                    cp.classList.add('copied'); 
                    cp.setAttribute('aria-label', 'Link copied');
                }
                setTimeout(() => { 
                    cp.classList.remove('copied'); 
                    cp.setAttribute('aria-label', 'Copy link'); 
                }, 1200);
            });
        }
    }

    // Build slug from title
    function slugify(s) { 
        return (s || '').toLowerCase().trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, ''); 
    }

    // Collect visible articles -> JSON-LD
    function injectItemListSchema(visibleCards) {
        const holder = document.getElementById('schema-blog-itemlist');
        if (!holder) return;

        const items = visibleCards.map((card, idx) => {
            const title = card.querySelector('.article-title')?.textContent?.trim() || 'Article';
            const date = card.querySelector('time')?.getAttribute('datetime') || '';
            const img = card.querySelector('img')?.src || '';
            const author = card.querySelector('[itemprop="author"] [itemprop="name"]')?.textContent?.trim() || 'DealRadarUS Team';
            const slug = slugify(title);
            const url = `https://dealradarus.com/blog.html#${slug}`;

            return {
                "@type": "BlogPosting",
                "headline": title,
                "url": url,
                "datePublished": date || undefined,
                "image": img || undefined,
                "author": {"@type": "Person", "name": author}
            };
        });

        const json = {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "DealRadarUS Blog",
            "url": "https://dealradarus.com/blog.html",
            "blogPost": items,
            "mainEntityOfPage": {
                "@type": "ItemList",
                "itemListElement": items.map((it, i) => ({
                    "@type": "ListItem", 
                    "position": i + 1, 
                    "url": it.url, 
                    "name": it.headline
                }))
            }
        };

        holder.textContent = JSON.stringify(json);
    }

    // Build related list (3 items) for a given article
    function buildRelatedFor(card, pool) {
        const baseCat = card.getAttribute('data-category');
        const baseTags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent.trim().toLowerCase());
        const title = card.querySelector('.article-title')?.textContent?.trim() || '';
        const meSlug = slugify(title);

        // Rank by: same category > tag overlap > recency (DOM order)
        const scored = pool
            .filter(c => c !== card)
            .map(c => {
                const cat = c.getAttribute('data-category');
                const tags = Array.from(c.querySelectorAll('.tag')).map(t => t.textContent.trim().toLowerCase());
                const catScore = (cat === baseCat) ? 2 : 0;
                const tagScore = tags.some(t => baseTags.includes(t)) ? 1 : 0;
                return {card: c, score: catScore + tagScore};
            })
            .sort((a, b) => b.score - a.score);

        const top = scored.slice(0, 3).map(({card: c}) => {
            const t = c.querySelector('.article-title')?.textContent?.trim() || 'Article';
            const slug = slugify(t);
            return { title: t, href: `#${slug}` };
        });

        const block = card.querySelector('.related-articles');
        const list = card.querySelector('.related-articles .related-list');
        if (!block || !list) return;

        list.innerHTML = '';
        top.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${item.href}" class="related-link" aria-label="Read related: ${item.title}"><i class="fas fa-link" aria-hidden="true"></i> ${item.title}</a>`;
            list.appendChild(li);
        });

        block.hidden = top.length === 0;
    }

    // Main render function
    function renderArticles() {
        // Filter articles based on current state
        const filteredArticles = articleCards.filter(card => {
            // Category filter
            const cardCategory = card.getAttribute('data-category');
            const categoryMatch = state.category === 'all' || cardCategory === state.category;

            // Search filter (search in title and excerpt)
            let searchMatch = true;
            if (state.search) {
                const title = card.querySelector('.article-title')?.textContent.toLowerCase() || '';
                const excerpt = card.querySelector('.article-excerpt')?.textContent.toLowerCase() || '';
                searchMatch = title.includes(state.search.toLowerCase()) || 
                            excerpt.includes(state.search.toLowerCase());
            }

            return categoryMatch && searchMatch;
        });

        // Hide all articles first
        articleCards.forEach(card => {
            card.style.display = 'none';
            card.classList.remove('fade-in');
        });

        // Show paginated results
        const startIndex = 0;
        const endIndex = state.currentPage * state.itemsPerPage;
        const articlesToShow = filteredArticles.slice(startIndex, endIndex);

        articlesToShow.forEach(card => {
            card.style.display = 'block';
            card.classList.add('fade-in');
        });

        // Update results count
        const totalFiltered = filteredArticles.length;
        const showing = Math.min(endIndex, totalFiltered);
        
        if (resultsCount) {
            let countText = '';
            if (state.search) {
                countText = `Found ${showing} of ${totalFiltered} article${totalFiltered === 1 ? '' : 's'} matching "${state.search}"`;
            } else if (state.category !== 'all') {
                countText = `Showing ${showing} of ${totalFiltered} ${state.category} article${totalFiltered === 1 ? '' : 's'}`;
            } else {
                countText = `Showing ${showing} of ${totalFiltered} article${totalFiltered === 1 ? '' : 's'}`;
            }
            resultsCount.textContent = countText;
        }

        // Update load more button
        if (loadMoreBtn) {
            loadMoreBtn.style.display = showing < totalFiltered ? 'block' : 'none';
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More Articles';
        }

        // Sync URL
        syncURL();

        // === NEW ENHANCEMENTS ===
        
        // 1) Update floating share URLs
        updateFloatingShare();

        // 2) Ensure each article has an id (slug of title) for deep links
        articleCards.forEach(card => {
            const t = card.querySelector('.article-title')?.textContent?.trim() || '';
            const slug = slugify(t);
            if (slug && !card.id) card.id = slug;
        });

        // 3) Build visible set for schema + related
        const visibleCards = articleCards.filter(c => c.style.display !== 'none');

        // 4) Inject JSON-LD for ItemList + BlogPosting
        injectItemListSchema(visibleCards);

        // 5) Render related articles for each visible article + featured (if any)
        visibleCards.forEach(c => buildRelatedFor(c, visibleCards));
        const featured = document.querySelector('.article-featured');
        if (featured) {
            buildRelatedFor(featured, visibleCards);
        }
    }

    // Event handlers
    
    // Filter button clicks
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update state
            state.category = this.getAttribute('data-category');
            state.currentPage = 1;

            // Update UI
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');

            // Render
            renderArticles();
        });
    });

    // Search functionality with debouncing
    if (searchInput) {
        const debouncedSearch = debounce(() => {
            state.search = searchInput.value.trim();
            state.currentPage = 1;
            renderArticles();
        }, 250);

        searchInput.addEventListener('input', debouncedSearch);

        // Enter key for immediate search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                state.search = searchInput.value.trim();
                state.currentPage = 1;
                renderArticles();
            }
        });

        // Escape key to clear search
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                state.search = '';
                state.currentPage = 1;
                renderArticles();
            }
        });
    }

    // Tag click handler
    $$('.tag').forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.stopPropagation();
            const tagText = this.textContent.trim();
            
            // Set search to tag text and reset category
            state.search = tagText;
            state.category = 'all';
            state.currentPage = 1;

            // Update UI
            filterButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.category === 'all');
                btn.setAttribute('aria-pressed', btn.dataset.category === 'all');
            });

            if (searchInput) {
                searchInput.value = tagText;
            }

            // Render
            renderArticles();
        });
    });

    // Load more functionality
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.textContent = 'Loading...';
            this.disabled = true;
            
            // Increment page
            state.currentPage++;
            
            // Render with slight delay for UX
            setTimeout(() => {
                renderArticles();
                
                // Scroll to newly loaded content
                setTimeout(() => {
                    const visibleCards = articleCards.filter(card => 
                        card.style.display !== 'none'
                    );
                    const newContentStart = Math.max(0, 
                        (state.currentPage - 1) * state.itemsPerPage - 1
                    );
                    if (visibleCards[newContentStart]) {
                        visibleCards[newContentStart].scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 100);
            }, 300);
        });
    }

    // Copy link functionality
    if (copyBlogLink) {
        copyBlogLink.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(location.href);
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 1200);
            } catch (err) {
                console.log('Clipboard unavailable');
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = location.href;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    const originalText = this.textContent;
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 1200);
                } catch (fallbackErr) {
                    console.log('Fallback copy failed');
                }
                document.body.removeChild(textArea);
            }
        });
    }

    // Article card click tracking (preserve existing functionality)
    articleCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking specific elements
            if (e.target.classList.contains('read-more-btn') || 
                e.target.classList.contains('tag') ||
                e.target.closest('.tag')) {
                return;
            }
            
            const title = this.querySelector('.article-title')?.textContent;
            console.log('Article clicked:', title);
        });
    });

    // Read more button functionality (preserve existing)
    $$('.read-more-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const articleTitle = this.closest('.article-card, .article-featured')
                ?.querySelector('.article-title')?.textContent;
            
            console.log('Reading article:', articleTitle);
            
            // Add loading state
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.disabled = true;
            
            setTimeout(() => {
                alert(`Opening full article: "${articleTitle}"`);
                this.textContent = originalText;
                this.disabled = false;
            }, 500);
        });
    });

    // Article image lazy loading (preserve existing functionality)
    function lazyLoadImages() {
        const images = $$('.article-image img');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.style.filter = 'blur(5px)';
                    setTimeout(() => {
                        img.style.filter = 'none';
                        img.style.transition = 'filter 0.3s ease';
                    }, 300);
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    // Article view tracking (preserve existing functionality)
    function trackArticleViews() {
        const articles = $$('.article-card, .article-featured');
        const viewObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const title = entry.target.querySelector('.article-title')?.textContent;
                    console.log('Article viewed:', title);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px'
        });
        
        articles.forEach(article => viewObserver.observe(article));
    }

    // Social sharing functionality (preserve existing)
    function addSocialSharing() {
        $$('.article-card, .article-featured').forEach(article => {
            const shareButton = document.createElement('button');
            shareButton.className = 'share-btn';
            shareButton.innerHTML = '<i class="fas fa-share-alt"></i>';
            shareButton.title = 'Share Article';
            
            shareButton.addEventListener('click', function(e) {
                e.stopPropagation();
                const title = article.querySelector('.article-title')?.textContent;
                
                if (navigator.share) {
                    navigator.share({
                        title: title,
                        text: 'Check out this article from DealRadarUS',
                        url: window.location.href
                    });
                } else {
                    alert(`Share: "${title}"`);
                }
            });
            
            const articleContent = article.querySelector('.article-content');
            if (articleContent && !articleContent.querySelector('.share-btn')) {
                articleContent.appendChild(shareButton);
            }
        });
    }

    // Reading progress indicator (preserve existing functionality)
    function addReadingProgress() {
        const featuredArticle = $('.article-featured');
        if (featuredArticle) {
            const progressBar = document.createElement('div');
            progressBar.className = 'reading-progress';
            progressBar.setAttribute('aria-label', 'Reading progress');
            progressBar.setAttribute('role', 'progressbar');
            progressBar.setAttribute('aria-valuemin', '0');
            progressBar.setAttribute('aria-valuemax', '100');
            document.body.appendChild(progressBar);
            
            window.addEventListener('scroll', () => {
                const articleTop = featuredArticle.offsetTop;
                const articleHeight = featuredArticle.offsetHeight;
                const windowHeight = window.innerHeight;
                const scrollTop = window.pageYOffset;
                
                const articleStart = articleTop - windowHeight;
                const articleEnd = articleTop + articleHeight;
                
                if (scrollTop > articleStart && scrollTop < articleEnd) {
                    const progress = Math.min(Math.max((scrollTop - articleStart) / (articleEnd - articleStart) * 100, 0), 100);
                    progressBar.style.width = progress + '%';
                    progressBar.style.opacity = '1';
                    progressBar.setAttribute('aria-valuenow', Math.round(progress));
                } else {
                    progressBar.style.opacity = '0';
                    progressBar.setAttribute('aria-valuenow', '0');
                }
            });
        }
    }

    // Initialize everything
    function initialize() {
        // Load saved state first
        loadState();
        
        // Initialize state from URL (overrides saved state if URL has params)
        initializeState();
        
        // Initialize preserved features
        lazyLoadImages();
        trackArticleViews();
        addReadingProgress();
        
        // Uncomment to enable social sharing
        // addSocialSharing();
        
        // Initial render
        renderArticles();
    }

    // Start the app
    initialize();
});

// Add enhanced CSS styles
const enhancedBlogStyle = document.createElement('style');
enhancedBlogStyle.textContent = `
    /* Share button styles */
    .share-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: rgba(26, 115, 232, 0.9);
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s ease;
        z-index: 10;
    }
    
    .share-btn:hover {
        background: rgba(26, 115, 232, 1);
        transform: scale(1.1);
    }
    
    .share-btn:focus {
        outline: 2px solid #1A73E8;
        outline-offset: 2px;
    }
    
    /* Article positioning */
    .article-card {
        position: relative;
    }
    
    /* Reading progress bar */
    .reading-progress {
        position: fixed;
        top: 80px;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #1A73E8, #FF3B30);
        z-index: 1000;
        transition: width 0.1s ease, opacity 0.3s ease;
        opacity: 0;
    }
    
    /* Tag enhancements */
    .tag {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .tag:hover {
        background: #1A73E8;
        color: white;
        transform: scale(1.05);
    }
    
    .tag:focus {
        outline: 2px solid #1A73E8;
        outline-offset: 2px;
    }
    
    /* Image hover effects */
    .article-card:hover .article-image img {
        transform: scale(1.05);
    }
    
    /* Animation enhancements */
    .fade-in {
        animation: articleFadeIn 0.5s ease-in-out;
    }
    
    .results-count {
        font-size: 0.9rem;
        color: #666;
        font-style: italic;
    }
    
    @keyframes articleFadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Loading states */
    .load-more-btn:disabled,
    .read-more-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .share-btn {
            width: 36px;
            height: 36px;
            font-size: 0.9rem;
        }
        
        .reading-progress {
            top: 60px;
        }
    }
`;
document.head.appendChild(enhancedBlogStyle);