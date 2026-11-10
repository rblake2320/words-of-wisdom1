#!/bin/sh
set -eu
umask 077
destination=/srv/words-of-wisdom-review
if [ -e "$destination" ]; then
  echo 'Deployment directory already exists; refusing to overwrite.' >&2
  exit 1
fi
mkdir "$destination"
tar -xzf /tmp/wisdom-review-source-20261110.tar.gz -C "$destination"
cd "$destination"
printf 'DB_PASSWORD=%s\nDB_ROOT_PASSWORD=%s\nJWT_SECRET=%s\n' "$(openssl rand -hex 32)" "$(openssl rand -hex 32)" "$(openssl rand -hex 48)" > .env
docker compose --env-file .env -p words-of-wisdom-review -f deploy/review.compose.yml up -d --build
