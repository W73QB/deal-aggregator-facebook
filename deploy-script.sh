#!/bin/bash
set -e

echo "=== 0) Thông tin chung ==="
PROJECT_ROOT="$(pwd)"
echo "PROJECT_ROOT: $PROJECT_ROOT"
BASE_API_DOMAIN="https://deal-aggregator-facebook.vercel.app"   # API custom domain
VERIFY_TOKEN_MASK="****"                         # chỉ mask khi in log
# LƯU Ý: Đọc VERIFY_TOKEN thực từ ENV khi test webhook, KHÔNG echo ra console

echo "=== 1) Xác định thư mục output của frontend (build/dist/public) ==="
OUT_DIR=""
[ -d "./build" ] && OUT_DIR="build"
[ -z "$OUT_DIR" ] && [ -d "./dist" ] && OUT_DIR="dist"
[ -z "$OUT_DIR" ] && [ -d "./public" ] && OUT_DIR="public"
if [ -z "$OUT_DIR" ]; then
  # tạo public nếu cần (fallback)
  mkdir -p public
  [ -f index.html ] && cp index.html public/ || true
  OUT_DIR="public"
fi
echo "Frontend Output Directory: $OUT_DIR"

echo "=== 2) Đảm bảo có API routes ==="
test -f "api/hello.js" || { echo "❌ Thiếu api/hello.js"; exit 1; }
test -f "api/webhooks/facebook.js" || { echo "❌ Thiếu api/webhooks/facebook.js"; exit 1; }

echo "=== 3) Thêm script vercel-build (nếu chưa có) để Vercel biết cách build frontend ==="
# Nếu package.json có "build" thì dùng lại; nếu không thì tạo build giả lập copy sang OUT_DIR
HAS_BUILD=$(node -e "try{p=require('./package.json');process.exit(p.scripts&&p.scripts.build?0:1)}catch(e){process.exit(1)}" || true)
if [ "$HAS_BUILD" = "0" ]; then
  npx --yes json -I -f package.json -e "this.scripts=this.scripts||{}; this.scripts['vercel-build']=this.scripts['vercel-build']||'npm run build'"
else
  # không có script build, tạo vercel-build rỗng đảm bảo static vẫn deploy
  npx --yes json -I -f package.json -e "this.scripts=this.scripts||{}; this.scripts['vercel-build']=this.scripts['vercel-build']||'echo \"no build\"'"
fi

echo "=== 4) Tạo/ghi đè vercel.json để build cả frontend + API ==="
cat > vercel.json <<'JSON'
{
  "builds": [
    { "src": "api/**/*.js", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build" }
  ],
  "routes": [
    { "src": "^/api/(.*)$", "dest": "/api/$1.js" }
  ]
}
JSON

echo "=== 5) Commit & push cấu hình deploy ==="
git add vercel.json package.json
git commit -m "chore(vercel): static-build + node functions (frontend + API)" || true
git push origin main

echo "=== 6) Chờ Vercel build & deploy xong (poll 90s) ==="
for i in 1 2 3 4 5 6 7 8 9; do
  sleep 10
  # thử ping index để biết deployment đã lên (HTTP 200/304)
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://deal-aggregator-facebook.vercel.app/")
  echo "try#$i frontend status: $CODE"
  [ "$CODE" = "200" -o "$CODE" = "304" ] && break
done

echo "=== 7) Test API endpoints ==="
echo "→ /api/hello"
curl -i "$BASE_API_DOMAIN/api/hello" || true

echo "→ /api/webhooks/facebook (verify)"
# Đọc VERIFY_TOKEN từ ENV (đã set trên Vercel Production), chỉ mask khi in log
WEBHOOK_TOKEN="${FACEBOOK_WEBHOOK_VERIFY_TOKEN:-}"
if [ -z "$WEBHOOK_TOKEN" ]; then
  echo "⚠️  Không thấy FACEBOOK_WEBHOOK_VERIFY_TOKEN trong ENV local. Chỉ test cú pháp URL."
else
  echo "Using VERIFY_TOKEN: ${VERIFY_TOKEN_MASK}"
  curl -i "$BASE_API_DOMAIN/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=${WEBHOOK_TOKEN}&hub.challenge=TEST123" || true
fi

echo "=== 8) Kết luận nhanh ===
- Nếu /api/hello trả JSON 200 → API đã chạy.
- Nếu webhook GET trả về 'TEST123' → verify OK.
- Nếu 404 → kiểm tra lại Build Logs và Root Directory.
"