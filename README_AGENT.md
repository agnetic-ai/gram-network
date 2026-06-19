Berikut adalah keseluruhan file **`README.md`** yang telah dirapikan dan diintegrasikan. File ini menggabungkan dokumentasi spesifikasi logika bot, alur kerja untuk AI Agent, beserta contoh visualisasi tampilan log dashboard terminal yang kamu inginkan.

Silakan salin seluruh teks di dalam blok kode di bawah ini dan simpan sebagai file **`README.md`** di folder proyek kamu:

````markdown
# 🤖 AI Agent Specification & Dashboard: Gram Network Multi-Account Miner

Dokumentasi terstruktur dan spesifikasi runtime operasional untuk AI Agent / Autonomous Bot yang dirancang untuk mengelola **multi-akun** secara otomatis pada ekosistem Gram Network Mining.

---

## 📋 Prasyarat Sistem

### 1. Struktur Konfigurasi Lingkungan (`.env`)

Agent wajib membaca token sesi aktif yang disimpan di dalam file `.env` dengan format multi-akun menggunakan pemisah pipa ganda (`||`) tanpa spasi:

```env
# Format: ACCOUNTS=token_akun_1||token_akun_2||token_akun_3
ACCOUNTS=user%3D%257B%2522id%2522%253A5853...||user%3D%257B%2522id%2522%253A6102...
```
````

### 2. Aturan Ketat Operasional (_Strict Rules_)

- **Rotasi Akun Sekuensial**: Agent harus memproses setiap akun satu per satu secara berurutan dalam satu siklus putaran (Account 1 ➔ Account 2 ➔ Account N).
- **Sidik Jari Acak (_Random Browser Fingerprint_)**: Setiap kali berganti akun, Agent **WAJIB** mengacak string `User-Agent` dari daftar yang tersedia untuk menghindari deteksi multilogin/banned dari server.
- **Penyaringan Kategori Tugas**: Agent **HANYA BOLEH** mengeksekusi tugas yang memiliki properti `category == "social"`. Kategori lain seperti "hot" atau "bot" harus diabaikan.
- **Jeda Keamanan Anti-Spam**: Agent **WAJIB** menerapkan jeda acak (_sleep delay_) selama **2 hingga 5 detik** (`2000ms` - `5000ms`) segera setelah menyelesaikan setiap satu tugas sosial.

---

## 🔄 Alur Logika Eksekusi (State Machine)

Untuk setiap akun yang aktif, Agent akan menjalankan rutinitas pemeriksaan berikut secara berulang:

```text
[ Ambil Sesi Akun ] ──▶ [ Acak User-Agent ] ──▶ [ GET /api/get_user_data.php ]
                                                          │
 ┌────────────────────────────────────────────────────────┘
 │
 ├──▶ Kondisi: mining_status == "Ready to Claim"
 │       │
 │       ▼
 │   [ POST claim_mining.php ] ➔ [ POST start_mining.php ] ➔ [ POST boost_power.php ]
 │                                                                     │
 └─────────────────────────────────────────────────────────────────────┤
                                                                       ▼
                                                            [ GET /api/get_tasks.php ]
                                                                       │
                                                                       ▼
                                                          Filter: category == "social"
                                                          & is_completed == false
                                                                       │
                                                                       ▼
                                                           [ POST complete_task.php ]
                                                                       │
                                                                       ▼
                                                             [ Jeda Aman 2-5 Detik ]

```

### Rincian Langkah Sekuensial:

1. **Ambil Kondisi Akun**: Mengakses `GET /api/get_user_data.php` untuk membaca saldo, status mining, dan sisa waktu sesi berjalan.
2. **Siklus Klaim & Pemulihan**: Jika `mining_status` terdeteksi `"Ready to Claim"`, jalankan POST ke `/claim_mining.php`, lalu langsung picu POST ke `/start_mining.php` untuk memulai ulang timer 4 jam.
3. **Eksekusi Peningkatan Pangkat (_Boost_)**: Tepat setelah sesi penambangan dimulai ulang, Agent **WAJIB** menembak POST ke `/boost_power.php` guna memaksimalkan kecepatan perolehan koin pada sesi tersebut.
4. **Pembersihan Tugas Sosial**: Menarik daftar tugas melalui `GET /api/get_tasks.php`, memfilter target tugas sosial yang belum selesai (`is_completed == false`), lalu mengirim request klaim tugas ke `/complete_task.php` diselingi jeda acak 2-5 detik.
5. **Hibernasi Dinamis**: Setelah semua akun selesai diproses, Agent akan mencari sisa waktu terpendek (`time_left_seconds`) dari seluruh akun, lalu menidurkan sistem utama selama durasi tersebut + buffer 60 detik sebelum memulai siklus baru dari awal.

---

## 🖥️ Spesifikasi Tampilan Terminal Dashboard

Setiap kali Agent selesai mengeksekusi seluruh antrean akun dalam satu siklus, Agent wajib membersihkan konsol terminal (`console.clear()`) dan menampilkan struktur laporan teks ringkas dengan format tabel presisi seperti berikut:

```text
Gram Network Mining
Status         : Active
─────────────────────────────
User 1 ........ 26.751
User 2 ........ 0
User 3 ........ 0
─────────────────────────────
Total Mining   : 14.87/day
Claimable      : YES

```

---

## 📡 Daftar Endpoint API

1. **Get Detail User**

- Method: `GET` | URL: `https://app.gramnetwork.online/api/get_user_data.php`

2. **Get Available Task**

- Method: `GET` | URL: `https://app.gramnetwork.online/api/get_tasks.php`

3. **Claim Task**

- Method: `POST` | URL: `https://app.gramnetwork.online/api/complete_task.php`
- Payload: `initData={decoded_token}&task_id={id}`

4. **Start Mining**

- Method: `POST` | URL: `https://app.gramnetwork.online/api/start_mining.php`

5. **Claim Mining**

- Method: `POST` | URL: `https://app.gramnetwork.online/api/claim_mining.php`

6. **Boost Power**

- Method: `POST` | URL: `https://app.gramnetwork.online/api/boost_power.php`

```

```
