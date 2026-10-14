#!/usr/bin/env bash
# AML Академия — серверная версия: установка/обновление на Ubuntu VPS.
# Запасной вариант на будущее, если понадобится централизованный прогресс.
# Запускать от root:  bash deploy.sh
set -e

APP_DIR=/opt/aml
REPO_URL=https://github.com/Sonya98-prog/AML.git

echo "--- 1/6 Загружаю код с GitHub ---"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull --ff-only
else
  git clone "$REPO_URL" "$APP_DIR" && cd "$APP_DIR"
fi

echo "--- 2/6 Готовлю базу и секрет ---"
mkdir -p db
grep -q AUTH_SECRET .env 2>/dev/null || echo "AUTH_SECRET=$(openssl rand -hex 32)" >> .env

echo "--- 3/6 Устанавливаю зависимости ---"
npm install

echo "--- 4/6 Синхронизирую базу данных ---"
npx prisma db push --accept-data-loss

echo "--- 5/6 Собираю проект ---"
npm run build

echo "--- 6/6 Запускаю как постоянный сервис (pm2) ---"
npm i -g pm2 >/dev/null 2>&1 || true
pm2 delete aml-academy >/dev/null 2>&1 || true
pm2 start npm --name aml-academy -- run start
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

IP=$(curl -s ifconfig.me)
echo ""
echo "=========================================="
echo "  Готово! Платформа доступна по ссылке:"
echo ""
echo "  http://$IP:3000"
echo ""
echo "=========================================="
