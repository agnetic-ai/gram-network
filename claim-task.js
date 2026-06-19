require("dotenv").config();

// 1. Ambil data initData murni dari file .env
const rawInitData = process.env.RAW_INIT_DATA;

if (!rawInitData) {
  console.error("Error: RAW_INIT_DATA tidak ditemukan di file .env!");
  process.exit(1);
}

// Target task_id yang ingin diklaim
const targetTaskId = "57";

// 2. Decode initData ke string biasa
const decodedInitData = decodeURIComponent(rawInitData);

// 3. Menyusun Payload untuk Form Data
// Format hasil akhirnya otomatis menjadi: initData=user...&task_id=63
const formData = new URLSearchParams();
formData.append("initData", decodedInitData);
formData.append("task_id", targetTaskId);

const url = "https://app.gramnetwork.online/api/complete_task.php";

async function completeTask() {
  try {
    console.log(`Mencoba mengklaim task dengan ID: ${targetTaskId}...`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        // Wajib diset sebagai Form Data (urlencoded) sesuai permintaan API
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "X-Requested-With": "org.telegram.messenger",
      },
      body: formData.toString(), // Data dikirim via body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Response Claim Task ${targetTaskId} Berhasil:`, data);
  } catch (error) {
    console.error("Terjadi kesalahan saat klaim task:", error.message);
  }
}

// Jalankan fungsi
completeTask();
