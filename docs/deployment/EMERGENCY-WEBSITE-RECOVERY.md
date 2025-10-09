# 🚨 KHÔI PHỤC WEBSITE KHẨN CẤP - dealradarus.com

## TÌNH TRẠNG HIỆN Tại
- **Domain Status**: CLIENT HOLD (Đình chỉ)
- **Registrar**: Squarespace Domains LLC  
- **Hosting**: Vercel (IP: 76.76.21.21) - HOẠT ĐỘNG BÌNH THƯỜNG
- **DNS**: Google Domains nameservers

## NGUYÊN NHÂN
Domain bị Squarespace đình chỉ (CLIENT HOLD), có thể do:
- Thanh toán không thành công
- Vi phạm điều khoản dịch vụ  
- Vấn đề xác thực tài khoản

## HÀNH ĐỘNG KHẨN CẤP (TRONG 24H)

### 1. LIÊN HỆ SQUARESPACE NGAY LẬP TỨC
```
Email: abuse-complaints@squarespace.com
Phone: +1.646-693-5324
Support: https://domains.squarespace.com
```

### 2. KIỂM TRA THANH TOÁN
- Đăng nhập tài khoản Squarespace
- Xác minh thanh toán domain renewal
- Cập nhật thông tin thẻ tín dụng nếu cần

### 3. GIẢI PHÁP TẠM THỜI (NGAY LẬP TỨC)
```bash
# Sử dụng subdomain miễn phí từ Vercel
curl -X POST https://api.vercel.com/v1/projects \
  -H "Authorization: Bearer [VERCEL_TOKEN]" \
  -d '{"name": "dealradar-backup"}'

# Hoặc sử dụng domain backup
# dealradar-us.vercel.app
```

### 4. GIẢI PHÁP DÀI HẠN

#### Option A: Khôi phục domain hiện tại
1. Giải quyết vấn đề với Squarespace
2. Chờ 24-48h để CLIENT HOLD được gỡ bỏ
3. Kiểm tra DNS propagation

#### Option B: Chuyển domain khác (Nếu không khôi phục được)
1. Đăng ký domain mới: dealradar.us / dealradar.net
2. Cập nhật automation scripts
3. Setup 301 redirect khi domain cũ khôi phục

## CẬP NHẬT AUTOMATION SYSTEM

### File cần chỉnh sửa:
1. `automation/complete-automation-master.js`
2. `automation/facebook-compliance-system.js`  
3. `automation/viral-distribution-engine.js`

### Thay đổi URL tạm thời:
```javascript
// Thay thế
const WEBSITE_URL = 'https://dealradarus.com';
// Bằng
const WEBSITE_URL = 'https://dealradar-us.vercel.app';
```

## MONITOR RECOVERY
```bash
# Kiểm tra domain status
watch -n 300 'whois dealradarus.com | grep "Domain Status"'

# Test DNS resolution  
watch -n 60 'nslookup dealradarus.com'
```

## CONTACT INFO
- Domain expires: 2026-08-23
- Last updated: 2025-09-07T10:25:04Z
- Country: Vietnam (VN)

## NEXT STEPS
1. [ ] Liên hệ Squarespace support NGAY
2. [ ] Setup temporary domain
3. [ ] Update all automation scripts  
4. [ ] Monitor recovery progress
5. [ ] Plan domain migration if needed