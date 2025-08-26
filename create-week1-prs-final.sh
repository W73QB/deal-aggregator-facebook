#!/usr/bin/env bash
set -euo pipefail

### =======================
### 🔧 CẤU HÌNH
### =======================
REPO_DIR="/Users/admin/projects/deal-aggregator-facebook"
DEFAULT_BRANCH="main"
REMOTE="origin"

GIT_AUTHOR_NAME="DealRadarUS Bot"
GIT_AUTHOR_EMAIL="bot@dealradarus.com"

# Tên branch/PR cho Week 1
BR_CLEANUPS="feature/week1-cleanups-tracking"
BR_AFFILIATE="feature/week1-affiliate-links"

# Các file/đường dẫn đã xuất hiện trong nhật ký Week 1
FILES_PR1=(
  "index.html"
  "home.html"
  "js/analytics-enhanced.js"
  "test-analytics.html"
)
# Sẽ tự động thêm footer/header/layout*.html nếu có sửa
FILES_PR2_FIXED=(
  "config/affiliate-urls.json"
  "scripts/replace-placeholder-urls.js"
  "scripts/clean-duplicate-utm.js"
)

### =======================
### 🧪 HÀM TRỢ GIÚP
### =======================
say() { printf "\n\033[1;36m%s\033[0m\n" "$*"; }
warn() { printf "\n\033[1;33m%s\033[0m\n" "$*"; }
die() { printf "\n\033[1;31m%s\033[0m\n" "$*"; exit 1; }

check_bin() {
  command -v "$1" >/dev/null 2>&1 || die "❌ Thiếu công cụ bắt buộc: $1"
}

safe_add_if_exists() {
  local f="$1"
  [[ -f "$f" ]] && git add "$f"
}

stage_if_modified_match() {
  local pattern="$1"
  local modified
  modified="$(git ls-files -m | grep -E "$pattern" || true)"
  if [[ -n "$modified" ]]; then
    git add $modified
  fi
}

pre_check_repo() {
  [[ -d "$REPO_DIR/.git" ]] || die "❌ Không tìm thấy repo Git tại $REPO_DIR"
}

preflight_checks() {
  check_bin git
  # gh optional; nếu không có vẫn tiếp tục (mở PR thủ công)
  if ! command -v gh >/dev/null 2>&1; then
    warn "⚠️  Không tìm thấy GitHub CLI (gh). Vẫn tiếp tục, nhưng bạn sẽ mở PR thủ công."
    USE_GH="false"
  else
    USE_GH="true"
  fi
}

### =======================
### 🚦 CHUẨN BỊ
### =======================
pre_check_repo
preflight_checks

cd "$REPO_DIR"
git config user.name  "$GIT_AUTHOR_NAME"
git config user.email "$GIT_AUTHOR_EMAIL"

say "🔄 Đồng bộ $DEFAULT_BRANCH"
# Lưu thay đổi tạm nếu có
STASHED="false"
if ! git diff --quiet || ! git diff --cached --quiet; then
  STASH_MSG="Week1-autostash-$(date +%s)"
  git stash push -u -m "$STASH_MSG"
  STASHED="true"
  warn "🧳 Đã stash thay đổi tạm: $STASH_MSG"
fi

git fetch "$REMOTE" "$DEFAULT_BRANCH" --prune
git checkout "$DEFAULT_BRANCH"
git pull --ff-only "$REMOTE" "$DEFAULT_BRANCH"

### =======================
### 🧹 TÁI TẠO SCRIPT (để tránh mất file khi đổi nhánh)
### =======================
# Đảm bảo 2 branch sẽ có cùng nội dung cần commit
# (Nếu file đã tồn tại trong repo thì phần này không ảnh hưởng)
touch js/analytics-enhanced.js test-analytics.html \
      scripts/replace-placeholder-urls.js scripts/clean-duplicate-utm.js \
      config/affiliate-urls.json || true

