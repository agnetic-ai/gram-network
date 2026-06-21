#!/usr/bin/env python3
"""Gram Network — Boost Energy (all accounts, every 125 min)"""
import json, os, sys, urllib.parse, urllib.request, time

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


def api_get(endpoint, encoded_token):
    url = f"{API}/{endpoint}?initData={encoded_token}"
    req = urllib.request.Request(url, headers={
        'Accept': 'application/json',
        'X-Requested-With': 'org.telegram.messenger'
    })
    resp = urllib.request.urlopen(req, timeout=15)
    return json.loads(resp.read())


def api_post(endpoint, encoded_token):
    url = f"{API}/{endpoint}"
    data = f"initData={encoded_token}".encode()
    req = urllib.request.Request(url, data=data, method='POST', headers={
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'org.telegram.messenger'
    })
    resp = urllib.request.urlopen(req, timeout=15)
    return json.loads(resp.read())


def main():
    accounts = load_accounts()
    if not accounts:
        print("ERROR: no accounts in .env")
        sys.exit(1)

    report = []
    boosted = 0
    failed = 0

    for name, raw in accounts:
        enc = encode_token(raw)
        try:
            # Get current energy + cooldown
            user_data = api_get("get_user_data.php", enc)
            u = user_data.get('user', {})
            energy = u.get('energy', '?')
            cooldown = u.get('energy_boost_time_left', 0)

            # Try boost
            r = api_post("boost_energy.php", enc)
            success = r.get('success', False)
            msg = r.get('message', '')

            if success:
                boosted += 1
                report.append(f"{name:12s} E:{energy:>3}  BOOST OK  +10")
            else:
                failed += 1
                cd_min = int(cooldown) // 60 if isinstance(cooldown, int) else '?'
                report.append(f"{name:12s} E:{energy:>3}  WAIT {cd_min}m")

        except Exception as e:
            failed += 1
            report.append(f"{name:12s} ERROR: {str(e)[:40]}")

        time.sleep(1)

    lines = []
    lines.append("Gram Network · Energy Boost")
    lines.append("─" * 32)
    for line in report:
        lines.append(line)
    lines.append("─" * 32)
    lines.append(f"Boosted: {boosted}  Wait: {failed}  Accts: {len(accounts)}")
    print("\n".join(lines))


if __name__ == '__main__':
    main()
