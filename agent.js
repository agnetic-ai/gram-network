require("dotenv").config();

const rawAccounts = process.env.ACCOUNTS;

if (!rawAccounts) {
  console.error("Error: Variabel ACCOUNTS tidak ditemukan di file .env!");
  process.exit(1);
}

const accounts = rawAccounts.split("||");

const userAgents = [
  "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36 Telegram-Android/10.1.3",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Telegram-iOS/10.0.2",
  "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatRow = (label, value, targetWidth = 30) => {
  const dotCount = Math.max(1, targetWidth - label.length - value.length);
  return `${label} ${".".repeat(dotCount)} ${value}`;
};

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

async function runAgent() {
  while (true) {
    let globalStatus = "Active";
    let claimableStatus = "NO";
    let totalMiningRate = 0;
    const accountLogs = [];
    let nextSleepDuration = 14400;

    for (let i = 0; i < accounts.length; i++) {
      const rawToken = accounts[i].trim();
      if (!rawToken) continue;

      const decodedToken = decodeURIComponent(rawToken);
      const currentUA =
        userAgents[Math.floor(Math.random() * userAgents.length)];
      const accountName = `User ${i + 1}`;

      try {
        const userUrl = `https://app.gramnetwork.online/api/get_user_data.php?initData=${encodeURIComponent(decodedToken)}`;
        let resUser = await makeRequest(userUrl, "GET", null, currentUA);

        if (resUser.success && resUser.user) {
          // 1. LOGIKA UTAMA SIKLUS MINING (Perbaikan Kondisi Inactive)

          // KONDISI A: Waktunya klaim (Ready to Claim)
          if (resUser.user.mining_status === "Ready to Claim") {
            claimableStatus = "YES";
            await makeRequest(
              "https://app.gramnetwork.online/api/claim_mining.php",
              "POST",
              `initData=${encodeURIComponent(decodedToken)}`,
              currentUA,
            );
            await makeRequest(
              "https://app.gramnetwork.online/api/start_mining.php",
              "POST",
              `initData=${encodeURIComponent(decodedToken)}`,
              currentUA,
            );
            await makeRequest(
              "https://app.gramnetwork.online/api/boost_power.php",
              "POST",
              `initData=${encodeURIComponent(decodedToken)}`,
              currentUA,
            );

            // Refresh data setelah aksi
            resUser = await makeRequest(userUrl, "GET", null, currentUA);
          }
          // KONDISI B: Belum start nambang sama sekali (Inactive)
          else if (resUser.user.mining_status === "Inactive") {
            console.log(
              `[${accountName}] Status Inactive. Mencoba menyalakan mesin mining...`,
            );
            await makeRequest(
              "https://app.gramnetwork.online/api/start_mining.php",
              "POST",
              `initData=${encodeURIComponent(decodedToken)}`,
              currentUA,
            );
            await makeRequest(
              "https://app.gramnetwork.online/api/boost_power.php",
              "POST",
              `initData=${encodeURIComponent(decodedToken)}`,
              currentUA,
            );

            // Refresh data setelah aksi
            resUser = await makeRequest(userUrl, "GET", null, currentUA);
          }

          // Parsing ulang data terbaru untuk kalkulasi dashboard
          let balance = parseFloat(
            resUser.user.total_balance || 0,
          ).toLocaleString("id-ID");
          let hourlyRate = parseFloat(resUser.user.mining_rate || 0);
          totalMiningRate += hourlyRate;

          const timeLeft = parseInt(resUser.user.time_left_seconds) || 0;
          if (timeLeft > 0 && timeLeft < nextSleepDuration) {
            nextSleepDuration = timeLeft;
          }

          // 2. Pembersihan Tugas SOCIAL
          if (resUser.uncompleted_task_count > 0) {
            const taskUrl = `https://app.gramnetwork.online/api/get_tasks.php?initData=${encodeURIComponent(decodedToken)}&_t=${Date.now()}`;
            const resTasks = await makeRequest(taskUrl, "GET", null, currentUA);

            if (resTasks.success && resTasks.tasks) {
              for (const task of resTasks.tasks) {
                if (task.category === "social" && !task.is_completed) {
                  await makeRequest(
                    "https://app.gramnetwork.online/api/complete_task.php",
                    "POST",
                    `initData=${encodeURIComponent(decodedToken)}&task_id=${task.id}`,
                    currentUA,
                  );
                  await sleep(
                    Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000,
                  );
                }
              }
            }
          }

          accountLogs.push(formatRow(accountName, balance));
        } else {
          accountLogs.push(formatRow(accountName, "Error Data"));
        }
      } catch (err) {
        accountLogs.push(formatRow(accountName, "Failed/RTO"));
        globalStatus = "Idle";
      }
    }

    // Tampilkan Tampilan Dashboard
    console.clear();
    console.log("Gram Network Mining");
    console.log(`Status         : ${globalStatus}`);
    console.log("─────────────────────────────");
    accountLogs.forEach((log) => console.log(log));
    console.log("─────────────────────────────");
    console.log(`Total Mining   : ${(totalMiningRate * 24).toFixed(2)}/day`);
    console.log(`Claimable      : ${claimableStatus}`);
    console.log("─────────────────────────────");

    // Hitung mundur waktu tidur global
    let remainingTime = nextSleepDuration + 60;
    while (remainingTime > 0) {
      const minutesLeft = Math.ceil(remainingTime / 60);
      process.stdout.write(
        `\r[Agent Logs]: Hibernasi selama ${minutesLeft} menit sebelum siklus berikutnya...`,
      );
      await sleep(60000);
      remainingTime -= 60;
    }
  }
}

runAgent();
