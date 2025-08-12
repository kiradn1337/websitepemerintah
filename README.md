# Website Pemerintah Dengan Enkripsi Data

Sistem pengelolaan data pribadi yang terenkrisi untuk instansi pemerintahan dengan tema merah putih merdeka Indonesia.

## Fitur

- Autentikasi multi-level: user, admin, dan superadmin
- Enkripsi data pribadi dengan CryptoJS
- Manajemen file dengan enkripsi
- Pengelolaan berita pemerintahan
- Versioning dan log akses data pribadi
- Antarmuka dengan tema merah putih Indonesia

## Teknologi yang Digunakan

- Node.js dan Express.js untuk backend
- PostgreSQL dengan Sequelize ORM untuk database
- EJS sebagai template engine
- CryptoJS untuk enkripsi data
- Bootstrap 5 untuk UI

## Cara Menggunakan

### Prasyarat
- Node.js (versi 14 atau lebih tinggi)
- PostgreSQL

### Instalasi

1. Clone repositori ini
```
git clone https://github.com/username/websitepemerintah.git
cd websitepemerintah
```

2. Install dependensi
```
npm install
```

3. Salin file `.env.example` ke `.env` dan sesuaikan konfigurasi
```
cp .env.example .env
```

4. Setup database
```
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

5. Jalankan aplikasi
```
npm run dev
```

### Penggunaan Produksi

Untuk menjalankan aplikasi di lingkungan produksi:

```
npm start
```

## Deploy ke Render.com

1. Buat akun di [Render.com](https://render.com)
2. Sambungkan repositori GitHub Anda
3. Pilih "New Web Service"
4. Pilih repositori yang telah disambungkan
5. Konfigurasi:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variables untuk DATABASE_URL dan variabel lainnya
6. Klik "Create Web Service"

## Struktur Proyek

- `/src`
  - `/config` - Konfigurasi aplikasi
  - `/controllers` - Controller untuk menangani logika bisnis
  - `/middlewares` - Middleware Express
  - `/models` - Model database menggunakan Sequelize
  - `/routes` - Definisi rute API
  - `/views` - Template EJS
  - `/utils` - Utilitas dan helper functions
  - `index.js` - Entry point aplikasi

## Lisensi

Proyek ini dilisensikan di bawah [Lisensi ISC](LICENSE)

