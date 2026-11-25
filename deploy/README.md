# Deploy BuildWithAI di VPS

Panduan ini untuk Ubuntu 22.04 / 24.04 dengan nginx. Semua perintah diasumsikan dijalankan sebagai
pengguna yang punya `sudo`.

---

## 1. Siapkan sistem

```bash
sudo apt update
sudo apt install -y curl git nginx

# Node.js 22 LTS (wajib >= 22.5 karena memakai node:sqlite)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v      # harus v22.5.0 atau lebih baru
```

Atau jalankan skrip yang sudah disiapkan:

```bash
sudo bash deploy/vps-setup.sh
```

## 2. Buat pengguna dan folder

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin buildwithai
sudo mkdir -p /srv/buildwithai /var/lib/buildwithai
sudo chown -R buildwithai:buildwithai /srv/buildwithai /var/lib/buildwithai
```

## 3. Ambil kode dan build

```bash
sudo -u buildwithai git clone https://github.com/<akun-anda>/<nama-repo>.git /srv/buildwithai
cd /srv/buildwithai
sudo -u buildwithai npm ci --omit=dev || sudo -u buildwithai npm install
sudo -u buildwithai npm install --no-save vite @fontsource-variable/fraunces
sudo -u buildwithai npm run build
```

> `vite` ada di `devDependencies`, jadi bila Anda memakai `npm ci --omit=dev` ia tidak terpasang.
> Pasang sekali dengan perintah baris ketiga, atau jalankan `npm ci` biasa lalu build.

## 4. Buat berkas lingkungan

```bash
sudo -u buildwithai bash -c '
  cd /srv/buildwithai
  cp .env.example .env
  SECRET=$(node -e "console.log(require(\"crypto\").randomBytes(48).toString(\"hex\"))")
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=$SECRET|" .env
  chmod 600 .env
'
```

Periksa isinya: `sudo -u buildwithai cat /srv/buildwithai/.env`

Nilai penting untuk produksi:

```
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
DB_PATH=/var/lib/buildwithai/buildwithai.db
TRUST_PROXY=1
COOKIE_SECURE=1
```

> Server **tidak** membaca `.env` otomatis. Unit systemd di bawah memuatnya lewat
> `EnvironmentFile=`, dan `docker-compose.yml` lewat `env_file:`. Bila Anda menjalankan
> `node server/index.js` manual, ekspor variabelnya dulu.

## 5. Pasang layanan systemd

```bash
sudo cp deploy/buildwithai.service /etc/systemd/system/buildwithai.service
sudo systemctl daemon-reload
sudo systemctl enable --now buildwithai
sudo systemctl status buildwithai --no-pager
```

Uji:

```bash
curl -s http://127.0.0.1:3000/api/health
# {"ok":true,"uptime":1,"version":"1.1.0"}
```

## 6. Pasang nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/buildwithai
sudo ln -sf /etc/nginx/sites-available/buildwithai /etc/nginx/sites-enabled/buildwithai
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Ganti `buildwithai.contoh.com` di berkas itu dengan domain Anda.

## 7. HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d buildwithai.contoh.com
```

Certbot memasang pengalihan HTTP → HTTPS. Pastikan `COOKIE_SECURE=1` di `.env` (bawaan
produksi memang 1), lalu `sudo systemctl restart buildwithai`.

## 8. Pembaruan versi

```bash
cd /srv/buildwithai
sudo -u buildwithai git pull
sudo -u buildwithai npm install
sudo -u buildwithai npm run build
sudo systemctl restart buildwithai
```

## 9. Backup

```bash
sudo install -d -o buildwithai -g buildwithai /var/backups/buildwithai
sudo -u buildwithai sqlite3 /var/lib/buildwithai/buildwithai.db \
  ".backup '/var/backups/buildwithai/buildwithai-$(date +%F).db'"
```

Tambahkan ke cron harian bila perlu:

```
15 3 * * * buildwithai sqlite3 /var/lib/buildwithai/buildwithai.db ".backup '/var/backups/buildwithai/buildwithai-$(date +\%F).db'"
```

---

## Pemeriksaan setelah terpasang

```bash
# layanan hidup?
sudo systemctl status buildwithai --no-pager
curl -s localhost:3000/api/health        # {"ok":true,...}
curl -sI https://domain-anda.com/        # 200, ada CSP + nosniff

# alamat bersih bekerja?
curl -s -o /dev/null -w "%{http_code}\n" https://domain-anda.com/ruang-kerja/
```

Yang perlu terlihat di header: `content-security-policy` tanpa `unsafe-inline`,
`x-content-type-options: nosniff`, `x-frame-options: DENY`, dan
`strict-transport-security` (bila HTTPS).

## Perawatan rutin

- **Cadangan**: `sqlite3 /var/lib/buildwithai/buildwithai.db ".backup /var/lib/buildwithai/cadangan-$(date +%F).db"`
- **Perbarui kode**: `cd /srv/buildwithai && sudo -u buildwithai git pull && sudo -u buildwithai npm ci && sudo -u buildwithai npm run build && sudo systemctl restart buildwithai`
- **Password reset manual** (bila pengguna lupa):
  ```bash
  node -e "import('./server/password.js').then(async m=>console.log(await m.hashPassword('KataSandiBaru123')))"
  sqlite3 /var/lib/buildwithai/buildwithai.db \
    "update users set password_hash='<hasil-di-atas>' where email='user@contoh.com';"
  ```

---

## Pemecahan masalah

| Gejala | Penyebab umum | Perbaikan |
|---|---|---|
| `Variabel lingkungan SESSION_SECRET wajib diisi` | `.env` belum dimuat | pastikan `EnvironmentFile=` di unit systemd benar, atau ekspor variabelnya |
| `Cannot find module 'node:sqlite'` | Node terlalu lama | pasang Node >= 22.5 |
| Login berhasil lalu langsung keluar | `COOKIE_SECURE=1` tetapi situs diakses lewat HTTP | pakai HTTPS, atau set `COOKIE_SECURE=0` saat uji |
| `502 Bad Gateway` dari nginx | layanan mati | `sudo journalctl -u buildwithai -n 50 --no-pager` |
| Alamat seperti `/ruang-kerja/` jadi 404 | folder build tidak tersalin utuh | pastikan `npm run build` menghasilkan folder `ruang-kerja/`, `masuk/`, dst. di dalam `dist/` |
| Data hilang setelah deploy | `DB_PATH` menunjuk ke dalam folder rilis | taruh basis data di `/var/lib/buildwithai/` |

## Docker (alternatif)

```bash
cd /srv/buildwithai
sudo docker compose -f deploy/docker-compose.yml up -d --build
```

Data disimpan di volume `buildwithai-data`, sehingga tetap aman saat kontainer dibuat ulang.
