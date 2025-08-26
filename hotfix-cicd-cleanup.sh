#!/usr/bin/env bash
set -euo pipefail

REPO="/Users/admin/projects/deal-aggregator-facebook"
REMOTE="origin"
BASE="main"
BR="hotfix/remove-cicd-debugline"
MSG="fix(html): remove stray 'CI/CD Test' debug tail from all served HTML files"

cd "$REPO"

echo "🔍 Preflight"
command -v git >/dev/null || { echo "❌ git missing"; exit 1; }

echo "🔄 Sync main"
git fetch "$REMOTE" --prune
git checkout "$BASE"
git pull --ff-only "$REMOTE" "$BASE"

echo "🌿 Create hotfix branch"
git checkout -B "$BR" "$REMOTE/$BASE"

# 1) QUÉT & XOÁ DÒNG DEBUG Ở MỌI HTML (mọi vị trí: root, pages/, platforms/, build folders)
echo "🧹 Strip debug tail in ALL .html files"
# Pattern này xóa mọi phần "CI/CD Test..." kể cả khi dính sau </html>
while IFS= read -r -d '' f; do
  # Chỉ sửa khi có chuỗi
  if grep -q "CI/CD Test" "$f"; then
    # Xoá toàn bộ dòng chứa CI/CD Test
    perl -i -pe 's/\s*#\s*CI\/CD\s*Test.*$//g' "$f"
    # Nếu lỡ dính sau </html>, cắt phần rác sau </html>
    perl -i -0777 -pe 's#(</html>).*#$1\n#s' "$f"
    echo "   ↳ cleaned: $f"
  fi
done < <(find . -type f -name "*.html" -print0)

# 2) XÁC THỰC LOCAL KHÔNG CÒN
if grep -R "CI/CD Test" --include="*.html" . >/dev/null 2>&1; then
  echo "❌ Still found 'CI/CD Test' locally. Abort."
  grep -R -n "CI/CD Test" --include="*.html" .
  exit 1
fi

# 3) COMMIT & PUSH
git add -A
if git diff --cached --quiet; then
  echo "ℹ️ Nothing to commit (maybe already fixed)."
else
  git commit -m "$MSG"
fi

git push -u "$REMOTE" "$BR"

# 4) MỞ PR (nếu có gh-cli)
if command -v gh >/dev/null 2>&1; then
  if ! gh pr view "$BR" --head "$BR" >/dev/null 2>&1; then
    gh pr create \
      --title "$MSG" \
      --body "Remove leftover CI/CD debug tail printed after </html> across all served HTML variants (root/pages/platforms).\n\nQA:\n- [ ] grep -R \"CI/CD Test\" --include=\"*.html\" => 0\n- [ ] curl -s https://dealradarus.com | grep -n \"CI/CD Test\" => no output\n- [ ] Footer renders correctly with no extra text." \
      --base "$BASE" --head "$BR" || true
  fi
  gh pr merge "$BR" --squash --auto || true
else
  echo "⚠️ gh not installed — open PR manually from $BR"
fi

echo "🧪 Post-merge verification hints:"
echo "   1) curl -s https://dealradarus.com | grep -n 'CI/CD Test' || echo 'OK: no debug line'"
echo "   2) curl -s https://dealradarus.com/pages/index.html | grep -n 'CI/CD Test' || echo 'OK: no debug line'"
echo "   3) curl -s https://dealradarus.com/pages/deals.html | grep -n 'CI/CD Test' || echo 'OK: no debug line'"
echo "   4) (nếu có CDN) Purge cache ngay sau deploy."

# 5) (TUỲ CHỌN) PURGE CLOUDFLARE — chỉ chạy khi đã set token/id trong env
if [[ "${CF_API_TOKEN:-}" != "" && "${CF_ZONE_ID:-}" != "" ]]; then
  echo "🧼 Purging Cloudflare cache (optional)…"
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data '{"purge_everything":true}' >/dev/null || true
fi

echo "✅ Hotfix script finished."