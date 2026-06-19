# Gram Network Mining Automation

Dokumentasi API dan Alur Kerja (_Work Flow_) untuk otomatisasi skrip pada Telegram Mini App **Gram Network Mining**. Semua request memanfaatkan token autentikasi `initData` yang disimpan secara aman di dalam file konfigurasi `.env`.

---

## 🛠️ Konfigurasi Environment (`.env`)

Sebelum menjalankan skrip, pastikan file `.env` sudah dikonfigurasi di root folder dengan format data murni (_tanpa teks "initData=" di depannya_):

```env
RAW_INIT_DATA=user%3D%257B%2522id%2522%253A5853251704...[sisa_token]
```
