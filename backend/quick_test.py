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

import random, string
suffix = ''.join(random.choices(string.ascii_lowercase, k=6))
username = f"charlie{suffix}"
print(f"[1] Register {username}")
c, d = req("POST", "/auth/register", {"username": username, "email": f"{username}@example.com","password":"pass123"})
print(f"    -> status={c} {'OK id='+str(d.get('id')) if c==201 else 'ERR: '+str(d)}")

print(f"[2] Login")
c, d = req("POST", "/auth/login", {"username": username, "password":"pass123"})
token = d.get("access_token") if c==200 else None
print(f"    -> token={bool(token)}")

print(f"[3] Create template")
c, d = req("POST", "/tasks/templates", {"title":"Read 10 pages","description":"Reading","category":"habits"}, token=token)
print(f"    -> status={c}, tpl_id={d.get('id')}, max_bid={d.get('max_allowed_bid')}" if c==201 else f"    -> {d}")
tpl_id = d.get("id") if c==201 else None

print(f"[4] Create task WITH template (bid=200)")
body = {"title":"Read 10 pages today","description":"Read books","category":"habits","bid_amount":200}
if tpl_id:
    body["template_id"] = tpl_id
c, d = req("POST", "/tasks/my-tasks", body, token=token)
print(f"    -> status={c}, {'task_id='+str(d.get('id'))+' bid='+str(d.get('bid_amount')) if c==201 else d}")
task_id = d.get("id") if c==201 else None

if not task_id:
    print("[X] Create task WITHOUT template as fallback (bid=150)")
    body2 = {"title":"Another task","description":"no tpl","category":"tests","bid_amount":150}
    c2, d2 = req("POST", "/tasks/my-tasks", body2, token=token)
    print(f"    -> status={c2}, {'task_id='+str(d2.get('id')) if c2==201 else d2}")
    task_id = d2.get("id") if c2==201 else None

print(f"[5] Complete task id={task_id}")
if task_id:
    c, d = req("PUT", f"/tasks/my-tasks/{task_id}/complete", token=token)
    print(f"    -> status={c}, completed={d.get('is_completed') if c==200 else d}")
else:
    print("    -> SKIP")

print(f"[6] Check balance + streak")
c, d = req("GET", "/auth/me", token=token)
if c==200:
    print(f"    -> points={d['points']}, earned={d['total_earned_points']}, streak={d['streak_count']}")
    if task_id:
        print(f"    -> expected: 2000 + (200+20) = 2220 OR 2000+(150+15)=2165")
else:
    print(f"    -> ERR {d}")
