import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import urllib.request
import urllib.error
import json

BASE = "http://localhost:8000/api"

def req(method, path, body=None, token=None):
    url = BASE + path
    data = json.dumps(body).encode("utf-8") if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    rq = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(rq) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body_err = e.read().decode("utf-8", errors="replace")
        try:
            return e.code, json.loads(body_err)
        except Exception:
            return e.code, {"raw": body_err}
    except Exception as e:
        return 0, {"error": str(e)}

def show(label, code, data):
    ok = 200 <= code < 300
    sym = "OK" if ok else "ERR"
    print(f"[{sym}] {label} (status={code})")
    if isinstance(data, dict):
        for k, v in list(data.items())[:8]:
            if isinstance(v, list):
                print(f"   {k}: list[{len(v)}]")
                for i, item in enumerate(v[:5]):
                    if isinstance(item, dict):
                        short = {kk: vv for kk, vv in item.items() if kk in ('id','username','title','value','rank_position','points','is_completed','bid_amount','streak_count')}
                        print(f"      [{i}] {short}")
                    else:
                        print(f"      [{i}] {item}")
            else:
                print(f"   {k}: {v}")
    elif isinstance(data, list):
        print(f"   list[{len(data)}]")
        for i, item in enumerate(data[:5]):
            if isinstance(item, dict):
                short = {kk: vv for kk, vv in item.items() if kk in ('id','username','title','value','rank_position','points','is_completed','bid_amount','streak_count')}
                print(f"   [{i}] {short}")
            else:
                print(f"   [{i}] {item}")
    else:
        print(f"   {data}")
    print()

print("=" * 60)
print("=== 1. REGISTER ===")
c, d = req("POST", "/auth/register", {"username":"bob","email":"bob@example.com","password":"pass123"})
show("Register bob", c, d)
uid = None
if c == 201:
    uid = d.get("id")

print("=== 2. LOGIN ===")
c, d = req("POST", "/auth/login", {"username":"bob","password":"pass123"})
show("Login bob", c, d)
token = None
if c == 200:
    token = d.get("access_token")
    print(f"   token length = {len(token)}")
print()

print("=== 3. GET /auth/me ===")
c, d = req("GET", "/auth/me", token=token)
show("Me", c, d)

print("=== 4. CREATE TASK TEMPLATE ===")
c, d = req("POST", "/tasks/templates", {"title":"Run 3km","description":"Morning run","category":"habits"}, token=token)
show("Create template", c, d)
tpl_id = d.get("id") if c == 201 else None

print("=== 5. GET TASK TEMPLATES ===")
c, d = req("GET", "/tasks/templates", token=token)
show("List templates", c, d)

print("=== 6. CREATE USER TASK (bid=100) ===")
body = {"title":"Run 3km today","description":"Daily challenge","category":"habits","bid_amount":100}
if tpl_id:
    body["template_id"] = tpl_id
c, d = req("POST", "/tasks/my-tasks", body, token=token)
show("Create user task", c, d)
task_id = d.get("id") if c == 201 else None

print("=== 7. GET MY TASKS ===")
c, d = req("GET", "/tasks/my-tasks", token=token)
show("My tasks", c, d)

print("=== 8. COMPLETE TASK ===")
if task_id:
    c, d = req("PUT", f"/tasks/my-tasks/{task_id}/complete", token=token)
    show(f"Complete task {task_id}", c, d)
else:
    print("[SKIP] no task id")
print()

print("=== 9. BALANCE AFTER COMPLETE ===")
c, d = req("GET", "/auth/me", token=token)
show("Me (after complete)", c, d)
if c == 200:
    expected = 2000 + 100 + 10  # initial + bid back + 10% reward
    print(f"   Expected points (approx): {expected}, actual: {d.get('points')}")
print()

print("=== 10. BANK INFO ===")
c, d = req("GET", "/bank/", token=token)
show("Bank info", c, d)

print("=== 11. BANK STATUS ===")
c, d = req("GET", "/bank/status", token=token)
show("Bank status", c, d)

print("=== 12. UPDATE RANKINGS ===")
c, d = req("GET", "/rankings/update", token=token)
show("Update rankings", c, d)

print("=== 13. LEADERBOARD (POINTS) ===")
c, d = req("GET", "/rankings/leaderboard/points")
show("Leaderboard points", c, d)

print("=== 14. MY RANKINGS ===")
c, d = req("GET", "/rankings/my", token=token)
show("My rankings", c, d)

print("=== 15. FAIL TEST: create + fail task ===")
body2 = {"title":"Will fail this","description":"on purpose","category":"tests","bid_amount":50}
c2, d2 = req("POST", "/tasks/my-tasks", body2, token=token)
if c2 == 201:
    tid2 = d2.get("id")
    c3, d3 = req("PUT", f"/tasks/my-tasks/{tid2}/fail", token=token)
    show(f"Fail task {tid2}", c3, d3)
    c4, d4 = req("GET", "/auth/me", token=token)
    show("Me (after fail)", c4, d4)
else:
    show("Create 2nd task", c2, d2)
print()
print("=== DONE ===")