### =======================
### 🧭 TẠO PR-1: CLEANUPS & TRACKING
### =======================
say "🌿 Tạo nhánh $BR_CLEANUPS từ $DEFAULT_BRANCH"
git checkout -B "$BR_CLEANUPS" "$REMOTE/$DEFAULT_BRANCH"

# Khôi phục stash nếu có, để lấy đúng nội dung đã sửa liên quan PR-1
if [[ "$STASHED" == "true" ]]; then
  warn "🔁 Áp dụng lại stash để lấy thay đổi Week 1 (nếu trùng sẽ merge tự động)"
  git stash pop || true
fi

# Stage chính xác phạm vi PR-1
for f in "${FILES_PR1[@]}"; do safe_add_if_exists "$f"; done
stage_if_modified_match "(footer|header|layout).*\.html"

# Pre-commit validations cho PR-1
say "✅ Kiểm tra an toàn PR-1"
if grep -R "CI/CD Test" --include="*.html" --include="*.js" --include="*.css" . >/dev/null 2>&1; then
  die "❌ Phát hiện chuỗi 'CI/CD Test' còn sót lại. Hãy xoá sạch rồi chạy lại script."
fi
if ! grep -R "Facebook Pixel with Error Handling" index.html >/dev/null 2>&1; then
  die "❌ Thiếu guard Pixel trong index.html. Hãy chèn snippet đã cung cấp rồi chạy lại."
fi
if ! grep -R "analytics-enhanced.js" index.html >/dev/null 2>&1; then
  die "❌ index.html chưa include analytics-enhanced.js. Hãy include rồi chạy lại."
fi

# Nếu chưa có gì để commit (giả sử đã commit trước đó), bỏ qua PR-1
if git diff --cached --quiet; then
  warn "ℹ️  Không có thay đổi mới cho PR-1 — bỏ qua commit."
else
  git commit -m "fix(pixel): guard fbq init to prevent console errors under blockers" \
             -m "chore(html): remove CI/CD debug lines from index/home" \
             -m "feat(analytics): add GA4 enhanced tracking (newsletter/search/filter/outbound/social) + test page" \
             -m "feat(social): convert social links to real URLs with UTM + GA4 social_click"
fi

say "⬆️  Push $BR_CLEANUPS"
git push -u "$REMOTE" "$BR_CLEANUPS"

if [[ "$USE_GH" == "true" ]]; then
  gh pr create \
    --title "chore(week1): cleanups & tracking — remove debug, fix Pixel, GA4 enhanced, social links" \
    --body "## What\n- Remove CI/CD debug lines (index/home)\n- Guard Meta Pixel to avoid console errors\n- Add GA4 enhanced tracking + test page\n- Real social links + UTM + GA4 \`social_click\`\n\n## QA\n- [ ] No \`CI/CD Test\` left\n- [ ] No console errors\n- [ ] GA4 DebugView: social_click/search_used/filter_change/newsletter_submit/deal_click\n\n## Risk\nLow — no SEO/URL changes" \
    --base "$DEFAULT_BRANCH" \
    --head "$BR_CLEANUPS" || warn "⚠️  Không thể tạo PR tự động (gh), hãy mở PR thủ công."
fi

### =======================
### 🔗 TẠO PR-2: AFFILIATE LINKS
### =======================
say "🌿 Tạo nhánh $BR_AFFILIATE từ $DEFAULT_BRANCH"
git checkout "$DEFAULT_BRANCH"
git checkout -B "$BR_AFFILIATE" "$REMOTE/$DEFAULT_BRANCH"

# Áp dụng lại stash nếu vẫn còn (trong trường hợp pop trước không hết)
if git stash list | grep -q "Week1-autostash"; then
  warn "🔁 Áp dụng stash còn lại (nếu có)"
  git stash pop || true
fi

# Stage scripts & config
for f in "${FILES_PR2_FIXED[@]}"; do safe_add_if_exists "$f"; done
# Stage các HTML đã thay link
stage_if_modified_match "\.html$"

