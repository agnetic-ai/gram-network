#!/usr/bin/env python3
"""Gram Network Auto-Claim via CloakBrowser — reads tokens from .env"""
import json, os, sys, urllib.parse, time

os.environ.setdefault('DISPLAY', ':99')
os.environ.setdefault('CLOAKBROWSER_AUTO_UPDATE', 'false')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(SCRIPT_DIR, '.env')
API = "https://app.gramnetwork.online/api"


def load_accounts():
    accounts = []
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                name, token = line.split('=', 1)
                accounts.append((name.strip(), token.strip()))
    return accounts


def encode_token(raw):
    decoded = urllib.parse.unquote(raw)
    if '%26' in decoded or '%3D' in decoded:
        decoded = urllib.parse.unquote(decoded)
    return urllib.parse.quote(decoded, safe='')


def api_fetch(page, endpoint, method="GET", data=None):
    if method == "POST":
        return page.evaluate(f'''
            async () => {{
                const r = await fetch("{API}/{endpoint}", {{
                    method: "POST",
                    headers: {{
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'org.telegram.messenger'
                    }},
                    body: "{data}"
                }});
                return await r.text();
            }}
        ''')
    return page.evaluate(f'''
        async () => {{
            const r = await fetch("{API}/{endpoint}", {{
                headers: {{
                    'Accept': 'application/json',
                    'X-Requested-With': 'org.telegram.messenger'
                }}
            }});
            return await r.text();
        }}
    ''')


def main():
    from cloakbrowser import launch

    accounts = load_accounts()
    if not accounts:
        print("ERROR: no accounts in .env")
        sys.exit(1)

    browser = launch(headless=False)
    page = browser.new_page()

    # Solve JS challenge
    page.goto('https://app.gramnetwork.online/', wait_until='networkidle', timeout=30000)
    time.sleep(5)

    report = []
    total_balance = 0.0
    total_earned = 0.0
    total_tasks = 0
    total_skipped = 0

    for name, raw in accounts:
        enc = encode_token(raw)
        earned = 0.0
        actions = []
        tasks_done = 0
        tasks_skip = 0

        try:
            result = api_fetch(page, f"get_user_data.php?initData={enc}")
            data = json.loads(result)

            if 'user' not in data:
                report.append(f"{name:10s} ERROR: {str(data)[:50]}")
                continue

            u = data['user']
            balance_before = float(u['total_balance'])
            mining = u.get('mining_status', '?')

            try:
                completed_ids = json.loads(u.get('task_completed_ids', '[]'))
            except:
                completed_ids = []

            # Mining cycle
            if mining == 'Ready to Claim':
                r = json.loads(api_fetch(page, "claim_mining.php", "POST", f"initData={enc}"))
                if r.get('success'):
                    actions.append('claim')
                r = json.loads(api_fetch(page, "start_mining.php", "POST", f"initData={enc}"))
                if r.get('success'):
                    actions.append('start')
            elif mining == 'Inactive':
                r = json.loads(api_fetch(page, "start_mining.php", "POST", f"initData={enc}"))
                if r.get('success'):
                    actions.append('start')

            # Boost (always try)
            r = json.loads(api_fetch(page, "boost_power.php", "POST", f"initData={enc}"))
            if r.get('success'):
                actions.append('boost')

            # Social tasks — no cap, 22s delay
            try:
                tasks_data = json.loads(api_fetch(page, f"get_tasks.php?initData={enc}&_t={int(time.time()*1000)}"))
                social = [t for t in tasks_data.get('tasks', [])
                          if t.get('category') == 'social' and not t.get('is_completed')
                          and t.get('id') not in completed_ids]

                for i, task in enumerate(social):
                    resp = json.loads(api_fetch(page, "complete_task.php", "POST", f"initData={enc}&task_id={task['id']}"))
                    if resp.get('success'):
                        tasks_done += 1
                        earned += float(task.get('reward', 0))
                    else:
                        msg = resp.get('message', resp.get('error', ''))
                        if 'join the channel' in msg:
                            tasks_skip += 1
                        else:
                            # rate limit or other — still count as attempted
                            pass
                    if i < len(social) - 1:
                        time.sleep(22)
            except:
                pass

            # Refresh balance
            result2 = api_fetch(page, f"get_user_data.php?initData={enc}")
            data2 = json.loads(result2)
            balance_after = float(data2['user']['total_balance'])
            earned = balance_after - balance_before

            acts = ','.join(actions) if actions else 'idle'
            parts = [f"{name:10s}{balance_after:>8.2f}  {acts}"]
            if tasks_done:
                parts.append(f"+{tasks_done}task")
            if tasks_skip:
                parts.append(f"{tasks_skip}skip")
            report.append(' '.join(parts))
            total_balance += balance_after
            total_earned += earned
            total_tasks += tasks_done
            total_skipped += tasks_skip

        except Exception as e:
            report.append(f"{name:10s} ERROR: {str(e)[:60]}")

    # Output
    lines = []
    lines.append("```bash")
    lines.append("Gram Network · Cycle Complete")
    lines.append("Engine : CloakBrowser")
    lines.append("─" * 38)
    for line in report:
        lines.append(line)
    lines.append("─" * 38)
    lines.append(f"{'Accounts':10s}{len(accounts):>8d}")
    lines.append(f"{'Tasks':10s}{total_tasks:>8d}")
    if total_skipped:
        lines.append(f"{'Skipped':10s}{total_skipped:>8d}")
    lines.append(f"{'Total':10s}{total_balance:>8.2f}")
    lines.append(f"{'Earned':10s}{total_earned:>+8.2f}")
    lines.append("```")
    print("\n".join(lines))

    browser.close()


if __name__ == '__main__':
    main()
