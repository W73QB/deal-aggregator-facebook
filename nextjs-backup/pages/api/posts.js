// Blog Posts API Endpoint
// Provides structured blog post data for SSR and client-side rendering

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Fallback blog posts data (in production, this would come from CMS or database)
    const posts = [
      {
        id: 1,
        title: "Best Refurbished MacBook Deals for 2024",
        slug: "best-refurbished-macbook-deals-2024",
        excerpt: "Discover the top refurbished MacBook deals this year. Save up to $500 on certified pre-owned Apple laptops with warranty included.",
        content: "Complete guide to finding the best refurbished MacBook deals...",
        category: "buying-guide",
        author: "Sarah Johnson",
        publishedAt: "2024-12-15T10:00:00Z",
        updatedAt: "2024-12-15T10:00:00Z",
        views: "2.5K",
        readTime: "5 min read",
        featured: true,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=400&fit=crop",
        tags: ["MacBook", "Refurbished", "Apple", "Laptops"],
        seo: {
          metaTitle: "Best Refurbished MacBook Deals 2024 - Save Up to $500",
          metaDescription: "Find the best refurbished MacBook deals with warranty. Expert guide to buying certified pre-owned Apple laptops safely."
        }
      },
      {
        id: 2,
        title: "iPhone 14 vs iPhone 15: Which Refurbished Model to Buy?",
        slug: "iphone-14-vs-iphone-15-refurbished-comparison",
        excerpt: "Comparing refurbished iPhone 14 and iPhone 15 deals. Which model offers the best value for money in 2024?",
        content: "Detailed comparison of iPhone 14 vs iPhone 15 refurbished options...",
        category: "tech-reviews",
        author: "Mike Chen",
        publishedAt: "2024-12-10T14:30:00Z",
        updatedAt: "2024-12-10T14:30:00Z",
        views: "1.8K",
        readTime: "7 min read",
        featured: true,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=400&fit=crop",
        tags: ["iPhone", "Comparison", "Apple", "Refurbished"],
        seo: {
          metaTitle: "iPhone 14 vs iPhone 15 Refurbished: Best Value Comparison 2024",
          metaDescription: "Expert comparison of refurbished iPhone 14 vs iPhone 15 deals. Find the best value iPhone with our detailed buying guide."
        }
      },
      {
        id: 3,
        title: "Smart Home Deals: Best Open-Box Electronics This Week",
        slug: "smart-home-open-box-deals-weekly",
        excerpt: "Weekly roundup of the best open-box smart home deals. Amazon Echo, Google Nest, and more with up to 40% savings.",
        content: "This week's best smart home open-box deals...",
        category: "deal-alerts",
        author: "Emma Rodriguez",
        publishedAt: "2024-12-08T09:00:00Z",
        updatedAt: "2024-12-08T09:00:00Z",
        views: "3.2K",
        readTime: "4 min read",
        featured: false,
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=400&fit=crop",
        tags: ["Smart Home", "Open Box", "Weekly Deals", "Amazon Echo"],
        seo: {
          metaTitle: "Best Smart Home Open-Box Deals This Week - Up to 40% Off",
          metaDescription: "Weekly smart home deals roundup. Find open-box Amazon Echo, Google Nest, and smart devices with huge savings."
        }
      },
      {
        id: 4,
        title: "Gaming Console Buying Guide: Refurbished vs New",
        slug: "gaming-console-refurbished-vs-new-guide",
        excerpt: "Should you buy a refurbished gaming console? Complete guide to PS5, Xbox Series X, and Nintendo Switch refurbished options.",
        content: "Comprehensive guide to buying refurbished gaming consoles...",
        category: "buying-guide",
        author: "Alex Thompson",
        publishedAt: "2024-12-05T16:45:00Z",
        updatedAt: "2024-12-05T16:45:00Z",
        views: "4.1K",
        readTime: "8 min read",
        featured: false,
        image: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800&h=400&fit=crop",
        tags: ["Gaming", "PS5", "Xbox", "Nintendo Switch", "Refurbished"],
        seo: {
          metaTitle: "Gaming Console Buying Guide: Refurbished vs New - 2024",
          metaDescription: "Should you buy refurbished gaming consoles? Expert guide to PS5, Xbox Series X, Nintendo Switch refurbished deals."
        }
      },
      {
        id: 5,
        title: "Holiday Tech Deals: What to Expect in Late 2024",
        slug: "holiday-tech-deals-2024-predictions",
        excerpt: "Holiday shopping preview: predicted tech deals for Black Friday, Cyber Monday, and Christmas 2024. Plan your purchases now.",
        content: "Holiday tech deals predictions and shopping strategy...",
        category: "deal-alerts",
        author: "David Park",
        publishedAt: "2024-12-01T11:20:00Z",
        updatedAt: "2024-12-01T11:20:00Z",
        views: "5.7K",
        readTime: "6 min read",
        featured: true,
        image: "https://images.unsplash.com/photo-1607083206325-cad6b8ad6756?w=800&h=400&fit=crop",
        tags: ["Holiday Deals", "Black Friday", "Cyber Monday", "Tech Shopping"],
        seo: {
          metaTitle: "Holiday Tech Deals 2024: Black Friday & Cyber Monday Predictions",
          metaDescription: "Preview of holiday tech deals 2024. Expert predictions for Black Friday, Cyber Monday, and Christmas tech discounts."
        }
      }
    ];

    // Filter by category if specified
    const { category, limit = 50 } = req.query;
    let filteredPosts = posts;

    if (category && category !== 'all') {
      filteredPosts = posts.filter(post => post.category === category);
    }

    // Apply limit
    filteredPosts = filteredPosts.slice(0, parseInt(limit));

    // Calculate category counts
    const categories = [
      { id: 'all', name: 'All Posts', count: posts.length },
      { id: 'buying-guide', name: 'Buying Guides', count: posts.filter(p => p.category === 'buying-guide').length },
      { id: 'tech-reviews', name: 'Tech Reviews', count: posts.filter(p => p.category === 'tech-reviews').length },
      { id: 'deal-alerts', name: 'Deal Alerts', count: posts.filter(p => p.category === 'deal-alerts').length },
      { id: 'smart-home', name: 'Smart Home', count: posts.filter(p => p.category === 'smart-home').length },
      { id: 'gaming', name: 'Gaming', count: posts.filter(p => p.category === 'gaming').length }
    ];

    // Response with metadata
    const response = {
      success: true,
      posts: filteredPosts,
      totalPosts: posts.length,
      filteredCount: filteredPosts.length,
      categories: categories,
      meta: {
        generated: new Date().toISOString(),
        source: 'api',
        version: '1.0'
      }
    };

    // Cache headers for performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');

    res.status(200).json(response);
  } catch (error) {
    console.error('Blog API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog posts',
      message: error.message
    });
  }
}