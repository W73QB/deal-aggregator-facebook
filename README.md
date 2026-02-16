# DealRadarUS - Global Crypto News & Analysis

DealRadarUS is a premier cryptocurrency news and analysis platform providing real-time market updates, in-depth analysis, and comprehensive guides for global investors.

**Live Site**: [https://dealradarus.com](https://dealradarus.com)

---

## 🚀 Technology Stack

- **Static Site Generator**: [Hugo](https://gohugo.io/) (v0.155.1 extended)
- **Theme**: Custom `dealradar` theme
- **Hosting**: [GitHub Pages](https://pages.github.com/)
- **DNS & CDN**: [Cloudflare](https://www.cloudflare.com/)
- **CI/CD**: GitHub Actions

---

## 🛠️ Local Development Setup

### Prerequisites
- [Hugo Extended](https://gohugo.io/installation/) (v0.120.0+)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/W73QB/deal-aggregator-facebook.git dealradarus
   cd dealradarus
   ```

2. **Start the local server**
   ```bash
   hugo server -D
   ```

3. **Access the site**
   Open [http://localhost:1313](http://localhost:1313) in your browser.

---

## 📝 Content Creation Workflow

We use Hugo archetypes to ensure consistent content structure.

### 1. Creating News
For breaking news and updates:
```bash
hugo new --kind crypto-news news/your-article-slug.md
```

### 2. Creating Analysis
For market analysis and price predictions:
```bash
hugo new --kind crypto-analysis analysis/your-article-slug.md
```

### 3. Creating Guides
For educational tutorials:
```bash
hugo new --kind crypto-guide guides/your-article-slug.md
```

### 4. Creating Reviews
For exchange and product reviews:
```bash
hugo new --kind crypto-exchange-review reviews/your-article-slug.md
```

---

## 🚀 Deployment Process

Deployment is automated via GitHub Actions.

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: Add new article about Bitcoin"
   ```

2. **Push to main**
   ```bash
   git push origin main
   ```

3. **Verify Deployment**
   - Check the [Actions tab](https://github.com/W73QB/deal-aggregator-facebook/actions) for build status.
   - Visit [dealradarus.com](https://dealradarus.com) to see changes.

---

## 🌐 Cloudflare DNS Configuration

To point `dealradarus.com` to GitHub Pages while using Cloudflare features:

### 1. A Records (Apex Domain)
Map `dealradarus.com` to GitHub Pages IPs:
- `185.199.108.153` (Proxied)
- `185.199.109.153` (Proxied)
- `185.199.110.153` (Proxied)
- `185.199.111.153` (Proxied)

### 2. CNAME Record (www)
Map `www` subdomain:
- Type: `CNAME`
- Name: `www`
- Target: `dealradarus.com`
- Proxy: Enabled

### 3. Page Rules (Optional but Recommended)
Force HTTPS and redirect `www` to apex (or vice versa).

---

## 💰 Affiliate Program Setup

Affiliate codes are configured in `hugo.toml`.

```toml
[params]
  binanceRef = "YOUR_REF_CODE"
  bybitRef = "YOUR_REF_CODE"
  okxRef = "YOUR_REF_CODE"
```

### Using Affiliate Links
Use the shortcodes to insert affiliate links in content:

**Button CTA:**
```html
{{< affiliate exchange="binance" >}}
```

**Inline Link:**
```html
{{< affiliate-link exchange="bybit" text="Sign up on Bybit" >}}
```

---

## 🔍 SEO Guidelines

- **Title**: Under 60 characters, include primary keyword.
- **Description**: Under 160 characters, compelling summary.
- **Images**: Use `og-share.png` for social sharing. All images must be optimized (<100KB).
- **Frontmatter**: Ensure `tags`, `categories`, and `keywords` are populated.

---

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-article`)
2. Commit your changes
3. Push to the branch
4. Open a Pull Request

---

© 2026 DealRadarUS. All rights reserved.
