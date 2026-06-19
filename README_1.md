# GRAM NETWORK MINING

### STEP 1 :

## Get Detail User

### STEP 2 :

- Method : GET
- Url : https://app.gramnetwork.online/api/get_user_data.php?{initData}
- Common Request : Query String Parameters
- Common Response : JSON

```bash
{
    "success": true,
    "user": {
        "id": 544603,
        "telegram_id": 5853251704,
        "username": "estqimo",
        "join_by": "1605260429",
        "total_balance": "10.00",
        "usd_balance": "0.00",
        "mining_status": "Ready to Claim",
        "mining_rate": "0.20",
        "yesterday_mining_rate": "0.20",
        "mining_rate_inc": "+0%",
        "mining_power": "20.00",
        "yesterday_mining_power": "20.00",
        "last_login_date": "2026-06-17",
        "mining_power_inc": "+0%",
        "time_left": "00:00:00",
        "progress_percent": "100%",
        "tokens_earned": "0.00",
        "energy": 100,
        "daily_reward": "10.00",
        "claim_in": "00:00:00",
        "total_referrals": "0",
        "bonus_earned": "0.00",
        "mining_start_time": "2026-06-16 21:25:03",
        "last_energy_update": "2026-06-16 21:24:36",
        "last_daily_claim": null,
        "status": "active",
        "task_completed_ids": null,
        "is_notified": 0,
        "mining_end_time": "2026-06-17 01:25:03",
        "last_notified_at": null,
        "ip_address": "103.121.133.133",
        "created_at": "2026-06-16 21:24:36",
        "next_ad_network": "gigapub",
        "last_boost_claim": 0,
        "active_boost_amount": "0.00",
        "session_time_seconds": 14400,
        "time_left_seconds": 0
    },
    "uncompleted_task_count": 29,
    "settings": {
        "mining_hours": 4,
        "daily_reward": "10.00",
        "maintenance": "off",
        "min_send": "50.00",
        "max_send": "500.00"
    },
    "transactions": []
}
```

## Get Avaliable Task

### STEP 3 :

- Method : GET
- Url : https://app.gramnetwork.online/api/get_tasks.php?{initData}
- Common Request : Query String Parameters

```bash
https://app.gramnetwork.online/api/get_tasks.php?initData=user%3D%257B%2522id%2522%253A5853251704%252C%2522first_name%2522%253A%2522Estri%2522%252C%2522last_name%2522%253A%2522Wulandari%2520%25F0%259F%258D%2585%2520%25E2%2596%25AA%25EF%25B8%258F%2522%252C%2522username%2522%253A%2522estqimo%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522photo_url%2522%253A%2522https%253A%255C%252F%255C%252Ft.me%255C%252Fi%255C%252Fuserpic%255C%252F320%255C%252FtE36BAIJiFNvyTp1a9HqSsrvHz5CTjK3m_uJBt1HL2ECDkvfb-x_RpWp_hAucnz5.svg%2522%257D%26chat_instance%3D-3731378210367609137%26chat_type%3Dchannel%26start_param%3D8744073404%26auth_date%3D1781660262%26signature%3DZdrLVAKK04Ed6FwIRg1uWCq11XZVDxWbJSYgaL4FCrri1k_AMZ6BohA5YOML7N24Ibd47YyN8D550glkf1j5CA%26hash%3D023065dd0e783499c2d602c5cf1ff9c5710651f77b617620eebba302d984985f&_t=1781662632867
```

- Common Response :

