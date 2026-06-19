#!/usr/bin/env python3
"""Gram Network Auto-Claim — 3 accounts, claim + start + boost + tasks"""
import urllib.parse, json, time, random, subprocess, sys

ACCOUNTS = [
    ('ombengz', 'user=%7B%22id%22%3A1605260429%2C%22first_name%22%3A%22Jawa%22%2C%22last_name%22%3A%22Jawa%22%2C%22username%22%3A%22ombengz%22%2C%22language_code%22%3A%22en%22%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F44K0MhsyvO5CLqK161kfgFTpTOieEnJCa8fulFodyYM.svg%22%7D&chat_instance=-3731378210367609137&chat_type=channel&start_param=8744073404&auth_date=1781839644&signature=uzUoVxrFKbgrJWfimWrktUAn0EtwF0hzm9Mi-3aZtIL2bPkGa3Lp91i5__ZTR2z2CQnVc3SzS6NFbADs6Fj5AA&hash=294e3a9ff6bdb6d1834df30a4259ed5d4ff1ef9d222bc885e40795ef169c78c0'),
    ('sidoraes', 'user=%7B%22id%22%3A7385639684%2C%22first_name%22%3A%22Kang%22%2C%22last_name%22%3A%22Eight%20%E2%96%AA%EF%B8%8F%22%2C%22username%22%3A%22sidoraes%22%2C%22language_code%22%3A%22en%22%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FTd1KKsJwy-BhdawAaOIhLj8r6UWss1m_QDLFosXFo-924kxQJ8U2_unNwFNyBejJ.svg%22%7D&chat_instance=-1972142855832227701&chat_type=channel&start_param=1605260429&auth_date=1781837769&signature=o7uaHQgQRxEAfxjire0Y2N7f5_zIysMY_pjDD6-WjKYlgbVB1KED2GrXyj2XBOxDgErSfhvCfckMZgb1r3vdCw&hash=4df3913de6fb29b5099afd8ea65aa5de151e875d1ebc4a0e466a1bb1d3422c9e'),
    ('estqimo', 'user%3D%257B%2522id%2522%253A5853251704%252C%2522first_name%2522%253A%2522Estri%2522%252C%2522last_name%2522%253A%2522Wulandari%2520%25F0%259F%258D%2585%2520%25E2%2596%25AA%25EF%25B8%258F%2522%252C%2522username%2522%253A%2522estqimo%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522photo_url%2522%253A%2522https%253A%255C%2F%255C%2Ft.me%255C%2Fi%255C%2Fuserpic%255C%2F320%255C%2FtE36BAIJiFNvyTp1a9HqSsrvHz5CTjK3m_uJBt1HL2ECDkvfb-x_RpWp_hAucnz5.svg%2522%257D%26chat_instance%3D-3731378210367609137%26chat_type%3Dchannel%26start_param%3D8744073404%26auth_date%3D1781660262%26signature%3DZdrLVAKK04Ed6FwIRg1uWCq11XZVDxWbJSYgaL4FCrri1k_AMZ6BohA5YOML7N24Ibd47YyN8D550glkf1j5CA%26hash%3D023065dd0e783499c2d602c5cf1ff9c5710651f77b617620eebba302d984985f'),
]

API = "https://app.gramnetwork.online/api"
UAS = [
    "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36 Telegram-Android/10.1.3",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Telegram-iOS/10.0.2",
    "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
]

def encode_token(raw):
    decoded = urllib.parse.unquote(raw)
    if '%26' in decoded or '%3D' in decoded:
        decoded = urllib.parse.unquote(decoded)
    return urllib.parse.quote(decoded, safe='')

def curl(url, method="GET", data=None):
    ua = random.choice(UAS)
    cmd = ["curl", "-s", "--max-time", "15", "-X", method, url,
           "-H", "Accept: application/json",
           "-H", f"User-Agent: {ua}",
           "-H", "X-Requested-With: org.telegram.messenger"]
    if data:
        cmd += ["-H", "Content-Type: application/x-www-form-urlencoded", "--data", data]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    return json.loads(r.stdout)

def post(endpoint, enc):
    return curl(f"{API}/{endpoint}", "POST", f"initData={enc}")

# ── MAIN ──
report = []
total_earned = 0.0
total_tasks = 0

for name, raw in ACCOUNTS:
    enc = encode_token(raw)
    earned = 0.0
    tasks_done = 0

    try:
        # Get user data
        u = curl(f"{API}/get_user_data.php?initData={enc}")['user']
        balance_before = float(u['total_balance'])
        actions = []

        # Mining cycle
        if u['mining_status'] == 'Ready to Claim':
            r = post('claim_mining.php', enc)
            if r.get('success'):
                actions.append('claim')
                r = post('start_mining.php', enc)
                if r.get('success'):
                    actions.append('start')
                r = post('boost_power.php', enc)
                if r.get('success'):
                    actions.append('boost')
        elif u['mining_status'] == 'Inactive':
            r = post('start_mining.php', enc)
            if r.get('success'):
                actions.append('start')
            r = post('boost_power.php', enc)
            if r.get('success'):
                actions.append('boost')

        # Social tasks
        try:
            completed_ids = json.loads(u.get('task_completed_ids', '[]'))
        except:
            completed_ids = []

        tasks_data = curl(f"{API}/get_tasks.php?initData={enc}&_t={int(time.time()*1000)}")
        social = [t for t in tasks_data.get('tasks', [])
                  if t.get('category') == 'social' and not t.get('is_completed')
                  and t.get('id') not in completed_ids]

        for task in social:
            r = post('complete_task.php', f"{enc}&task_id={task['id']}")
            if r.get('success'):
                tasks_done += 1
                earned += float(task.get('reward', 0))
            time.sleep(30)

        # Refresh balance
        u2 = curl(f"{API}/get_user_data.php?initData={enc}")['user']
        balance_after = float(u2['total_balance'])
        earned = balance_after - balance_before

        report.append({
            'name': name,
            'balance': balance_after,
            'earned': earned,
            'actions': actions,
            'tasks': tasks_done,
            'mining': u2['mining_status'],
            'rate': u2['mining_rate'],
            'time_left': u2['time_left'],
        })
        total_earned += earned
        total_tasks += tasks_done

    except Exception as e:
        report.append({'name': name, 'error': str(e)[:60]})

# ── OUTPUT ──
lines = []
lines.append("Gram Network Auto-Claim")
lines.append("Status · Cycle Complete")
lines.append("─" * 30)

for r in report:
    if 'error' in r:
        lines.append(f"{r['name']:10s} ..... ERROR")
    else:
        lines.append(f"{r['name']:10s} ..... {r['balance']:.2f}")

lines.append("─" * 30)

for r in report:
    if 'error' not in r:
        acts = "+".join(r['actions']) if r['actions'] else 'idle'
        lines.append(f"{r['name']:10s} {acts:8s} tasks:{r['tasks']}")

lines.append("─" * 30)
lines.append(f"Earned         +{total_earned:.2f}")
lines.append(f"Tasks          {total_tasks} done")
lines.append("─" * 30)

output = "\n".join(lines)
print(output)
