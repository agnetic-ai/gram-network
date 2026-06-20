#!/usr/bin/env python3
"""Gram Network — CloakBrowser cookie extractor + API caller"""
import json, sys, os, urllib.parse, time

os.environ['DISPLAY'] = ':99'
os.environ['CLOAKBROWSER_AUTO_UPDATE'] = 'false'

from cloakbrowser import launch

ACCOUNTS = [
    ('ombengz', 'user=%7B%22id%22%3A1605260429%2C%22first_name%22%3A%22Jawa%22%2C%22last_name%22%3A%22Jawa%22%2C%22username%22%3A%22ombengz%22%2C%22language_code%22%3A%22en%22%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F44K0MhsyvO5CLqK161kfgFTpTOieEnJCa8fulFodyYM.svg%22%7D&chat_instance=-3731378210367609137&chat_type=channel&start_param=8744073404&auth_date=1781839644&signature=uzUoVxrFKbgrJWfimWrktUAn0EtwF0hzm9Mi-3aZtIL2bPkGa3Lp91i5__ZTR2z2CQnVc3SzS6NFbADs6Fj5AA&hash=294e3a9ff6bdb6d1834df30a4259ed5d4ff1ef9d222bc885e40795ef169c78c0'),
    ('sidoraes', 'user=%7B%22id%22%3A7385639684%2C%22first_name%22%3A%22Kang%22%2C%22last_name%22%3A%22Eight%20%E2%96%AA%EF%B8%8F%22%2C%22username%22%3A%22sidoraes%22%2C%22language_code%22%3A%22en%22%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FTd1KKsJwy-BhdawAaOIhLj8r6UWss1m_QDLFosXFo-924kxQJ8U2_unNwFNyBejJ.svg%22%7D&chat_instance=-1972142855832227701&chat_type=channel&start_param=1605260429&auth_date=1781837769&signature=o7uaHQgQRxEAfxjire0Y2N7f5_zIysMY_pjDD6-WjKYlgbVB1KED2GrXyj2XBOxDgErSfhvCfckMZgb1r3vdCw&hash=4df3913de6fb29b5099afd8ea65aa5de151e875d1ebc4a0e466a1bb1d3422c9e'),
    ('estqimo', 'user%3D%257B%2522id%2522%253A5853251704%252C%2522first_name%2522%253A%2522Estri%2522%252C%2522last_name%2522%253A%2522Wulandari%2520%25F0%259F%258D%2585%2520%25E2%2596%25AA%25EF%25B8%258F%2522%252C%2522username%2522%253A%2522estqimo%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522photo_url%2522%253A%2522https%253A%255C%2F%255C%2Ft.me%255C%2Fi%255C%2Fuserpic%255C%2F320%255C%2FtE36BAIJiFNvyTp1a9HqSsrvHz5CTjK3m_uJBt1HL2ECDkvfb-x_RpWp_hAucnz5.svg%2522%257D%26chat_instance%3D-3731378210367609137%26chat_type%3Dchannel%26start_param%3D8744073404%26auth_date%3D1781660262%26signature%3DZdrLVAKK04Ed6FwIRg1uWCq11XZVDxWbJSYgaL4FCrri1k_AMZ6BohA5YOML7N24Ibd47YyN8D550glkf1j5CA%26hash%3D023065dd0e783499c2d602c5cf1ff9c5710651f77b617620eebba302d984985f'),
]

API = "https://app.gramnetwork.online/api"

def encode_token(raw):
    decoded = urllib.parse.unquote(raw)
    if '%26' in decoded or '%3D' in decoded:
        decoded = urllib.parse.unquote(decoded)
    return urllib.parse.quote(decoded, safe='')

