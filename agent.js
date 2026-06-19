require("dotenv").config();

const rawAccounts = process.env.ACCOUNTS;

if (!rawAccounts) {
  console.error("Error: Variabel ACCOUNTS tidak ditemukan di file .env!");
  process.exit(1);
}

// Pecah token menjadi array akun
const accounts = rawAccounts.split("||");

// Daftar User-Agent acak agar tidak terdeteksi bot multi-akun
const userAgents = [
  "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36 Telegram-Android/10.1.3",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Telegram-iOS/10.0.2",
  "Mozilla/5.0 (Linux; Android 12; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36 Telegram-Android/9.6.5",
  "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
];

// Helper fungsi untuk jeda waktu (sleep)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper untuk membuat padding titik-titik pada log agar rapi
const formatRow = (label, value, targetWidth = 30) => {
  const dotCount = Math.max(1, targetWidth - label.length - value.length);
  return `${label} ${".".repeat(dotCount)} ${value}`;
};

// Fungsi dasar untuk request HTTP ke API Gram Network
async function makeRequest(url, method, payload = null, userAgent) {
  const options = {
    method: method,
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": userAgent,
      "X-Requested-With": "org.telegram.messenger",
    },
  };

  if (payload) {
    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = payload;
  }

  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

// Fungsi utama Agent
async function runAgent() {
  while (true) {
    let globalStatus = "Idle";
    let claimableStatus = "NO";
    let totalMiningRate = 0;
    const accountLogs = [];
    let nextSleepDuration = 14400; // Default 4 jam dalam detik

    // Loop memproses setiap akun satu per satu
    for (let i = 0; i < accounts.length; i++) {
      const rawToken = accounts[i].trim();
      if (!rawToken) continue;

      const decodedToken = decodeURIComponent(rawToken);
      const currentUA =
        userAgents[Math.floor(Math.random() * userAgents.length)];
      const accountName = `User ${i + 1}`;

      try {
        // 1. Ambil data kondisi user saat ini
        const userUrl = `https://app.gramnetwork.online/api/get_user_data.php?initData=${encodeURIComponent(decodedToken)}`;
        const resUser = await makeRequest(userUrl, "GET", null, currentUA);

        if (resUser.success && resUser.user) {
          globalStatus = "Active";
          let balance = parseFloat(resUser.user.total_balance).toLocaleString(
            "id-ID",
          );
          let rate = parseFloat(resUser.user.mining_rate) || 0;
          totalMiningRate += rate;

          // Cek Siklus Penambangan (Claim -> Start -> Boost)
          if (resUser.user.mining_status === "Ready to Claim") {
            claimableStatus = "YES";

            // Eksekusi Claim Mining
            await makeRequest(
              "https://app.gramnetwork.online/api/claim_mining.php",
              "POST",
              `initData=${encodeURIComponent(decodedToken)}`,
              currentUA,
            );

            // Eksekusi Start Mining
            await makeRequest(
              "https://app.gramnetwork.online/api/start_mining.php",
              "POST",
              `initData=${encodeURIComponent(decodedToken)}`,
              currentUA,
            );

            // Eksekusi Boost Power setelah start mining
            await makeRequest(
              "https://app.gramnetwork.online/api/boost_power.php",
              "POST",
              `initData=${encodeURIComponent(decodedToken)}`,
              currentUA,
            );
          }

          // Cek sisa waktu terpendek untuk acuan tidur global agent
          const timeLeft = parseInt(resUser.user.time_left_seconds) || 0;
          if (timeLeft > 0 && timeLeft < nextSleepDuration) {
            nextSleepDuration = timeLeft;
          }

          // 2. Pembersihan Tugas (Hanya Kategori SOCIAL)
          if (resUser.uncompleted_task_count > 0) {
            const taskUrl = `https://app.gramnetwork.online/api/get_tasks.php?initData=${encodeURIComponent(decodedToken)}&_t=${Date.now()}`;
            const resTasks = await makeRequest(taskUrl, "GET", null, currentUA);

            if (resTasks.success && resTasks.tasks) {
              for (const task of resTasks.tasks) {
                if (task.category === "social" && !task.is_completed) {
                  // Eksekusi penyelesaian tugas
                  await makeRequest(
                    "https://app.gramnetwork.online/api/complete_task.php",
                    "POST",
                    `initData=${encodeURIComponent(decodedToken)}&task_id=${task.id}`,
                    currentUA,
                  );
                  // Jeda acak aman 2-5 detik setelah membersihkan task
                  const delayTime =
                    Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
                  await sleep(delayTime);
                }
              }
            }
          }

          // Catat log tampilan untuk akun ini
          accountLogs.push(formatRow(accountName, balance));
        } else {
          accountLogs.push(formatRow(accountName, "Error Data"));
        }
      } catch (err) {
        accountLogs.push(formatRow(accountName, "Failed/RTO"));
      }
    }

    // Tampilkan Output Dashboard Ringkas Sesuai Request
    console.clear();
    console.log("Gram Network Mining");
    console.log(`Status         : ${globalStatus}`);
    console.log("─────────────────────────────");
    accountLogs.forEach((log) => console.log(log));
    console.log("─────────────────────────────");
    console.log(`Total Mining   : ${totalMiningRate.toFixed(2)}/day`);
    console.log(`Claimable      : ${claimableStatus}`);

    // Konversi detik ke format menit/jam untuk info log jeda
    const sleepMinutes = Math.ceil((nextSleepDuration + 60) / 60);
    console.log(
      `\n[Agent Logs]: Hibernasi selama ${sleepMinutes} menit sebelum siklus berikutnya...`,
    );

    // Istirahatkan agent secara dinamis sesuai sisa durasi terpendek + buffer 1 menit
    await sleep((nextSleepDuration + 60) * 1000);
  }
}

// Jalankan program utama Agent
runAgent();
