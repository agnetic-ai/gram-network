require("dotenv").config();
const fs = require("fs");
const path = require("path");

// ─── CONFIG ───────────────────────────────────────────────
const CONFIG = {
  API_BASE: "https://app.gramnetwork.online/api",
  TASK_DELAY_MS: 30000, // 30s antar task (server rate limit ~20s)
  RETRY_MAX: 3,
  RETRY_BASE_DELAY_MS: 5000, // exponential backoff base
  CYCLE_BUFFER_SECONDS: 60, // buffer setelah mining selesai
  FALLBACK_SLEEP_SECONDS: 300, // 5 menit kalau semua akun gagal
  LOG_FILE: path.join(__dirname, "agent.log"),
};

// ─── LOGGING ──────────────────────────────────────────────
function log(level, msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(CONFIG.LOG_FILE, line + "\n");
  } catch (_) {}
}

// ─── GRACEFUL SHUTDOWN ────────────────────────────────────
let shutdownRequested = false;
function setupGracefulShutdown() {
  const handler = (signal) => {
    log("WARN", `Received ${signal}. Finishing current account then exiting...`);
    shutdownRequested = true;
  };
  process.on("SIGINT", handler);
  process.on("SIGTERM", handler);
}

// ─── USER AGENTS ──────────────────────────────────────────
const USER_AGENTS = [
  "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36 Telegram-Android/10.1.3",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Telegram-iOS/10.0.2",
  "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
];

// ─── HELPERS ──────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const formatRow = (label, value, targetWidth = 30) => {
  const dotCount = Math.max(1, targetWidth - label.length - String(value).length);
  return `${label} ${".".repeat(dotCount)} ${value}`;
};

