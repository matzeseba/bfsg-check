#!/usr/bin/env bash
# Neues GitHub-Repo befüllen:
# 1) Leeres (privates) Repo auf github.com anlegen, NICHTS anhaken.
# 2) bash setup-new-repo.sh  GIT-URL-DEINES-REPOS
set -e
REPO_URL="$1"
if [ -z "$REPO_URL" ]; then echo "Bitte Git-URL angeben, z.B.: bash setup-new-repo.sh git@github.com:matzeseba/bfsg-check.git"; exit 1; fi
git init
git add .
git commit -m "Initial commit: BFSG-Check Business (Scanner, 2 Produkte, Verkauf, Compliance, Landingpage)"
git branch -M main
git remote add origin "$REPO_URL"
git push -u origin main
echo "FERTIG -> $REPO_URL"
