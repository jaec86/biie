#!/usr/bin/env sh

set -e

docker-compose exec app npm run build

cd dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:git@github.com:jaec86/biie.git master:gh-pages

cd -