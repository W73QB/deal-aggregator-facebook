#!/usr/bin/env bash
set -euo pipefail

print_usage() {
  cat <<'USAGE'
Deal Aggregator repository cleanup helper

Usage: cleanup-repo.sh [--apply]

By default the script runs in dry-run mode and only lists the files that would
be removed. Pass --apply to execute the deletions.
USAGE
}

should_apply=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)
      should_apply=true
      shift
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      print_usage
      exit 1
      ;;
  esac
done

remove_pattern() {
  local description="$1"
  local path_pattern="$2"
  local extra_find_args=()
  if [[ $# -gt 2 ]]; then
    shift 2
    extra_find_args=("$@")
  else
    shift 2
  fi

  echo "\n➡️  ${description}";
  if [[ "$should_apply" == true ]]; then
    find "$path_pattern" "${extra_find_args[@]}" -print -delete
  else
    find "$path_pattern" "${extra_find_args[@]}" -print
  fi
}

remove_directory() {
  local description="$1"
  local dir="$2"
  echo "\n➡️  ${description}";
  if [[ -d "$dir" ]]; then
    if [[ "$should_apply" == true ]]; then
      rm -rf "$dir"
      echo "Removed $dir"
    else
      echo "$dir"
    fi
  else
    echo "(skip) $dir not found"
  fi
}

remove_pattern "Removing backup HTML variants" "pages" \( -name "*.html.backup" -o -name "*.html.cachebak" -o -name "*.html.guard_backup" \)
remove_pattern "Removing coverage HTML caches" "coverage" \( -name "*.html.cachebak" \)
remove_pattern "Removing legacy .backup files" "." \( -name "*.backup*" \)
remove_directory "Removing duplicated aggregator tree" "deal-aggregator/deal-aggregator"
remove_directory "Clearing Next.js build cache" ".next/cache"
remove_directory "Clearing Next.js static artifacts" ".next/static"

if [[ "$should_apply" == false ]]; then
  echo "\nDry run complete. Re-run with --apply to remove the listed files."
fi
