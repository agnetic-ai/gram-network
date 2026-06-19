# 🤖 AI Agent Execution Specification: Gram Network Miner

This document serves as a strict operational runtime specification for the Autonomous AI Agent. The Agent must read, parse, and execute the following loop logic based on system states.

---

## 📋 System Prerequisites

### 1. Environment Variables (`.env`)

The Agent must ensure the availability of the following key before starting the loop:

- `RAW_INIT_DATA`: Raw URL-encoded Telegram WebApp initialization string.

### 2. Runtime Behavior Rules

- **Decoupled Authentication**: The Agent must parse `RAW_INIT_DATA` and apply `decodeURIComponent()` before embedding it into any request payload.
- **Anti-Detection Delay**: The Agent **MUST** inject a random delay of `5,000ms` to `12,000ms` between sequential Task Executions to mimic human-like behavior.
- **Network Resilience**: If a Request fails due to network filtering (e.g., FortiGate Web Filter / 403 Forbidden), the Agent must sleep for `300,000ms` (5 minutes) and retry via alternative routing (VPN/Proxy).

---

## 🔄 Autonomous Loop Logic (State Machine)

The Agent must operate in an infinite loop (`while (true)`), executing the following steps sequentially:

### Step 1: State Retrieval (`GET /api/get_user_data.php`)

Fetch current profile metrics. The Agent must analyze the JSON response properties:

1.  Check `user.mining_status`.
2.  Check `user.time_left_seconds`.
3.  Check `uncompleted_task_count`.

### Step 2: Decision Tree Matrix

| Current Condition (State)                              | Target Endpoint (Action)     | Payload Format                             | Expected Success Outcome                        |
| :----------------------------------------------------- | :--------------------------- | :----------------------------------------- | :---------------------------------------------- |
| `user.mining_status == "Ready to Claim"`               | `POST /api/claim_mining.php` | Form Data: `initData={decoded_string}`     | Proceed to **Start Mining** action immediately. |
| After Successful Claim OR `mining_status == "Claimed"` | `POST /api/start_mining.php` | Form Data: `initData={decoded_string}`     | Server resets `time_left_seconds` to `14400`.   |
| `uncompleted_task_count > 0`                           | `GET /api/get_tasks.php`     | Query Params: `initData` & `_t=Date.now()` | Parse `tasks` array. Proceed to **Step 3**.     |

### Step 3: Task Processing Loop

If `get_tasks.php` returns an array of tasks, the Agent must filter and process them:

- **Condition**: Evaluate each task object where `is_completed == false`.
- **Action**: Send `POST /api/complete_task.php`.
- **Payload**: Form Data -> `initData={decoded_string}&task_id={task.id}`.
- **Throttling**: Apply the Anti-Detection Delay after every task submission.

### Step 4: Sleep / Dynamic Hibernation

After executing all eligible actions in Steps 2 & 3, the Agent must calculate its next wake-up time:

- If `user.time_left_seconds > 0`: Sleep for `user.time_left_seconds` + `60 seconds` (buffer).
- If any API throws an unhandled error: Sleep for `60 seconds` (Cool-off period) before re-evaluating Step 1.

---

## 🚨 Expected API Responses for Validation

### Successful User Fetch Summary

```json
{
  "success": true,
  "user": { "mining_status": "Ready to Claim", "time_left_seconds": 0 },
  "uncompleted_task_count": 29
}
```
