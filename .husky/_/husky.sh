#!/usr/bin/env sh
if [ -z "$HUSKY_GIT_STDIN" ]; then
  if [ "$(pwd)" != "$GIT_DIR" ]; then
    cd "$(git rev-parse --show-toplevel)" || exit 1
  fi
fi
