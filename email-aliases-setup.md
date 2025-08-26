# 📧 DealRadarUS Email Aliases & Forwarding Setup

## Email Infrastructure Overview

**Primary Email:** `deals@dealradarus.com`  
**Domain:** `dealradarus.com`

## 1. Email Aliases Configuration

Set up the following email aliases to forward to `deals@dealradarus.com`:

```
support@dealradarus.com   → deals@dealradarus.com
contact@dealradarus.com   → deals@dealradarus.com  
info@dealradarus.com      → deals@dealradarus.com
admin@dealradarus.com     → deals@dealradarus.com
hello@dealradarus.com     → deals@dealradarus.com
```

## 2. DNS Records for Email Authentication

Add these DNS records for better deliverability:

### SPF Record
```
v=spf1 include:sendgrid.net include:_spf.google.com ~all
```

### DMARC Record  
```
v=DMARC1; p=quarantine; rua=mailto:deals@dealradarus.com
```

### DKIM Records
Set up DKIM through your ESP (SendGrid/Mailgun/SES)

## 3. ESP Configuration Examples

### SendGrid Setup
1. Add domain `dealradarus.com`
2. Set default From: `deals@dealradarus.com`
3. Configure Reply-To: `deals@dealradarus.com`
4. Add API key to `.env`

### Mailgun Setup  
1. Add domain `dealradarus.com`
2. Set default sender: `deals@dealradarus.com`
3. Configure tracking domain
4. Add API credentials to `.env`

### AWS SES Setup
1. Verify domain `dealradarus.com`
2. Set up configuration set
3. Default From: `deals@dealradarus.com`
4. Add IAM credentials to `.env`

## 4. Application Configuration

Update these environment variables:
```bash
EMAIL_FROM=deals@dealradarus.com
MAIL_FROM_ADDRESS=deals@dealradarus.com
SUPPORT_EMAIL=deals@dealradarus.com
CONTACT_EMAIL_TO=deals@dealradarus.com
```

## 5. Testing Email Delivery

### Test Commands
```bash
# Test SMTP configuration
php artisan mail:test deals@dealradarus.com

# Send test email via API
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "deals@dealradarus.com"},
    "subject": "Test Email",
    "content": [{"type": "text/plain", "value": "Test message"}]
  }'
```

## 6. Monitoring & Alerts

Set up monitoring for:
- Email delivery rates
- Bounce rates  
- Spam complaints
- Domain reputation

## 7. Backup & Recovery

- Keep backup of DNS records
- Document ESP configuration
- Test alias forwarding monthly
- Monitor for delivery issues

---

**🎯 Goal:** Ensure no email communication is lost during the transition to the unified `deals@dealradarus.com` address while maintaining professional brand consistency.