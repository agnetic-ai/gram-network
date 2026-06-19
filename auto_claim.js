#!/usr/bin/env node
/**
 * Gram Network Auto-Claim — 3 accounts, claim + start + boost + tasks
 * Reads accounts from .env (NAME=TOKEN per line)
 */

const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

// ── Load .env ───────────────────────────────────────────────
function loadEnv(filePath) {
  const abs = path.resolve(__dirname, filePath);
  if (!fs.existsSync(abs)) {
    console.error(`Error: ${abs} not found`);
    process.exit(1);
  }
  const accounts = [];
  for (const line of fs.readFileSync(abs, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const name = trimmed.slice(0, eqIdx).trim();
    const token = trimmed.slice(eqIdx + 1).trim();
    if (name && token) accounts.push({ name, token });
  }
  return accounts;
}

const ACCOUNTS = loadEnv(".env");

const API = "https://app.gramnetwork.online/api";
const UAS = [
  "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36 Telegram-Android/10.1.3",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Telegram-iOS/10.0.2",
  "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
];

function randomUA() {
  return UAS[Math.floor(Math.random() * UAS.length)];
}

function encodeToken(raw) {
  let decoded = decodeURIComponent(raw);
  if (decoded.includes("%26") || decoded.includes("%3D")) {
    decoded = decodeURIComponent(decoded);
  }
  return encodeURIComponent(decoded);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function request(url, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        Accept: "application/json",
        "User-Agent": randomUA(),
        "X-Requested-With": "org.telegram.messenger",
      },
      timeout: 15000,
    };
    if (body) {
      opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
      opts.headers["Content-Length"] = Buffer.byteLength(body);
    }

    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`JSON parse error: ${data.slice(0, 100)}`));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
    if (body) req.write(body);
    req.end();
  });
}

function get(endpoint, enc) {
  return request(`${API}/${endpoint}?initData=${enc}`);
}

function post(endpoint, enc) {
  return request(`${API}/${endpoint}`, "POST", `initData=${enc}`);
}

// ── MAIN ──
async function main() {
  const report = [];
  let totalEarned = 0;

  for (const { name, token } of ACCOUNTS) {
    const enc = encodeToken(token);
    let earned = 0;

    try {
      const uData = await get("get_user_data.php", enc);
      const u = uData.user;
      const balanceBefore = parseFloat(u.total_balance);
      const actions = [];

      // Mining cycle
      if (u.mining_status === "Ready to Claim") {
        const r1 = await post("claim_mining.php", enc);
        if (r1.success) {
          actions.push("claim");
          const r2 = await post("start_mining.php", enc);
          if (r2.success) actions.push("start");
          const r3 = await post("boost_power.php", enc);
          if (r3.success) actions.push("boost");
        }
      } else if (u.mining_status === "Inactive") {
        const r1 = await post("start_mining.php", enc);
        if (r1.success) actions.push("start");
        const r2 = await post("boost_power.php", enc);
        if (r2.success) actions.push("boost");
      }

      // Social tasks
      let completedIds = [];
      try {
        completedIds = JSON.parse(u.task_completed_ids || "[]");
      } catch {
        completedIds = [];
      }

      const tasksData = await get(
        `get_tasks.php?initData=${enc}&_t=${Date.now()}`
      );
      const social = (tasksData.tasks || []).filter(
        (t) =>
          t.category === "social" &&
          !t.is_completed &&
          !completedIds.includes(t.id)
      );

      let tasksDone = 0;
      for (const task of social) {
        const r = await post("complete_task.php", `${enc}&task_id=${task.id}`);
        if (r.success) {
          tasksDone++;
          earned += parseFloat(task.reward || 0);
        }
        await sleep(30000);
      }

      // Refresh balance
      const u2Data = await get("get_user_data.php", enc);
      const balanceAfter = parseFloat(u2Data.user.total_balance);
      earned = balanceAfter - balanceBefore;
      totalEarned += earned;

      report.push({
        name,
        balance: balanceAfter,
        earned,
        actions,
        tasks: tasksDone,
      });
    } catch (e) {
      report.push({ name, error: e.message.slice(0, 60) });
    }
  }

  // ── OUTPUT ──
  const lines = [];
  lines.push("Gram Network \u00b7 Cycle Complete");
  lines.push("\u2500".repeat(26));

  let totalBalance = 0;
  for (const r of report) {
    if (r.error) {
      lines.push(`${r.name.padEnd(10)} ERROR`);
    } else {
      lines.push(`${r.name.padEnd(10)}${r.balance.toFixed(2).padStart(8)}`);
      totalBalance += r.balance;
    }
  }

  lines.push("\u2500".repeat(26));
  lines.push(`${"Accounts".padEnd(10)}${String(report.length).padStart(8)}`);
  lines.push(`${"Total".padEnd(10)}${totalBalance.toFixed(2).padStart(8)}`);
  lines.push(
    `${"Earned".padEnd(10)}${("+" + totalEarned.toFixed(2)).padStart(8)}`
  );

  console.log(lines.join("\n"));
}

main().catch(console.error);
