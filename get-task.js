// Jika kamu pakai Node.js versi lama (Opsi B), hapus tanda komentar di bawah ini:
require("dotenv").config();

// 1. Ambil data initData murni dari file .env (HANYA SATU KALI DEKLARASI)
const rawInitData = process.env.RAW_INIT_DATA;

if (!rawInitData) {
  console.error("Error: RAW_INIT_DATA tidak ditemukan di file .env!");
  process.exit(1);
}

// 2. Generate timestamp 'now' (milidetik saat ini)
const timestampNow = Date.now().toString();

// 3. Menyusun URL Query menggunakan URLSearchParams
const params = new URLSearchParams();
params.append("initData", decodeURIComponent(rawInitData));
params.append("_t", timestampNow);

const url = `https://app.gramnetwork.online/api/get_tasks.php?${params.toString()}`;

async function getAvailableTask() {
  try {
    console.log(`Mengirim request dengan timestamp terbaru: ${timestampNow}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "X-Requested-With": "org.telegram.messenger", // Sudah diperbaiki tanda kutipnya
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response Berhasil:", data);
  } catch (error) {
    console.error("Terjadi kesalahan fetch:", error.message);
  }
}

// Jalankan fungsi
getAvailableTask();
