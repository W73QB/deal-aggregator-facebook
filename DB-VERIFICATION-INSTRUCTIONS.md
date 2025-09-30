# 🔧 DATABASE VERIFICATION INSTRUCTIONS

## **BƯỚC 2: XÁC NHẬN SCHEMA BẰNG PSQL**

**⚠️ Bước này cần thực hiện từ máy có PostgreSQL client**

### **2.1: Cài đặt PostgreSQL Client (nếu chưa có)**

**macOS:**
```bash
brew install libpq
brew link --force libpq
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql-client
```

**Windows:**
- Cài PostgreSQL official hoặc dùng WSL

### **2.2: Kết nối Database Production**

```bash
# Cách 1: Trực tiếp (KHÔNG KHUYẾN KHÍCH - lộ password)
psql "postgresql://neondb_owner:npg_DOvMB0x2AJut@ep-bold-night-adnxdrn9.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Cách 2: Dùng biến môi trường (AN TOÀN HƠN)
export DATABASE_URL="postgresql://neondb_owner:npg_DOvMB0x2AJut@ep-bold-night-adnxdrn9.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
psql "$DATABASE_URL"
```

### **2.3: Kiểm tra Schema**

**Khi đã vào psql prompt `neondb=>`, chạy:**

```sql
-- Liệt kê tất cả bảng
\dt

-- Kiểm tra bảng analytics_events
\dt analytics_events

-- Kiểm tra bảng error_logs
\dt error_logs

-- Xem cấu trúc bảng analytics_events
\d analytics_events

-- Xem cấu trúc bảng error_logs
\d error_logs

-- Kiểm tra dữ liệu hiện tại
SELECT COUNT(*) FROM analytics_events;
SELECT COUNT(*) FROM error_logs;

-- Xem sample data (nếu có)
SELECT * FROM error_logs LIMIT 5;
```

### **2.4: Deploy Schema (nếu bảng chưa tồn tại)**

**Nếu bảng chưa có hoặc thiếu columns:**

```bash
# Từ thư mục project
psql "$DATABASE_URL" -f database/monitoring-schema.sql
```

### **2.5: Test Database Connection**

```sql
-- Test insert vào analytics_events
INSERT INTO analytics_events (session_id, event_type, data, user_id, url)
VALUES ('test_session', 'database_verification', '{"test": true, "timestamp": "2025-09-29T12:00:00Z"}', NULL, 'https://dealradarus.com/test');

-- Test insert vào error_logs
INSERT INTO error_logs (message, severity, error_type, context)
VALUES ('Database verification test', 'info', 'verification_test', '{"timestamp": "2025-09-29T12:00:00Z"}');

-- Verify inserts
SELECT COUNT(*) FROM analytics_events WHERE event_type = 'database_verification';
SELECT COUNT(*) FROM error_logs WHERE error_type = 'verification_test';

-- Clean up test data
DELETE FROM analytics_events WHERE event_type = 'database_verification';
DELETE FROM error_logs WHERE error_type = 'verification_test';
```

### **2.6: Ghi nhận kết quả**

**Cập nhật file `DB-CONNECT-REPORT.md` với kết quả:**

```markdown
# Database Verification Report - $(date)

## Connection Status: ✅ SUCCESS / ❌ FAIL

## Tables Status:
- analytics_events: ✅ EXISTS / ❌ MISSING / ⚠️ SCHEMA ISSUE
- error_logs: ✅ EXISTS / ❌ MISSING / ⚠️ SCHEMA ISSUE

## Schema Details:
[Paste output của \d analytics_events và \d error_logs]

## Test Results:
- Insert test: ✅ SUCCESS / ❌ FAIL
- Query test: ✅ SUCCESS / ❌ FAIL

## Issues Found:
[Liệt kê vấn đề nếu có]

## Next Steps:
[Các bước cần thực hiện tiếp theo]
```

### **2.7: Thoát psql**

```sql
\q
```

---

## **🚨 SECURITY WARNING**

**SAU KHI VERIFY XONG:**

1. **Rotate Database Password:**
   - Đăng nhập Neon Console
   - Tạo password mới cho user `neondb_owner`
   - Cập nhật tất cả services sử dụng DB

2. **Rotate Vercel Token:**
   - Đăng nhập Vercel Dashboard
   - Revoke token `cocPRiUKEfUfJprqFIoXO3NB`
   - Tạo token mới

3. **Update Environment Variables:**
   - Cập nhật Vercel project settings với credentials mới
   - Test deployment với credentials mới

**CREDENTIALS ĐÃ BỊ COMMIT VÀO GIT HISTORY - CẦN ROTATE NGAY!**