#!/usr/bin/env python3
"""Gram Network — Mining claim only (fast, <60s)"""
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
    page.goto('https://app.gramnetwork.online/', wait_until='networkidle', timeout=30000)
    time.sleep(5)

    report = []
    total_balance = 0.0
    total_earned = 0.0

    for name, raw in accounts:
        enc = encode_token(raw)
        actions = []

        try:
            result = api_fetch(page, f"get_user_data.php?initData={enc}")
            data = json.loads(result)

            if 'user' not in data:
                report.append(f"{name:10s} ERROR: {str(data)[:50]}")
                continue

            u = data['user']
            balance_before = float(u['total_balance'])
            mining = u.get('mining_status', '?')

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

            # Boost always
            r = json.loads(api_fetch(page, "boost_power.php", "POST", f"initData={enc}"))
            if r.get('success'):
                actions.append('boost')

            # Refresh balance
            result2 = api_fetch(page, f"get_user_data.php?initData={enc}")
            data2 = json.loads(result2)
            balance_after = float(data2['user']['total_balance'])
            earned = balance_after - balance_before

            acts = ','.join(actions) if actions else 'idle'
            report.append(f"{name:10s}{balance_after:>8.2f}  {acts}")
            total_balance += balance_after
            total_earned += earned

        except Exception as e:
            report.append(f"{name:10s} ERROR: {str(e)[:60]}")

    lines = []
    lines.append("```bash")
    lines.append("Gram Network · Mining Claim")
    lines.append("Engine : CloakBrowser")
    lines.append("─" * 28)
    for line in report:
        lines.append(line)
    lines.append("─" * 28)
    lines.append(f"{'Accounts':10s}{len(accounts):>8d}")
    lines.append(f"{'Total':10s}{total_balance:>8.2f}")
    lines.append(f"{'Earned':10s}{total_earned:>+8.2f}")
    lines.append("```")
    print("\n".join(lines))

    browser.close()


if __name__ == '__main__':
    main()