def main():
    browser = launch(headless=False)
    page = browser.new_page()

    # Step 1: Hit the site to trigger + solve JS challenge
    page.goto('https://app.gramnetwork.online/', wait_until='networkidle', timeout=30000)
    time.sleep(5)  # let challenge resolve

    # Step 2: Try API call via browser (JS fetch)
    report = []
    total_balance = 0.0
    total_earned = 0.0

    for name, raw in ACCOUNTS:
        enc = encode_token(raw)
        try:
            # Use browser's fetch to call API (has solved cookies)
            result = page.evaluate(f'''
                async () => {{
                    const r = await fetch("{API}/get_user_data.php?initData={enc}", {{
                        headers: {{
                            'Accept': 'application/json',
                            'X-Requested-With': 'org.telegram.messenger'
                        }}
                    }});
                    return await r.text();
                }}
            ''')
            
            # Check if JSON
            try:
                data = json.loads(result)
                if 'user' in data:
                    u = data['user']
                    balance = float(u['total_balance'])
                    mining = u.get('mining_status', '?')
                    
                    actions = []
                    # Mining cycle
                    if mining == 'Ready to Claim':
                        # Claim
                        r1 = page.evaluate(f'''
                            async () => {{
                                const r = await fetch("{API}/claim_mining.php", {{
                                    method: "POST",
                                    headers: {{
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'X-Requested-With': 'org.telegram.messenger'
                                    }},
                                    body: "initData={enc}"
                                }});
                                return await r.text();
                            }}
                        ''')
                        d1 = json.loads(r1)
                        if d1.get('success'):
                            actions.append('claim')
                        
                        # Start
                        r2 = page.evaluate(f'''
                            async () => {{
                                const r = await fetch("{API}/start_mining.php", {{
                                    method: "POST",
                                    headers: {{
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'X-Requested-With': 'org.telegram.messenger'
                                    }},
                                    body: "initData={enc}"
                                }});
                                return await r.text();
                            }}
                        ''')
                        d2 = json.loads(r2)
                        if d2.get('success'):
                            actions.append('start')
                        
                        # Boost
                        r3 = page.evaluate(f'''
                            async () => {{
                                const r = await fetch("{API}/boost_power.php", {{
                                    method: "POST",
                                    headers: {{
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'X-Requested-With': 'org.telegram.messenger'
                                    }},
                                    body: "initData={enc}"
                                }});
                                return await r.text();
                            }}
                        ''')
                        d3 = json.loads(r3)
                        if d3.get('success'):
                            actions.append('boost')
                    
                    elif mining == 'Inactive':
                        r2 = page.evaluate(f'''
                            async () => {{
                                const r = await fetch("{API}/start_mining.php", {{
                                    method: "POST",
                                    headers: {{
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'X-Requested-With': 'org.telegram.messenger'
                                    }},
                                    body: "initData={enc}"
                                }});
                                return await r.text();
                            }}
                        ''')
                        d2 = json.loads(r2)
                        if d2.get('success'):
                            actions.append('start')
                        
                        r3 = page.evaluate(f'''
                            async () => {{
                                const r = await fetch("{API}/boost_power.php", {{
                                    method: "POST",
                                    headers: {{
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'X-Requested-With': 'org.telegram.messenger'
                                    }},
                                    body: "initData={enc}"
                                }});
                                return await r.text();
                            }}
                        ''')
                        d3 = json.loads(r3)
                        if d3.get('success'):
                            actions.append('boost')
                    
                    # Refresh balance
                    result2 = page.evaluate(f'''
                        async () => {{
                            const r = await fetch("{API}/get_user_data.php?initData={enc}", {{
                                headers: {{
                                    'Accept': 'application/json',
                                    'X-Requested-With': 'org.telegram.messenger'
                                }}
                            }});
                            return await r.text();
                        }}
                    ''')
                    data2 = json.loads(result2)
                    balance_after = float(data2['user']['total_balance'])
                    earned = balance_after - balance
                    
                    acts = ','.join(actions) if actions else 'idle'
                    report.append(f"{name:10s}{balance_after:>8.2f}  {acts}")
                    total_balance += balance_after
                    total_earned += earned
                else:
                    report.append(f"{name:10s} ERROR: {str(data)[:50]}")
            except json.JSONDecodeError:
                report.append(f"{name:10s} NOT JSON: {result[:80]}")
        except Exception as e:
            report.append(f"{name:10s} ERROR: {str(e)[:60]}")

    # Output
    lines = []
    lines.append("```bash")
    lines.append("Gram Network · Cycle Complete")
    lines.append("Engine : CloakBrowser")
    lines.append("─" * 26)
    for line in report:
        lines.append(line)
    lines.append("─" * 26)
    lines.append(f"{'Accounts':10s}{len(ACCOUNTS):>8d}")
    lines.append(f"{'Total':10s}{total_balance:>8.2f}")
    lines.append(f"{'Earned':10s}{total_earned:>+8.2f}")
    lines.append("```")
    print("\n".join(lines))

    browser.close()

if __name__ == '__main__':
    main()
