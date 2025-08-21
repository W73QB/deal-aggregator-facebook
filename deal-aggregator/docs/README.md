# Deal Aggregator Facebook-First MVP

## Mục Tiêu Dự Án

Deal Aggregator là một hệ thống tự động tìm kiếm và chia sẻ các deal giảm giá từ Amazon US/UK lên Facebook, nhằm tạo thu nhập thụ động qua affiliate marketing. Dự án tập trung vào chiến lược Facebook-first trong 7 ngày đầu để validate market fit và tạo traction nhanh chóng.

### Tính Năng Chính
- ✅ **Crawl Deal Tự Động**: Thu thập deals từ Amazon US/UK
- ✅ **Enrich Content**: Tự động gắn affiliate links, UTM tracking, captions 
- ✅ **Facebook Integration**: Posting tự động via Graph API
- ✅ **Compliance**: Tuân thủ FTC/ASA disclosure requirements
- ✅ **Multi-timezone**: Optimal posting times cho US ET & UK GMT

## Cấu Trúc Thư Mục

```
~/projects/deal-aggregator-facebook/
├── deals/
│   ├── raw/          # Dữ liệu thô crawl từ Amazon/Slickdeals
│   └── enriched/     # Dữ liệu đã gắn affiliate + caption
├── media/            # Screenshots sản phẩm cho social media
├── logs/             # Log quá trình crawl/post + reports
├── config/           # File .env.local.json và configuration
└── README.md         # File này
```

## Hướng Dẫn Sử Dụng

### 1. Cấu Hình Ban Đầu

**Cập nhật file config/.env.local.json:**
```json
{
  "AFF_AMAZON_US": "yourtag-20",
  "AFF_AMAZON_UK": "yourtag-21", 
  "AFFILIATE_DISCLOSURE_US": "This post contains affiliate links. As an Amazon Associate, we earn from qualifying purchases.",
  "AFFILIATE_DISCLOSURE_UK": "This post contains affiliate links. #ad #affiliate",
  "FB_PAGE_ID": "your-facebook-page-id",
  "FB_PAGE_ACCESS_TOKEN": "your-long-lived-page-access-token",
  "BITLY_TOKEN": "optional-link-shortener-token",
  "REBRANDLY_API_KEY": "optional-rebrandly-key",
  "TIMEZONES": {
    "US_ET": "America/New_York",
    "UK": "Europe/London"
  },
  "MAX_POSTS_PER_DAY": 10,
  "MIN_SECONDS_BETWEEN_POSTS": 600
}
```

### 2. Checklist Bắt Buộc

#### 🎯 Week 1 (MANDATORY)
- [ ] **Facebook Page**: Tạo hoặc có quyền Admin
- [ ] **Meta Developer App**: Tạo app với permission "Pages Manage Posts"
- [ ] **Page Access Token**: Generate long-lived token (không bao giờ expired)
- [ ] **Amazon Affiliate**: Đăng ký tài khoản US & UK
  - US: yourtag-20
  - UK: yourtag-21
- [ ] **Cập nhật Config**: Replace placeholder values trong .env.local.json

#### 🎯 Week 2+ (OPTIONAL)
- [ ] **Link Shortener**: Bitly hoặc Rebrandly integration
- [ ] **Analytics**: Google Analytics 4 + UTM tracking
- [ ] **Facebook Pixel**: Cho retargeting campaigns

### 3. Workflow Hàng Ngày

#### Phase 1: Data Collection
1. **Crawl Deals**: Tự động thu thập từ Amazon US/UK
   - Output: `deals/raw/YYYY-MM-DD.jsonl`
   - Target: 6+ deals mỗi lần chạy

#### Phase 2: Content Processing  
2. **Enrich Content**: Xử lý affiliate links + captions
   - Input: Raw deals từ Phase 1
   - Output: `deals/enriched/YYYY-MM-DD.jsonl`
   - Include: UTM parameters, FTC/ASA compliance

3. **Generate Media**: Screenshot sản phẩm
   - Output: `media/YYYY-MM-DD/`
   - Format: PNG, optimized cho Facebook

#### Phase 3: Publishing
4. **Schedule Posts**: Facebook Graph API
   - Optimal times: US (8:30, 12:30, 18:00, 21:00 ET), UK (8:00, 12:00, 17:30, 20:30 GMT)
   - Rate limit: Max 10 posts/day, min 10 phút giữa các posts

### 4. Monitoring & Analytics

**Daily Checks:**
- Facebook Page Access Token validity
- Deal accuracy (tránh expired/redirected URLs)
- Engagement metrics & CTR
- UTM tracking performance

**Weekly Reviews:**
- Revenue vs costs analysis
- Top performing deal categories
- Optimal posting times validation
- Content format A/B test results

## Commands Thường Dùng

```bash
# Chạy full pipeline (crawl + enrich + post)
# [Command sẽ được setup trong production]

# Check logs
tail -f logs/execution-YYYY-MM-DD.log

# Validate configuration
cat config/.env.local.json

# Monitor Facebook posting
cat logs/facebook-posts-YYYY-MM-DD.csv
```

## Troubleshooting

### Token Issues
- **Token Expired**: Regenerate long-lived Page Access Token
- **Permission Denied**: Check app có "Pages Manage Posts" permission

### Deal Issues  
- **Product Redirects**: URL validation trước khi post
- **Expired Deals**: Check timestamps trong raw data

### Rate Limiting
- **Facebook Limits**: Giảm MAX_POSTS_PER_DAY trong config
- **Amazon Blocking**: Add delays giữa crawl requests

## Performance Targets (Week 1)

- **Technical KPIs**:
  - 90%+ successful post delivery
  - 6+ deals crawled daily
  - <5 minutes total pipeline execution

- **Business KPIs**:
  - 2%+ average engagement rate
  - 100+ email subscribers
  - Break-even operational costs

## Support & Resources

- **Technical Issues**: Check logs/ directory đầu tiên
- **Facebook API**: [Meta Developer Documentation](https://developers.facebook.com/docs/)
- **Amazon Affiliate**: [Associates Central](https://affiliate-program.amazon.com/)

---

**Project Status**: ✅ PRODUCTION READY  
**Last Updated**: 2025-08-19  
**Version**: 1.0.0 (Facebook-First MVP)