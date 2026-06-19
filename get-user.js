require("dotenv").config();

// 1. Ambil data initData murni dari file .env
const rawInitData = process.env.ACCOUNTS;

if (!rawInitData) {
  console.error("Error: RAW_INIT_DATA tidak ditemukan di file .env!");
  process.exit(1);
}

// 2. Decode initData karena API ini meminta format string biasa (bukan url-encoded)
const decodedInitData = decodeURIComponent(rawInitData);

// 3. Menyusun URL Query sesuai format: ?initData={initData}
const params = new URLSearchParams();
params.append("initData", decodedInitData);

const url = `https://app.gramnetwork.online/api/get_user_data.php?${params.toString()}`;

async function getUserData() {
  try {
    console.log("Mengirim request untuk mengambil data user...");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "X-Requested-With": "org.telegram.messenger",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Response dalam bentuk JSON
    const data = await response.json();
    console.log("Response Data User Berhasil:", data);
  } catch (error) {
    console.error("Terjadi kesalahan fetch data user:", error.message);
  }
}

// Jalankan fungsi
getUserData();
