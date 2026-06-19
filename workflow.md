# 🔄 Gram Network Automation Workflow

Dokumentasi logis alur eksekusi skrip untuk mengotomatisasi klaim mining dan penyelesaian tugas (_tasks_) secara berkala.

---

## 📈 Diagram Alur Logika

```text
       [ Start Script ]
               │
               ▼
   [ Baca .env & Decode initData ]
               │
               ▼
    [ GET /get_user_data.php ]
               │
               ├─────────────────────────────────────────┐
               ▼                                         ▼
     { Cek mining_status }                      { Cek uncompleted_task_count }
               │                                         │
       ┌───────┴───────┐                                 ▼
       ▼               ▼                        [ GET /get_tasks.php ]
[Ready to Claim]    [Mining/Running]                     │
       │               │                                 ▼
       ▼               │                    Looping setiap task yang ada:
[ POST /claim_mining ] │                    Jika "is_completed": false
       │               │                                 │
       ▼               ▼                                 ▼
[ POST /start_mining ] ──▶ [ Idle / Sleep 4 Jam ] ◀── [ POST /complete_task.php ]
```