// ─── HTTP REQUEST DENGAN RETRY ────────────────────────────
async function makeRequest(url, method, payload = null, userAgent, retries = CONFIG.RETRY_MAX) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const options = {
        method,
        headers: {
          Accept: "application/json, text/plain, */*",
          "User-Agent": userAgent,
          "X-Requested-With": "org.telegram.messenger",
        },
        signal: AbortSignal.timeout(15000), // 15s timeout per request
      };

      if (payload) {
        options.headers["Content-Type"] = "application/x-www-form-urlencoded";
        options.body = payload;
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status}: ${errText.slice(0, 100)}`);
      }

      return await response.json();
    } catch (err) {
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) throw err;

      const backoff = CONFIG.RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      log("WARN", `Request failed (attempt ${attempt}/${retries}): ${err.message}. Retry in ${backoff}ms`);
      await sleep(backoff);
    }
  }
}

// ─── CLAIM DAILY REWARD ───────────────────────────────────
async function claimDailyReward(decodedToken, ua) {
  try {
    const res = await makeRequest(
      `${CONFIG.API_BASE}/claim_daily.php`,
      "POST",
      `initData=${encodeURIComponent(decodedToken)}`,
      ua,
    );
    if (res.success) {
      log("INFO", `Daily reward claimed: +${res.reward || "?"} GRM`);
      return true;
    }
    log("DEBUG", `Daily reward: ${res.message || "not available"}`);
    return false;
  } catch (err) {
    log("DEBUG", `Daily reward claim skipped: ${err.message}`);
    return false;
  }
}

// ─── MAIN AGENT ───────────────────────────────────────────
async function runAgent() {
  setupGracefulShutdown();

  const rawAccounts = process.env.ACCOUNTS;
  if (!rawAccounts) {
    log("FATAL", "Variabel ACCOUNTS tidak ditemukan di file .env!");
    process.exit(1);
  }

  const accounts = rawAccounts.split("||").reduce((acc, token, i) => {
    const trimmed = token.trim();
    if (!trimmed) {
      log("WARN", `Empty token at index ${i}, skipping`);
    } else {
      acc.push(trimmed);
    }
    return acc;
  }, []);

  if (accounts.length === 0) {
    log("FATAL", "No valid accounts found in ACCOUNTS");
    process.exit(1);
  }

  log("INFO", `Agent started with ${accounts.length} account(s)`);

  let cycleCount = 0;

  while (!shutdownRequested) {
    cycleCount++;
    let globalStatus = "Active";
    let claimableStatus = "NO";
    let totalMiningRate = 0;
    const accountLogs = [];
    let nextSleepDuration = 14400; // default 4 jam
    let totalTasksCompleted = 0;
    let totalTasksFailed = 0;
    let allAccountsFailed = true;

    log("INFO", `── Cycle #${cycleCount} started ──`);

    for (let i = 0; i < accounts.length; i++) {
      if (shutdownRequested) break;

      const rawToken = accounts[i];
      const decodedToken = decodeURIComponent(rawToken);
      const currentUA = randomUA();
      const accountName = `User ${i + 1}`;

      try {
        // ── 1. GET USER DATA ──
        const userUrl = `${CONFIG.API_BASE}/get_user_data.php?initData=${encodeURIComponent(decodedToken)}`;
        let resUser = await makeRequest(userUrl, "GET", null, currentUA);

        if (!resUser.success || !resUser.user) {
          accountLogs.push(formatRow(accountName, "Error Data"));
          log("ERROR", `[${accountName}] Invalid user response`);
          continue;
        }

        allAccountsFailed = false;
        let user = resUser.user;

        // ── 2. MINING CYCLE ──
        // KONDISI A: Ready to Claim
        if (user.mining_status === "Ready to Claim") {
          claimableStatus = "YES";
          log("INFO", `[${accountName}] Mining ready to claim`);

          const claimRes = await makeRequest(
            `${CONFIG.API_BASE}/claim_mining.php`,
            "POST",
            `initData=${encodeURIComponent(decodedToken)}`,
            currentUA,
          );

          if (claimRes.success) {
            log("INFO", `[${accountName}] Mining claimed successfully`);

            // Start mining baru
            const startRes = await makeRequest(
              `${CONFIG.API_BASE}/start_mining.php`,
              "POST",
              `initData=${encodeURIComponent(decodedToken)}`,
              currentUA,
            );

            if (startRes.success) {
              log("INFO", `[${accountName}] Mining restarted`);

              // Boost power setelah start sukses
              await makeRequest(
                `${CONFIG.API_BASE}/boost_power.php`,
                "POST",
                `initData=${encodeURIComponent(decodedToken)}`,
                currentUA,
              );
              log("INFO", `[${accountName}] Boost power applied`);
            }
          }

          // Refresh data
          resUser = await makeRequest(userUrl, "GET", null, currentUA);
          user = resUser.user;
        }
        // KONDISI B: Inactive (belum pernah start)
        else if (user.mining_status === "Inactive") {
          log("INFO", `[${accountName}] Status Inactive, starting mining...`);

          const startRes = await makeRequest(
            `${CONFIG.API_BASE}/start_mining.php`,
            "POST",
            `initData=${encodeURIComponent(decodedToken)}`,
            currentUA,
          );

          if (startRes.success) {
            log("INFO", `[${accountName}] Mining started from Inactive`);

            // Boost hanya kalau start sukses
            await makeRequest(
              `${CONFIG.API_BASE}/boost_power.php`,
              "POST",
              `initData=${encodeURIComponent(decodedToken)}`,
              currentUA,
            );
            log("INFO", `[${accountName}] Boost power applied`);
          } else {
            log("WARN", `[${accountName}] Failed to start mining: ${JSON.stringify(startRes)}`);
          }

          // Refresh data
          resUser = await makeRequest(userUrl, "GET", null, currentUA);
          user = resUser.user;
        }

        // ── 3. DAILY REWARD ──
        if (user.claim_in === "00:00:00" || !user.last_daily_claim) {
          await claimDailyReward(decodedToken, currentUA);
        }

        // ── 4. PARSE BALANCE & MINING RATE ──
        const balance = parseFloat(user.total_balance || 0).toLocaleString("id-ID");
        const hourlyRate = parseFloat(user.mining_rate || 0);
        totalMiningRate += hourlyRate;

        const timeLeft = parseInt(user.time_left_seconds) || 0;
        if (timeLeft > 0 && timeLeft < nextSleepDuration) {
          nextSleepDuration = timeLeft;
        }

        // ── 5. SOCIAL TASKS ──
        let tasksDone = 0;
        let tasksFailed = 0;

        if (resUser.uncompleted_task_count > 0) {
          // Parse already completed task IDs
          let completedIds = [];
          try {
            completedIds = JSON.parse(user.task_completed_ids || "[]");
          } catch (_) {}

          const taskUrl = `${CONFIG.API_BASE}/get_tasks.php?initData=${encodeURIComponent(decodedToken)}&_t=${Date.now()}`;
          const resTasks = await makeRequest(taskUrl, "GET", null, currentUA);

          if (resTasks.success && resTasks.tasks) {
            const socialTasks = resTasks.tasks.filter(
              (t) => t.category === "social" && !t.is_completed && !completedIds.includes(t.id),
            );

            log("INFO", `[${accountName}] ${socialTasks.length} social tasks to complete`);

            for (const task of socialTasks) {
              if (shutdownRequested) break;

              try {
                const taskRes = await makeRequest(
                  `${CONFIG.API_BASE}/complete_task.php`,
                  "POST",
                  `initData=${encodeURIComponent(decodedToken)}&task_id=${task.id}`,
                  currentUA,
                  1, // no retry per task, just skip on fail
                );

                if (taskRes.success) {
                  tasksDone++;
                  log("INFO", `[${accountName}] Task ${task.id} done (+${taskRes.reward || "?"} GRM)`);
                } else {
                  tasksFailed++;
                  log("WARN", `[${accountName}] Task ${task.id} rejected: ${taskRes.message}`);
                }
              } catch (err) {
                tasksFailed++;
                log("WARN", `[${accountName}] Task ${task.id} error: ${err.message}`);
              }

              await sleep(CONFIG.TASK_DELAY_MS);
            }
          }
        }

        totalTasksCompleted += tasksDone;
        totalTasksFailed += tasksFailed;

        accountLogs.push(formatRow(accountName, balance));
        accountLogs.push(formatRow("  tasks", `${tasksDone} done / ${tasksFailed} failed`));

      } catch (err) {
        accountLogs.push(formatRow(accountName, "Failed/RTO"));
        globalStatus = "Degraded";
        log("ERROR", `[${accountName}] Cycle error: ${err.message}`);
      }
    }

    // ── DASHBOARD OUTPUT ──
    console.clear();
    console.log("Gram Network Mining");
    console.log(`Status         : ${globalStatus}`);
    console.log(`Cycle          : #${cycleCount}`);
    console.log("─────────────────────────────");
    accountLogs.forEach((l) => console.log(l));
    console.log("─────────────────────────────");
    console.log(`Total Mining   : ${(totalMiningRate * 24).toFixed(2)}/day`);
    console.log(`Claimable      : ${claimableStatus}`);
    console.log(`Tasks          : ${totalTasksCompleted} done / ${totalTasksFailed} failed`);
    console.log("─────────────────────────────");
    log("INFO", `Cycle #${cycleCount} done | Mining: ${(totalMiningRate * 24).toFixed(2)}/day | Tasks: +${totalTasksCompleted}/-${totalTasksFailed}`);

    // ── SLEEP LOGIC ──
    // Kalau semua akun gagal, pakai fallback pendek
    let sleepDuration;
    if (allAccountsFailed) {
      sleepDuration = CONFIG.FALLBACK_SLEEP_SECONDS;
      log("WARN", `All accounts failed. Short sleep: ${sleepDuration}s`);
    } else {
      sleepDuration = nextSleepDuration + CONFIG.CYCLE_BUFFER_SECONDS;
    }

    let remainingTime = sleepDuration;
    while (remainingTime > 0 && !shutdownRequested) {
      const minutesLeft = Math.ceil(remainingTime / 60);
      process.stdout.write(
        `\r[Agent]: Hibernasi ${minutesLeft} menit sebelum siklus berikutnya...`,
      );
      await sleep(60000);
      remainingTime -= 60;
    }

    if (shutdownRequested) {
      log("INFO", "Shutdown requested. Agent stopped gracefully.");
      break;
    }
  }
}

runAgent().catch((err) => {
  log("FATAL", `Unhandled error: ${err.message}\n${err.stack}`);
  process.exit(1);
});