```bash
{
    "success": true,
    "boost_time_left": 0,
    "next_ad_network": "gigapub",
    "boost_amount": 5,
    "tasks": [
        {
            "id": 76,
            "task_id": "TASK-8DFF260B",
            "title": "Gramnetwork FB Follow & Like",
            "category": "social",
            "type": "others",
            "reward": "0.20",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a31de9dc1792.jpg",
            "link": "https:\/\/www.facebook.com\/share\/1EiuwqMHPw\/",
            "total_complete": 15573,
            "completed_limit": 10000000,
            "is_completed": false
        },
        {
            "id": 75,
            "task_id": "TASK-FB536731",
            "title": "Gramnetwork FB Post & Like share",
            "category": "social",
            "type": "others",
            "reward": "0.15",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a31d8a996ccd.jpg",
            "link": "https:\/\/www.facebook.com\/share\/p\/1CP4TyLd2M\/",
            "total_complete": 16609,
            "completed_limit": 10000000,
            "is_completed": false
        },
        {
            "id": 72,
            "task_id": "TASK-02BA78B4",
            "title": "GRMNetwork_M X Like RT",
            "category": "social",
            "type": "others",
            "reward": "0.15",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a31a0d3817a1.jpg",
            "link": "https:\/\/x.com\/intent\/like?tweet_id=2066962398238646661",
            "total_complete": 51809,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 71,
            "task_id": "TASK-5C96C994",
            "title": "GRMNetwork_M X Like RT",
            "category": "social",
            "type": "others",
            "reward": "0.15",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a312548e5bab.jpg",
            "link": "https:\/\/x.com\/intent\/like?tweet_id=2066828568378880262",
            "total_complete": 95756,
            "completed_limit": 10000000,
            "is_completed": false
        },
        {
            "id": 70,
            "task_id": "TASK-1A8ECECD",
            "title": "Yes Crypto Join",
            "category": "hot",
            "type": "telegram_chat",
            "reward": "0.15",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a3056e1e6fb4.jpg",
            "link": "https:\/\/t.me\/Yes_C_rypto",
            "total_complete": 99726,
            "completed_limit": 10000000,
            "is_completed": false
        },
        {
            "id": 69,
            "task_id": "TASK-0853E87B",
            "title": "Community Crypto Join",
            "category": "hot",
            "type": "telegram_chat",
            "reward": "0.15",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a3044d40c934.jpg",
            "link": "https:\/\/t.me\/Community_Crypto_1",
            "total_complete": 93645,
            "completed_limit": 10000000,
            "is_completed": false
        },
        {
            "id": 68,
            "task_id": "TASK-C1049CF2",
            "title": "Gramnetwork FB Video Watching & Like share",
            "category": "social",
            "type": "others",
            "reward": "0.15",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2fea1a80b5b.jpg",
            "link": "https:\/\/www.facebook.com\/share\/v\/1DFgoeWt3g\/",
            "total_complete": 137823,
            "completed_limit": 10000000,
            "is_completed": false
        },
        {
            "id": 67,
            "task_id": "TASK-CF168B4E",
            "title": "GRMNetwork_M X Like RT",
            "category": "social",
            "type": "others",
            "reward": "0.15",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2e95750c06e.jpg",
            "link": "https:\/\/x.com\/intent\/like?tweet_id=2066124601671987558",
            "total_complete": 182803,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 66,
            "task_id": "TASK-A58EFB0C",
            "title": "Gramnetwork YT Video Watching & Like",
            "category": "social",
            "type": "others",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2dae49c06f0.jpg",
            "link": "https:\/\/youtu.be\/3n94A5Y-uPE?si=3afGPfE6KX5XRbPs",
            "total_complete": 176353,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 65,
            "task_id": "TASK-CB4786D7",
            "title": "Zoom Crypto Join",
            "category": "social",
            "type": "telegram_chat",
            "reward": "0.15",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2d98fb37fff.jpg",
            "link": "https:\/\/t.me\/zoomcrypto_24",
            "total_complete": 114505,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 63,
            "task_id": "TASK-DAE10A6E",
            "title": "Gramnetwork FB Video Watching & Like share",
            "category": "social",
            "type": "others",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2c60cb694ee.jpg",
            "link": "https:\/\/www.facebook.com\/share\/v\/1AYemViXC7\/",
            "total_complete": 158641,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 61,
            "task_id": "TASK-50A87A7B",
            "title": "Gramnetwork YT Video Watching & Like",
            "category": "social",
            "type": "others",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2c26baf3628.jpg",
            "link": "https:\/\/youtube.com\/shorts\/c8ZDJ9YkjRc?si=mV3AOHeqM0_Q0l_D",
            "total_complete": 152714,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 60,
            "task_id": "TASK-8BB88E1D",
            "title": "Gramnetwork YT Subscribe on",
            "category": "social",
            "type": "others",
            "reward": "0.20",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2c2632c0bf5.jpg",
            "link": "https:\/\/www.youtube.com\/@GramnetworkGRM",
            "total_complete": 158379,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 59,
            "task_id": "TASK-DC4F070E",
            "title": "GRMNetwork_M X Like RT",
            "category": "hot",
            "type": "others",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2ae644dd232.jpg",
            "link": "https:\/\/x.com\/intent\/like?tweet_id=2065111202104271354",
            "total_complete": 161260,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 58,
            "task_id": "TASK-C22E9C1B",
            "title": "Gramnetwork GHs Any Votes",
            "category": "hot",
            "type": "telegram_chat",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2ac97ba8281.jpg",
            "link": "https:\/\/t.me\/Gramnetworkminiapp\/23",
            "total_complete": 116817,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 57,
            "task_id": "TASK-2B2AC270",
            "title": "GRMNetwork Boost Now",
            "category": "hot",
            "type": "others",
            "reward": "1.00",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a29aede33c17.jpg",
            "link": "https:\/\/t.me\/boost\/Gramnetworkminiapp",
            "total_complete": 166593,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 56,
            "task_id": "TASK-9179B48F",
            "title": "GRMNetwork_M X Like RT",
            "category": "social",
            "type": "others",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a29ae821c422.jpg",
            "link": "https:\/\/x.com\/intent\/like?tweet_id=2064775994104521197",
            "total_complete": 150489,
            "completed_limit": 100000,
            "is_completed": false
        },
        {
            "id": 55,
            "task_id": "TASK-9973AFDF",
            "title": "GRMNetwork_M X Like RT",
            "category": "social",
            "type": "others",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a29421ba1d25.jpg",
            "link": "https:\/\/x.com\/intent\/like?tweet_id=2064659575522148674",
            "total_complete": 153355,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 54,
            "task_id": "TASK-D481F88A",
            "title": "GRMNetwork_M X Like RT",
            "category": "social",
            "type": "others",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2814baa578d.jpg",
            "link": "https:\/\/x.com\/intent\/like?tweet_id=2064332602719482214",
            "total_complete": 153280,
            "completed_limit": 100000,
            "is_completed": false
        },
        {
            "id": 53,
            "task_id": "TASK-DCB65457",
            "title": "Ton_keeper Join",
            "category": "social",
            "type": "others",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a272feab7bbb.jpg",
            "link": "https:\/\/play.google.com\/store\/apps\/details?id=com.ton_keeper",
            "total_complete": 159308,
            "completed_limit": 100000,
            "is_completed": false
        },
        {
            "id": 52,
            "task_id": "TASK-A54917CE",
            "title": "OKX_WALLET_BOT Join",
            "category": "bot",
            "type": "telegram_bot",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2728c93f2b8.jpg",
            "link": "https:\/\/t.me\/OKX_WALLET_BOT",
            "total_complete": 158591,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 51,
            "task_id": "TASK-02EB48CC",
            "title": "BitgetWallet Join",
            "category": "bot",
            "type": "telegram_bot",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a27280cbd282.jpg",
            "link": "https:\/\/t.me\/BitgetWallet_TGBot\/BGW?startapp=home-48pESroYZF84Vp6rZne1Uj4vTpCXQvS4BtE4",
            "total_complete": 157831,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 50,
            "task_id": "TASK-97C4E6ED",
            "title": "MyTonWallet Bot Join",
            "category": "bot",
            "type": "telegram_bot",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a272739c7e31.jpg",
            "link": "https:\/\/t.me\/MyTonWalletBot",
            "total_complete": 156366,
            "completed_limit": 10000000,
            "is_completed": false
        },
        {
            "id": 49,
            "task_id": "TASK-7194CF96",
            "title": "BitgetOfficial Bot Join",
            "category": "bot",
            "type": "telegram_bot",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a27266da5224.jpg",
            "link": "https:\/\/t.me\/BitgetOfficialBot",
            "total_complete": 156871,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 48,
            "task_id": "TASK-AA14AFA0",
            "title": "Crypto Bot Join",
            "category": "bot",
            "type": "telegram_bot",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2725efdbb9e.jpg",
            "link": "https:\/\/t.me\/CryptoBot",
            "total_complete": 158107,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 47,
            "task_id": "TASK-DD05BA7A",
            "title": "Cwallet Join",
            "category": "hot",
            "type": "others",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a2725b79643f.jpg",
            "link": "https:\/\/cwallet.com\/referralweb\/6lcfyqeE?type=signup",
            "total_complete": 153816,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 46,
            "task_id": "TASK-9764B419",
            "title": "GRMNetwork_M Like RT",
            "category": "social",
            "type": "others",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a271e8ab41a3.jpg",
            "link": "https:\/\/x.com\/intent\/like?tweet_id=2064072421955744197",
            "total_complete": 151343,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 45,
            "task_id": "TASK-661E44E2",
            "title": "Gramnetwork officially channel Join",
            "category": "hot",
            "type": "telegram_chat",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a26ed6752b2c.jpg",
            "link": "https:\/\/t.me\/Gramnetworkminiapp",
            "total_complete": 115075,
            "completed_limit": 1000000,
            "is_completed": false
        },
        {
            "id": 44,
            "task_id": "TASK-D998D362",
            "title": "GRMNetwork_M X Like RT Go",
            "category": "social",
            "type": "others",
            "reward": "0.10",
            "image_url": "https:\/\/app.gramnetwork.online\/admin\/uploads\/tasks\/task_6a26ecb3a0099.jpg",
            "link": "https:\/\/x.com\/GRMNetwork_M\/status\/2063668495850823901?s=20",
            "total_complete": 156228,
            "completed_limit": 1000000,
            "is_completed": false
        }
    ]
}
```

## Claim Task

### STEP 5 :

- Method : POST
- Url : https://app.gramnetwork.online/api/complete_task.php
- Common Request : Form Data

```bash
{InitData}&task_id={task_id}
```

- Common Response :

```bash
{
    "success": true,
    "message": "Task completed successfully",
    "reward": 0.2,
    "new_balance": "11.00"
}
```

## Start Mining

### STEP 5 :

- Method : POST
- Url : https://app.gramnetwork.online/api/start_mining.php
- Common Request : Form Data

```bash
{initData}
```

- Response :

```bash
{"success":true,"message":"Mining started!"}
```

## Claim Mining

### STEP 6 :

- Method : POST
- Url : https://app.gramnetwork.online/api/claim_mining.php
- Common Request : Form Data

```bash
{initData}
```

- Response :

```bash
{"success":true,"message":"Reward claimed successfully!"}
```

# Work Flow

```bash
Ambil data dari .env dengan format user=xxxxxxxx,

```

# gram-network
