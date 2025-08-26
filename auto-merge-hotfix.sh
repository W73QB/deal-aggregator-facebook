# ====== CONFIG CẦN SỬA CHO ĐÚNG ======
export OWNER="W73QB"
export REPO="deal-aggregator-facebook"
export BASE_BRANCH="main"
export HOTFIX_BRANCH="hotfix/remove-cicd-debugline"
export SITE_ORIGIN="https://dealradarus.com"

# (Tuỳ chọn Cloudflare purge)
# export CF_API_TOKEN="..."
# export CF_ZONE_ID="..."

set -euo pipefail
api(){ curl -fsSL -H "Authorization: token $GH_TOKEN" -H "Accept: application/vnd.github+json" "$@"; }
api_j(){ curl -fsSL -H "Authorization: token $GH_TOKEN" -H "Accept: application/vnd.github+json" -H "Content-Type: application/json" "$@"; }

echo "🔎 Kiểm tra PR hiện có..."
PR_JSON=$(api "https://api.github.com/repos/$OWNER/$REPO/pulls?state=open&head=$OWNER:$HOTFIX_BRANCH")
PR_NUMBER=$(echo "$PR_JSON" | awk -F'"' '/"number":/{print $4; exit}' || true)

if [ -z "${PR_NUMBER:-}" ]; then
  echo "🆕 Tạo PR mới từ $HOTFIX_BRANCH → $BASE_BRANCH"
  CREATE_BODY=$(cat <<'JSON'
{
  "title": "fix(html): remove stray CI/CD Test tail from all HTML",
  "head": "HOTFIX_BRANCH",
  "base": "BASE_BRANCH",
  "body": "Remove leftover CI/CD debug line that appeared after </html> on production.\nQA:\n- grep live root & /pages/* endpoints\n- purge CDN if any"
}
JSON
)
  CREATE_BODY=${CREATE_BODY/HOTFIX_BRANCH/$HOTFIX_BRANCH}
  CREATE_BODY=${CREATE_BODY/BASE_BRANCH/$BASE_BRANCH}
  PR_RESP=$(api_j -X POST "https://api.github.com/repos/$OWNER/$REPO/pulls" -d "$CREATE_BODY")
  PR_NUMBER=$(echo "$PR_RESP" | awk -F'"' '/"number":/{print $4; exit}')
  echo "✅ PR #$PR_NUMBER đã tạo."
else
  echo "ℹ️ Đã có PR mở: #$PR_NUMBER"
fi

echo "🔄 Merge PR #$PR_NUMBER (squash)…"
MERGE_RESP=$(api_j -X PUT "https://api.github.com/repos/$OWNER/$REPO/pulls/$PR_NUMBER/merge" \
  -d '{"merge_method":"squash","commit_title":"fix(html): remove CI/CD Test tail"}' || true)

if echo "$MERGE_RESP" | grep -q '"merged":true'; then
  echo "✅ Đã merge."
else
  echo "⚠️ Không merge được tự động. Thử fetch & rebase fast-forward."
  # Fallback local (nếu script chạy trên runner có repo)
  if command -v git >/dev/null 2>&1; then
    git fetch origin --prune
    git checkout "$BASE_BRANCH"
    git pull --ff-only origin "$BASE_BRANCH"
    git checkout "$HOTFIX_BRANCH"
    git rebase "origin/$BASE_BRANCH" || true
    git push -f origin "$HOTFIX_BRANCH"
    # Thử merge lại
    MERGE_RESP=$(api_j -X PUT "https://api.github.com/repos/$OWNER/$REPO/pulls/$PR_NUMBER/merge" \
      -d '{"merge_method":"squash","commit_title":"fix(html): remove CI/CD Test tail"}')
    echo "$MERGE_RESP" | grep -q '"merged":true' || { echo "❌ Merge vẫn thất bại → cần merge tay trên GitHub UI."; exit 1; }
  else
    echo "❌ Không có git CLI để fallback. Hãy merge tay trên GitHub UI."; exit 1;
  fi
fi

echo "⏳ Chờ build/deploy (GitHub Pages/CI)…"
sleep 30

# (Tuỳ chọn) Purge Cloudflare nếu có token
if [ -n "${CF_API_TOKEN:-}" ] && [ -n "${CF_ZONE_ID:-}" ]; then
  echo "🧼 Purge Cloudflare cache…"
  curl -fsS -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json" \
    --data '{"purge_everything":true}' >/dev/null && echo "✅ Purged"
else
  echo "ℹ️ Bỏ qua purge Cloudflare (không thiết lập CF_API_TOKEN/CF_ZONE_ID)."
fi

echo "🧪 Kiểm chứng live không còn 'CI/CD Test'…"
check(){
  local url="$1"
  if curl -fsS "$url" | grep -n "CI/CD Test" ; then
    echo "❌ STILL FOUND at: $url"
    return 1
  else
    echo "✅ Clean: $url"
    return 0
  fi
}
FAIL=0
sleep 10
check "$SITE_ORIGIN/"             || FAIL=1
check "$SITE_ORIGIN/index.html"   || FAIL=1
check "$SITE_ORIGIN/pages/index.html" || FAIL=1
check "$SITE_ORIGIN/pages/deals.html" || FAIL=1
check "$SITE_ORIGIN/pages/blog.html"  || FAIL=1

echo -e "\n====== RESULT ======"
if [ $FAIL -eq 0 ]; then
  echo "🎉 LIVE CLEAN — không còn chuỗi debug."
else
  echo "⚠️ Một số endpoint còn rác. Kiểm tra đường dẫn deploy thực tế (build/dist) & purge CDN thêm lần nữa."
fi