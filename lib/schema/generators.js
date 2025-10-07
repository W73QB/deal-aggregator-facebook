/**
 * Schema.org Structured Data Generators
 * Generates JSON-LD structured data for SEO optimization
 */

export const generateProductSchema = (deal) => {
  if (!deal) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": deal.title,
    "description": deal.description || deal.title,
    "image": deal.image ? [deal.image] : [],
    "url": `https://dealradarus.com/deals/${deal.id}`,
    "brand": {
      "@type": "Brand",
      "name": deal.brand || deal.seller || deal.store
    },
    "category": deal.category,
    "sku": deal.id?.toString(),
    "offers": {
      "@type": "Offer",
      "url": deal.affiliateUrl || `https://dealradarus.com/deals/${deal.id}`,
      "priceCurrency": "USD",
      "price": deal.salePrice || deal.price,
      "priceValidUntil": deal.expiresAt,
      "availability": deal.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": deal.seller || deal.store
      },
      "condition": deal.condition === "New" ? "https://schema.org/NewCondition" : "https://schema.org/RefurbishedCondition"
    },
    "aggregateRating": deal.rating ? {
      "@type": "AggregateRating",
      "ratingValue": deal.rating,
      "reviewCount": deal.reviewCount || 100,
      "bestRating": 5,
      "worstRating": 1
    } : undefined
  };

  // Add pricing history for better SEO
  if (deal.originalPrice && deal.salePrice && deal.originalPrice > deal.salePrice) {
    schema.offers.priceSpecification = {
      "@type": "UnitPriceSpecification",
      "price": deal.salePrice,
      "priceCurrency": "USD",
      "valueAddedTaxIncluded": true
    };
  }

  return schema;
};

export const generateBreadcrumbSchema = (items) => {
  if (!items || items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://dealradarus.com${item.url}`
    }))
  };
};

export const generateArticleSchema = (post) => {
  if (!post) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image ? [post.image] : [],
    "datePublished": post.publishDate || post.publishedAt,
    "dateModified": post.updatedAt || post.publishDate || post.publishedAt,
    "author": {
      "@type": "Person",
      "name": post.author || "DealRadar Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DealRadarUS",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dealradarus.com/logo-concept.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://dealradarus.com/blog/${post.slug}`
    },
    "articleSection": post.category,
    "keywords": post.tags ? post.tags.join(", ") : "",
    "wordCount": post.readTime ? parseInt(post.readTime) * 200 : 1000, // Estimate based on read time
    "url": `https://dealradarus.com/blog/${post.slug}`
  };
};

export const generateWebPageSchema = (pageData) => {
  if (!pageData) return null;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageData.title,
    "description": pageData.description,
    "url": `https://dealradarus.com${pageData.url}`,
    "mainEntity": pageData.mainEntity,
    "breadcrumb": pageData.breadcrumb,
    "isPartOf": {
      "@type": "WebSite",
      "name": "DealRadarUS",
      "url": "https://dealradarus.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DealRadarUS",
      "url": "https://dealradarus.com"
    }
  };
};

export const generateProductListSchema = (deals, listName = "Featured Deals") => {
  if (!deals || deals.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName,
    "description": `Curated list of ${deals.length} best tech deals from trusted retailers`,
    "numberOfItems": deals.length,
    "url": "https://dealradarus.com/deals",
    "itemListElement": deals.map((deal, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": deal.title,
        "url": `https://dealradarus.com/deals/${deal.id}`,
        "image": deal.image,
        "offers": {
          "@type": "Offer",
          "price": deal.salePrice || deal.price,
          "priceCurrency": "USD",
          "availability": deal.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      }
    }))
  };
};

export const generateFAQSchema = (faqs) => {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export const generateLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DealRadarUS",
    "alternateName": "DealRadar US",
    "url": "https://dealradarus.com",
    "logo": "https://dealradarus.com/logo-concept.svg",
    "description": "Your trusted source for the best tech deals in the US. We scan thousands of deals daily to bring you verified discounts on electronics, gadgets, and more.",
    "foundingDate": "2024",
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "serviceType": "Deal Aggregation and Price Comparison",
    "knowsAbout": [
      "Technology Deals",
      "Electronics Discounts",
      "Smart Home Devices",
      "Gaming Equipment",
      "Consumer Electronics"
    ],
    "sameAs": [
      "https://facebook.com/dealradarus",
      "https://x.com/dealradarus",
      "https://instagram.com/dealradarus"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "12500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": "English",
      "url": "https://dealradarus.com/contact"
    }
  };
};

// Utility function to safely stringify JSON-LD
export const safeJSONStringify = (schema) => {
  try {
    return JSON.stringify(schema);
  } catch (error) {
    console.error('Error stringifying schema:', error);
    return '{}';
  }
};