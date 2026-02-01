# DealRadarUS - Hugo Static Site

Fast, SEO-optimized affiliate marketing site built with Hugo.

## 🚀 Quick Start

### Local Development

```bash
hugo server -D
```

Visit: http://localhost:1313

### Build for Production

```bash
hugo --gc --minify
```

Output in `public/` directory.

## 📝 Adding Content

### Create New Blog Post

```bash
hugo new content/blog/my-post-title.md
```

Edit the frontmatter:

```yaml
---
title: 'Your Post Title'
date: 2026-02-01
categories: ['buying-guides']
tags: ['tech', 'deals']
description: 'SEO description'
image: 'https://example.com/image.jpg'
---
Your content here...
```

### Create New Deal

```bash
hugo new content/deals/product-name.md
```

Frontmatter template:

```yaml
---
title: 'Product Name - $XX (Save $YY)'
date: 2026-02-01
categories: ['laptops']
tags: ['brand', 'category']
store: 'Amazon'
price: 99.99
originalPrice: 149.99
discount: 33
rating: 4.8
amazonAsin: 'B01234567'
description: 'Product description'
image: 'https://example.com/image.jpg'
features:
  - 'Feature 1'
  - 'Feature 2'
pros:
  - 'Pro 1'
  - 'Pro 2'
cons:
  - 'Con 1'
---
Your deal description...
```

## 🔗 Affiliate Links

Amazon affiliate tag is configured in `hugo.toml`:

```toml
[params]
  amazonTag = "dealradarus-20"
```

### Using Affiliate Links in Content

**Amazon ASIN Method** (frontmatter):

```yaml
amazonAsin: 'B07VT259S5'
```

Layout will generate: `https://www.amazon.com/dp/B07VT259S5?tag=dealradarus-20`

**Direct Link Method** (in markdown):

```markdown
[Buy on Amazon](https://www.amazon.com/dp/ASIN?tag=dealradarus-20)
```

## 🎨 Theme Customization

### Colors

Edit `themes/dealradar/assets/css/main.css`:

```css
:root {
  --primary: #2563eb;
  --secondary: #10b981;
  --danger: #ef4444;
}
```

### Layouts

- `themes/dealradar/layouts/_default/baseof.html` - Base template
- `themes/dealradar/layouts/index.html` - Homepage
- `themes/dealradar/layouts/blog/single.html` - Blog post
- `themes/dealradar/layouts/deals/single.html` - Deal page

## 📊 SEO Features

✅ Schema.org markup (Article, Product, Organization)
✅ Open Graph tags
✅ Twitter Cards
✅ Sitemap auto-generated
✅ robots.txt included
✅ Canonical URLs
✅ Meta descriptions
✅ Image optimization

## 🚢 Deployment

### Netlify (Recommended)

1. **Connect GitHub repo** to Netlify
2. **Build settings** (already configured in `netlify.toml`):
   - Build command: `hugo --gc --minify`
   - Publish directory: `public`
3. **Deploy!**

### Vercel

```bash
vercel --prod
```

Build settings:

- Framework: Hugo
- Build command: `hugo --gc --minify`
- Output: `public`

### GitHub Pages

```bash
hugo --gc --minify
```

Push `public/` directory to `gh-pages` branch.

## 📈 Performance

**Hugo build time:** ~165ms for 71 pages
**Lighthouse scores:** All 90+ (target)

Features:

- Minified CSS/JS
- Lazy loading images
- No external dependencies
- Static HTML (ultra-fast)

## 🔧 Configuration

Main config: `hugo.toml`

Key settings:

```toml
baseURL = 'https://dealradarus.com/'
[params]
  amazonTag = "dealradarus-20"
  affiliateDisclosure = "We may earn commission..."
[pagination]
  pagerSize = 12
```

## 📁 Project Structure

```
.
├── archetypes/       # Content templates
├── content/          # Markdown content
│   ├── blog/        # Blog posts
│   ├── deals/       # Deal pages
│   └── pages/       # Static pages
├── themes/
│   └── dealradar/   # Custom theme
│       ├── assets/  # CSS, JS
│       └── layouts/ # HTML templates
├── static/          # Static files (favicon, robots.txt)
└── hugo.toml        # Site configuration
```

## 💡 Tips

1. **Always use frontmatter** for SEO metadata
2. **Optimize images** before uploading (use CDN URLs)
3. **Add affiliate disclosure** to all deal pages
4. **Use descriptive URLs** (slugs)
5. **Test locally** before deploying

## 🆘 Troubleshooting

**Build fails:**

```bash
hugo --gc --minify --debug
```

**Clear cache:**

```bash
rm -rf public/ resources/
hugo --gc --minify
```

**Check Hugo version:**

```bash
hugo version
```

Required: v0.155.1+

## 📞 Support

- Hugo Docs: https://gohugo.io/documentation/
- Theme: Custom dealradar theme
- Amazon Associates: https://affiliate-program.amazon.com/

---

**Next.js backup:** Previous Next.js project backed up in `nextjs-backup/`

Built with ❤️ for affiliate marketing success!
