Berikut adalah file **`README_AGENT.md`** utuh yang sudah menggabungkan seluruh instruksi dari awal hingga fitur mutakhir (_multiple accounts, random User-Agent, filter category social_, jeda 2-5 detik, dan otomatisasi _boost_).

Silakan buat file baru bernama **`README_AGENT.md`** di dalam folder proyek kamu, lalu _copy-paste_ seluruh isi di bawah ini:

````markdown
# 🤖 AI Agent Execution Specification: Gram Network Multi-Account Miner

This document serves as a strict operational runtime specification for the Autonomous AI Agent. The Agent must read, parse, and execute the following loop logic to manage **multiple accounts** securely and efficiently.

---

## 📋 System Prerequisites

### 1. Multi-Account Environment Structure (`.env`)

The Agent must support multiple sessions. Accounts must be stored in the `.env` file using a structured naming convention split by the double-pipe (`||`) delimiter:

```env
# Format: ACCOUNTS=token_akun_1||token_akun_2||token_akun_3
ACCOUNTS=user%3D%257B%2522id%2522%253A5853...||user%3D%257B%2522id%2522%253A6102...
```
````

### 2. Strict Operational Rules

- **Rotation**: The Agent must process accounts sequentially (Account 1 ➔ Account 2 ➔ Account N) inside the main execution cycle.
- **Randomized Fingerprinting**: For _every_ account swap, the Agent **MUST** generate and assign a fresh, randomized mobile/desktop `User-Agent` string from a predefined list to prevent account linking.
- **Targeted Task Filter**: The Agent **MUST ONLY** process tasks where the property `category == "social"`. All other categories (e.g., "hot", "bot") must be completely ignored.
- **Anti-Detection Delay**: The Agent **MUST** inject a random sleep delay of **2 to 5 seconds** (`2000ms` - `5000ms`) immediately after completing each individual social task.
- **Network Resilience**: If an endpoint returns a network-level restriction (e.g., 403 Forbidden / FortiGate Block), the Agent must hibernate for 5 minutes and alert the operator.

---

## 🔄 Autonomous Loop Logic (Multi-Account State Machine)

The Agent must run an infinite loop, executing the following sub-routine for **each account** defined in the system:

```text
[ For Each Account ] ──▶ [ Assign Random User-Agent ] ──▶ [ GET get_user_data.php ]
                                                                   │
 ┌─────────────────────────────────────────────────────────────────┘
 │
 ├──▶ State: mining_status == "Ready to Claim"
 │       │
 │       ▼
 │   [ POST claim_mining.php ] ──▶ [ POST start_mining.php ] ──▶ [ POST boost_power.php ]
 │                                                                           │
 └───────────────────────────────────────────────────────────────────────────┤
                                                                             ▼
                                                                  [ GET get_tasks.php ]
                                                                             │
                                                                             ▼
                                                                Filter: category == "social"
                                                                & is_completed == false
                                                                             │
                                                                             ▼
                                                                 [ Loop Completed Tasks ]
                                                                             │
                                                                             ▼
                                                                  [ Sleep 2-5 Seconds ]

```

### Detailed Sequential Actions per Account:

1. **Initialize Profile**: Rotate to the next account token and rotate the `User-Agent`. Decode the current token payload using `decodeURIComponent()`.
2. **State Retrieval**: Fetch profile data from `GET /api/get_user_data.php?initData={decoded_token}`.
3. **Mining Execution Pipeline**:

- If `user.mining_status == "Ready to Claim"`, execute `POST /api/claim_mining.php`.
- Immediately after a successful claim, execute `POST /api/start_mining.php` to restart the 4-hour cycle.
- **Crucial Step**: Right after starting the mining session, the Agent **MUST** hit `POST /api/boost_power.php` to maximize mining power for that account session.

4. **Filtered Task Clearance**:

- Request the task list from `GET /api/get_tasks.php?initData={decoded_token}&_t={timestamp}`.
- Iterate through the `tasks` array.
- **Condition**: If `task.category == "social"` AND `task.is_completed == false`, trigger `POST /api/complete_task.php` with the payload `initData={decoded_token}&task_id={task.id}`.
- **Throttling**: Apply a random cooldown sleep between **2 and 5 seconds** before moving to the next eligible social task.

5. **Dynamic Hibernation**: After all accounts have been processed, find the minimum `time_left_seconds` among all accounts and sleep the entire process for that duration + `60 seconds` buffer.

---

## 📡 Endpoint API Specifications

### 1. Get Detail User

- **Method**: `GET`
- **URL**: `https://app.gramnetwork.online/api/get_user_data.php`

### 2. Get Available Task

- **Method**: `GET`
- **URL**: `https://app.gramnetwork.online/api/get_tasks.php`

### 3. Claim Task

- **Method**: `POST`
- **URL**: `https://app.gramnetwork.online/api/complete_task.php`
- **Payload (Form Data)**: `initData={decoded_string}&task_id={task_id}`

### 4. Start Mining

- **Method**: `POST`
- **URL**: `https://app.gramnetwork.online/api/start_mining.php`
- **Payload (Form Data)**: `initData={decoded_string}`

### 5. Claim Mining

- **Method**: `POST`
- **URL**: `https://app.gramnetwork.online/api/claim_mining.php`
- **Payload (Form Data)**: `initData={decoded_string}`

### 6. Boost Power

- **Method**: `POST`
- **URL**: `https://app.gramnetwork.online/api/boost_power.php`
- **Payload (Form Data)**: `initData={decoded_string}`

---

## 🚨 Expected JSON Structures for Validation

### User Data Response Example

```json
{
  "success": true,
  "user": {
    "username": "estqimo",
    "mining_status": "Ready to Claim",
    "time_left_seconds": 0
  },
  "uncompleted_task_count": 29
}
```

### Task Filtration Target Example

```json
{
  "id": 76,
  "task_id": "TASK-8DFF260B",
  "title": "Gramnetwork FB Follow & Like",
  "category": "social",
  "is_completed": false
}
```

---

## 🛠️ Instructions for LLM/Agent Parser

1. Isolate each account's memory space; do not leak headers from Account A into Account B's requests.
2. Do not attempt to complete a task if its category is not explicitly `"social"`.
3. Log execution with account indices: `[ACCOUNT #1] [TASK-ID: 76] [STATUS: SUCCESS]`.

```

```
