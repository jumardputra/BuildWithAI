#!/usr/bin/env bash
# Penyiapan awal VPS Ubuntu 22.04/24.04 untuk BuildWithAI.
# Jalankan sekali: sudo bash deploy/vps-setup.sh
set -euo pipefail

APP_USER="buildwithai"
APP_DIR="/srv/buildwithai"
DATA_DIR="/var/lib/buildwithai"

log() { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }

if [[ $EUID -ne 0 ]]; then
  echo "Jalankan dengan sudo." >&2
  exit 1
fi

log "Memasang paket dasar"
apt-get update
apt-get install -y curl git nginx ca-certificates sqlite3 ufw

log "Memasang Node.js 22 LTS"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | sed 's/v//;s/\..*//')" -lt 22 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v

log "Membuat pengguna sistem $APP_USER"
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /usr/sbin/nologin "$APP_USER"
fi

log "Menyiapkan folder aplikasi dan data"
mkdir -p "$APP_DIR" "$DATA_DIR" /var/backups/buildwithai
chown -R "$APP_USER:$APP_USER" "$APP_DIR" "$DATA_DIR" /var/backups/buildwithai
chmod 750 "$DATA_DIR"

log "Mengatur firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable || true

cat <<EOF

Selesai untuk tahap sistem.

Langkah berikutnya (lihat deploy/README.md):
  1. git clone <repo-anda> $APP_DIR && cd $APP_DIR
  2. sudo -u $APP_USER npm install && sudo -u $APP_USER npm run build
  3. sudo -u $APP_USER cp .env.example .env  lalu isi SESSION_SECRET
  4. sudo cp deploy/buildwithai.service /etc/systemd/system/
     sudo systemctl daemon-reload && sudo systemctl enable --now buildwithai
  5. sudo cp deploy/nginx.conf /etc/nginx/sites-available/buildwithai
     sudo ln -sf /etc/nginx/sites-available/buildwithai /etc/nginx/sites-enabled/
     sudo nginx -t && sudo systemctl reload nginx
  6. sudo certbot --nginx -d <domain-anda>

EOF
