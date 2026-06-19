#!/usr/bin/env node
/**
 * Gram Network Auto-Claim — 3 accounts, claim + start + boost + tasks
 * Node.js port of auto_claim.py
 */

const https = require("https");
const { URL } = require("url");

const ACCOUNTS = [
  {
    name: "ombengz",
    token:
      'user=%7B%22id%22%3A1605260429%2C%22first_name%22%3A%22Jawa%22%2C%22last_name%22%3A%22Jawa%22%2C%22username%22%3A%22ombengz%22%2C%22language_code%22%3A%22en%22%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F44K0MhsyvO5CLqK161kfgFTpTOieEnJCa8fulFodyYM.svg%22%7D&chat_instance=-3731378210367609137&chat_type=channel&start_param=8744073404&auth_date=1781839644&signature=uzUoVxrFKbgrJWfimWrktUAn0EtwF0hzm9Mi-3aZtIL2bPkGa3Lp91i5__ZTR2z2CQnVc3SzS6NFbADs6Fj5AA&hash=294e3a9ff6bdb6d1834df30a4259ed5d4ff1ef9d222bc885e40795ef169c78c0',
  },
  {
    name: "sidoraes",
    token:
      'user=%7B%22id%22%3A7385639684%2C%22first_name%22%3A%22Kang%22%2C%22last_name%22%3A%22Eight%20%E2%96%AA%EF%B8%8F%22%2C%22username%22%3A%22sidoraes%22%2C%22language_code%22%3A%22en%22%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FTd1KKsJwy-BhdawAaOIhLj8r6UWss1m_QDLFosXFo-924kxQJ8U2_unNwFNyBejJ.svg%22%7D&chat_instance=-1972142855832227701&chat_type=channel&start_param=1605260429&auth_date=1781837769&signature=o7uaHQgQRxEAfxjire0Y2N7f5_zIysMY_pjDD6-WjKYlgbVB1KED2GrXyj2XBOxDgErSfhvCfckMZgb1r3vdCw&hash=4df3913de6fb29b5099afd8ea65aa5de151e875d1ebc4a0e466a1bb1d3422c9e',
  },
  {
    name: "estqimo",
    token:
      "user%3D%257B%2522id%2522%253A5853251704%252C%2522first_name%2522%253A%2522Estri%2522%252C%2522last_name%2522%253A%2522Wulandari%2520%25F0%259F%258D%2585%2520%25E2%2596%25AA%25EF%25B8%258F%2522%252C%2522username%2522%253A%2522estqimo%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522photo_url%2522%253A%2522https%253A%255C%2F%255C%2Ft.me%255C%2Fi%255C%2Fuserpic%255C%2F320%255C%2FtE36BAIJiFNvyTp1a9HqSsrvHz5CTjK3m_uJBt1HL2ECDkvfb-x_RpWp_hAucnz5.svg%2522%257D%26chat_instance%3D-3731378210367609137%26chat_type%3Dchannel%26start_param%3D8744073404%26auth_date%3D1781660262%26signature%3DZdrLVAKK04Ed6FwIRg1uWCq11XZVDxWbJSYgaL4FCrri1k_AMZ6BohA5YOML7N24Ibd47YyN8D550glkf1j5CA%26hash%3D023065dd0e783499c2d602c5cf1ff9c5710651f77b617620eebba302d984985f",
  },
];

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
      // Get user data
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
