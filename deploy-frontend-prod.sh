#!/bin/bash
# ==== PREP ====
set -euo pipefail
FRONTEND_DIR="${FRONTEND_DIR:-../dealradarus-frontend}"
PROJECT_NAME="${PROJECT_NAME:-dealradarus-frontend}"
APEX="${APEX:-dealradarus.com}"
WWW="${WWW:-www.dealradarus.com}"

log(){ echo "[$(date '+%H:%M:%S')] $*"; }
err(){ echo "[$(date '+%H:%M:%S')] ❌ $*" >&2; exit 1; }

command -v vercel >/dev/null || err "Vercel CLI chưa cài. Chạy: npm i -g vercel"
vercel whoami >/dev/null 2>&1 || err "Chưa đăng nhập Vercel. Chạy: vercel login (xong chạy lại script)"

[ -d "$FRONTEND_DIR" ] || err "Không tìm thấy thư mục frontend: $FRONTEND_DIR"
cd "$FRONTEND_DIR"

# ==== INSTALL & BUILD (Next.js 14 scaffold) ====
log "Cài dependencies (npm ci nếu có lockfile)…"
if [ -f package-lock.json ]; then npm ci; else npm install; fi

log "Build production…"
npm run build

# ==== LINK PROJECT (idempotent) ====
if ! vercel projects ls | grep -q "$PROJECT_NAME"; then
  log "Tạo project Vercel: $PROJECT_NAME"
  vercel projects add "$PROJECT_NAME" >/dev/null
fi

log "Link project…"
vercel link --project "$PROJECT_NAME" --yes >/dev/null

# ==== DEPLOY ====
log "Deploy --prod…"
DEPLOY_URL=$(vercel --prod --confirm --yes 2>&1 | grep -E "https://.*\.vercel\.app|https://.*\.com" | tail -n1 | sed 's/.*\(https:\/\/[^[:space:]]*\).*/\1/')
[ -n "$DEPLOY_URL" ] || err "Không lấy được deployment URL"
log "Deployed: $DEPLOY_URL"

# ==== ATTACH DOMAINS (idempotent) ====
log "Gắn domain apex…"
vercel domains add "$APEX" --project "$PROJECT_NAME" >/dev/null || true
log "Gắn domain www…"
vercel domains add "$WWW" --project "$PROJECT_NAME" >/dev/null || true

# ==== DNS HƯỚNG DẪN (Squarespace) ====
echo
log "→ Cấu hình DNS trên Squarespace:"
echo "  - $APEX : A     76.76.21.21"
echo "  - $WWW  : CNAME cname.vercel-dns.com"
echo "  - api.dealradarus.com : CNAME cname.vercel-dns.com (GIỮ NGUYÊN cho API)"
echo

# ==== ĐỢI DNS (best effort) ====
log "Chờ DNS propagate (thử tối đa 6 lần / 5 phút)…"
for i in 1 2 3 4 5 6; do
  sleep 300
  A=$(dig +short "$APEX"  | tr -d '\n')
  W=$(dig +short "$WWW"   | tr -d '\n')
  if [ -n "$A" ] && [ -n "$W" ]; then
    log "DNS OK: $APEX → $A | $WWW → $W"
    break
  fi
  log "DNS chưa xong (lần $i/6)…"
done

# ==== TESTS ====
api_base="https://api.dealradarus.com"
apex_url="https://$APEX"
www_url="https://$WWW"

log "Test homepage (apex)…"
curl -fsSI "$apex_url" | grep -q " 200" || err "Trang chủ $APEX chưa 200"

log "Test homepage (www)…"
curl -fsSI "$www_url" | grep -q " 200" || err "Trang chủ $WWW chưa 200"

log "Test API proxy qua frontend…"
FR_API_JSON=$(curl -fsS "$apex_url/api/hello")
echo "$FR_API_JSON" | grep -q '"ok":true' || err "Proxy /api/hello qua frontend thất bại"

log "Đối chiếu API trực tiếp…"
BE_API_JSON=$(curl -fsS "$api_base/api/hello")
[ "$FR_API_JSON" = "$BE_API_JSON" ] || err "Nội dung proxy khác API trực tiếp"

log "Non-API 404 (apex)…"
[ "$(curl -fsS -o /dev/null -w "%{http_code}" "$apex_url/nonexistent")" = "404" ] || err "Non-API không trả 404"

# ==== REPORT ====
echo
echo "================= FRONTEND DEPLOY REPORT ================="
echo "Deployment URL  : $DEPLOY_URL"
echo "Apex Domain     : $APEX  (OK)"
echo "WWW Domain      : $WWW   (OK)"
echo "API Proxy Check : PASS (matches $api_base/api/hello)"
echo "Status          : Frontend live & connected to API ✅"
echo "=========================================================="