say "✅ Kiểm tra an toàn PR-2"
# Cho phép example.com duy nhất trong test-analytics.html (nếu có)
if grep -R "example\.com" --include="*.html" . >/dev/null 2>&1; then
  REMAIN_HTML=$(grep -R "example\.com" --include="*.html" . || true)
  # Nếu có dòng khác ngoài test-analytics.html thì fail
  if echo "$REMAIN_HTML" | grep -v "test-analytics.html" >/dev/null 2>&1; then
    echo "$REMAIN_HTML"
    die "❌ Vẫn còn 'example.com' ngoài file test. Hãy thay thế hết rồi chạy lại."
  fi
fi

# Commit nếu có stage
if git diff --cached --quiet; then
  warn "ℹ️  Không có thay đổi mới cho PR-2 — bỏ qua commit."
else
  git commit -m "feat(links): replace example.com with real affiliate URLs (+UTM cleanup scripts)" \
             -m "chore(config): add affiliate mapping & automation scripts"
fi

say "⬆️  Push $BR_AFFILIATE"
git push -u "$REMOTE" "$BR_AFFILIATE"

if [[ "$USE_GH" == "true" ]]; then
  gh pr create \
    --title "feat(week1): affiliate links — replace placeholders with real merchant URLs (+UTM cleanup)" \
    --body "## What\n- Replace all \`example.com\` deal links with real affiliate URLs\n- Add scripts to automate replacement + clean duplicate UTM\n\n## QA\n- [ ] \`grep -R \"example\\.com\" --include=\"*.html\"\` returns 0 (except test-analytics.html)\n- [ ] All \"Get Deal\" ➜ open real merchants\n- [ ] GA4 DebugView receives \`deal_click\`\n\n## Risk\nLow–Medium (external links). Manual verification passed." \
    --base "$DEFAULT_BRANCH" \
    --head "$BR_AFFILIATE" || warn "⚠️  Không thể tạo PR tự động (gh), hãy mở PR thủ công."
fi

### =======================
### 🧾 TẠO CHECKLIST REVIEW
### =======================
cat > POST_PR_REVIEW_WEEK1.md <<'MD'
# ✅ Post-PR Review — Week 1 (DealRadarUS)

## PR-1: Cleanups & Tracking
- [ ] Không còn chuỗi `CI/CD Test` trong repo
- [ ] Console sạch (không lỗi Pixel khi có adblocker)
- [ ] GA4 DebugView: `social_click`, `deal_click`, `search_used`, `filter_change`, `newsletter_submit`
- [ ] Social links mở tab mới + UTM

## PR-2: Affiliate Links
- [ ] `grep -R "example\.com" --include="*.html"` = 0 (trừ test-analytics.html)
- [ ] Tất cả "Get Deal" ➜ merchant thật, không 404
- [ ] Không có UTM trùng lặp; outbound events lên GA4

## Merge thứ tự
1) PR-1 ➜ deploy ➜ smoke test
2) PR-2 ➜ deploy ➜ smoke test

## Rollback nhanh
- `git revert <merge-commit-sha>` của PR tương ứng
MD

### =======================
### ✅ TÓM TẮT
### =======================
say "🎉 HOÀN TẤT: ĐÃ TẠO NHÁNH & PUSH LÊN GIT."
echo "   • PR-1 branch: $BR_CLEANUPS  — Cleanups & Tracking"
echo "   • PR-2 branch: $BR_AFFILIATE — Affiliate Links"
if [[ "$USE_GH" == "true" ]]; then
  echo "   • Đã cố gắng tạo PR qua gh-cli. Nếu không thấy PR mới, mở GitHub và tạo PR thủ công từ 2 branch trên."
else
  warn "⚠️ gh-cli không có — hãy mở PR thủ công cho 2 branch ở trên."
fi
echo "👉 Làm theo checklist trong POST_PR_REVIEW_WEEK1.md để QA rồi merge."