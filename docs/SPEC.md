# myTaskBet — Product & Technical Specification

> Living document. Source: product interviews (2026).  
> **MVP focus:** React Native Android → validate gameplay → Google Play.  
> VK Mini Apps / Yandex — later, separate web clients on the same API.

---

## 1. Vision

Mobile habit/task app for **important daily/weekly/monthly commitments**, not full-day planners.

**Core loop:** reserve stake → complete or fail by day rules → balance + statistics + social funds.

**Motivation:**

- Personal **balance** (stakes and bonuses)
- **Achievement points** (unlock slots)
- **Fund contributions** (+1 per success) for group/clan/global events and popularity
- Rankings (week / month / all-time)
- Optional **real-money top-ups** (1 unit = 1 ₽ at checkout; starter 2000 is virtual grant)

Excel/Google Sheets prototype is **deprecated** — no import/export.

---

## 2. Platforms & stack

| Layer | Choice | Notes |
|-------|--------|--------|
| Mobile | **React Native 0.73** (`myTaskBet/`) | Portrait phone only, single column, no desktop adaptive layout |
| API | **FastAPI** + SQLite (`backend/`) | JWT auth; refactor to match this spec |
| Play Store | Android build from `myTaskBet` | First release target |
| VK | **Later** — React + VKUI mini app | Same REST API; [VK Mini Apps](https://dev.vk.com/mini-apps) is web, not RN |
| Yandex | **Later** — product-dependent | Usually web/iframe, not shared RN binary |

**Repo layout:** active app in `myTaskBet/`; root `package.json` is legacy — ignore for builds.

**Implementation order (agreed):**

1. Align backend with spec (economy, funds, no loser-bank)
2. Wire RN to API: auth, day view, task cards, complete/fail, morning summary stub
3. Run on device/emulator, iterate UX
4. Google Play internal testing
5. Social/events/book club — phased after core day loop works

---

## 3. Terminology (UI Russian)

| Internal | User-facing | Purpose |
|----------|-------------|---------|
| `balance` | **Баланс** | Stakes 20/50/100, clan entry fee, IAP top-up |
| `fund_unit` | **Вклад** (in fund) | +1 per full success to template/group/clan funds |
| `achievement_points` | **Очки достижений** | 1/3/5 by grade → **one shop** (task slots OR group slots) |

Do not use «монетки» for everything — avoid confusing balance with fund units.

---

## 4. Economy

### 4.1 Starting balance

- New user: **2000** balance units (game grant, not “2000 ₽ gifted” in UI).

### 4.2 Task difficulty (grade)

| Grade | Auto stake | Success bonus (% of stake) | Achievement points |
|-------|------------|----------------------------|--------------------|
| Easy | **20** | **5%** | **1** |
| Medium | **50** | **10%** | **3** |
| Hard | **100** | **15%** | **5** |

- User **does not enter stake** — only selects grade (and period, template, etc.).
- **No auction**, no ±10% average bid, no fractional bid tuning.

### 4.3 Reserve

- On **activation** of a task instance (per period): **reserve** stake on balance.
- **Daily:** reserve for **that day only** — “live one day at a time”, no prepay for whole series.
- **Weekly / monthly:** reserve for **current period** when period starts.

### 4.4 Outcomes

| Outcome | Balance | «Поощрения» (lifetime earned bonuses) | «Потери» (lifetime lost stakes) | Achievement | Fund +1 |
|---------|---------|----------------------------------------|----------------------------------|-------------|---------|
| **Success** | Return N + bonus | +bonus only (not return of N) | — | +1/3/5 | Yes (see §6) |
| **Fail** | N burned | — | +N | 0 | 0 |
| **~80%** (measurable tasks only) | Lose 50% N, return 50% N | 0 | +50% N | 0 | 0 |

- **80%** counts as **not completed** for achievements and ratings logic.
- Bonus on 80%: **TBD** (default: no bonus).

### 4.5 IAP (balance top-up)

At payment: **1 unit = 1 ₽** (show ₽ only on payment screen).

| Pack | Price (draft) |
|------|----------------|
| 100 units | 100 ₽ |
| 500 units | 399 ₽ |
| 1000 units | 699 ₽ |

Optional micro-pack later (e.g. 49 ₽ → 50 units).  
Also: **₽ slot packs** (e.g. +2 daily ~99 ₽) — parallel to achievement shop.

---

## 5. Process of day

### 5.1 Close mode (per task or profile)

- **Midnight:** auto-close open instances; no user action → **fail** (full stake loss).
- **Manual close:** day ends when user closes (midnight still applies if hybrid added later).

### 5.2 Morning hit (next app open)

1. **Summary screen for yesterday:** bonuses earned, stakes lost, task counts.
2. **Cards** per task (short).
3. **Bubbles** for auto-failed tasks: “Did you do it but forget to tap?” → **Success / 80% (if type allows) / Confirm fail**.
4. User may **dispute** yesterday’s fails → recalc balance and stats (rules/deadlines v1.1).

**Task types:**

- **Binary** (e.g. pushups): no 80%, optional no bubble.
- **Measurable** (pages read): 80% allowed.

### 5.3 Postpone

- **Daily:** no “move to tomorrow”.
- **Weekly/monthly:** shift later with **reason** text; paid/half-stake postpone — **v2**.

---

## 6. Funds & events (no loser bank)

### 6.1 Removed

- ~~Failed stakes → global loser bank~~
- ~~Auto `distribute-rewards` to top users by points~~

### 6.2 Fund unit (+1 model)

On **full success only:**

| Destination | Rule |
|-------------|------|
| **Template global fund** | Always **+1** to **this task template’s** fund (popularity + event budget for that template) |
| **Group fund** | +1 if user is in a **group** and task matches group theme |
| **Circle (friends) fund** | +1 if user is in a **circle** — **any** task, any grade (still +1 only, not 1/3/5) |

**Interests/spheres** (literature, sport, habits): **catalog navigation only** — do not gate global +1.

**Spend events:** take **slice** of fund (e.g. 10–30%, cap), not necessarily drain entire pool. Remainder keeps accumulating (e.g. 25 001 → spend 20 000 → **5 001** left).

### 6.3 Event types (phased)

- **Global / template-scoped** — e.g. book club when reading template fund ≥ threshold
- **Group** — interest communities
- **Circle** — creator runs events; entry fees (10–50, leader sets) boost circle fund; popular formats may be promoted to global (moderated)

**First flagship event (post-MVP):** monthly **book club** — propose/vote book (reading achievements gate), read month, photo of page, moderation.

### 6.4 Clan/circle entry fee

- Deduct from **balance**; insufficient → cannot join.
- Default **10**, leader **10–50** → **circle common fund** (+ counts toward member contribution ranking).

---

## 7. Slots & monetization

### 7.1 Free tier (active tasks)

| Period | Slots |
|--------|-------|
| Daily | **3** |
| Weekly | **1** |
| Monthly | **1** |

### 7.2 Social slots

| Entity | Limit | Unlock |
|--------|-------|--------|
| **Group** | Start **1 group free** (motivate community) | More groups: **achievement shop** (ladder) and/or ₽ — same **single shop** as task slots |
| **Circle (friends)** | **1** circle | Creation/join after achievement thresholds + entry fee |

**Achievement shop:** spend points on **one** of (sequential choice, each branch has ladder):

- +1 daily slot
- +1 weekly slot
- +1 monthly slot
- +1 **group** slot  

Draft ladder (daily): **50 → 85 → 130 → …**; weekly/monthly/group — higher steps (see product chat).

### 7.3 Draft tasks

When slot limit reached: save **full draft** (grey, inactive, **no reserve**) until slot unlocked or task deactivated.

### 7.4 No subscription

Only free limits + ₽ packs + achievement shop.

---

## 8. Community content

- ~**70%** tasks from **templates** (catalog by sphere).
- **New public templates:** moderation — **admin first**, paid moderators later; until approved, template private to author.
- **Rankings** (each: **week / month / all-time**):
  - Daily / weekly / monthly completions
  - Achievement points earned
  - Bonuses earned (“poощрения”)
  - Stakes lost
  - Event participation (later)
  - In-circle contribution (+1 counts)

**Profile:** achievement showcase badges (e.g. “3 days no smoking”) — streak rules **v2** (not necessarily consecutive).

---

## 9. UX (mobile portrait)

**Recommended MVP layout: A + E**

- Top: profile icon, **balance · вклад today · achievement points**
- Tabs: **Вчера | Сегодня | Завтра**
- Morning banner on relevant days
- **Task cards** (rounded rects, one column): title, grade, stake; actions **Done / Not done**; tap → **modal/bottom sheet** (details, Success / 80% / Fail, selects for period & close mode)
- Bottom nav (**4**): **День · Каталог · Сообщество · Профиль**

Wireframes: `canvases/mytaskbet-ux-variants.canvas.tsx` (variants A–E).

---

## 10. API / data model — migration notes

Current backend (`backend/fastapi_app/`) gaps vs spec:

| Current | Target |
|---------|--------|
| `complete`: +10% flat | Grade-based 5/10/15% |
| `fail`: stake → `Bank` | Fail: personal loss only; optional remove bank deposit |
| `max_allowed_bid`, bid history averages | **Remove** user bid input; fixed grade stakes |
| `task_slots: 10` single field | `slots_daily/weekly/monthly`, group slots, circle membership |
| Single currency feel | `balance`, `achievement_points`, fund tables per template/group/circle |
| RN `TaskService` → local storage mismatch | Full API client + auth + day UI |

Suggested new/updated entities (names draft):

- `User`: balance, bonus_total, loss_total, achievement_points, slot counters, profile
- `TaskTemplate`: sphere, grade default, fund_balance, completion_count
- `UserTaskInstance`: date/period, status, reserved_amount, close_mode
- `Group`, `Circle`, membership, fund_balance
- `FundTransaction` / event records

---

## 11. MVP scope checklist

**In MVP:**

- [ ] Auth register/login
- [ ] Fixed grade stakes & reserve/settle
- [ ] Success / fail (+ optional 80% flag on types)
- [ ] Header stats (balance, bonuses/losses totals)
- [ ] Today list + task modal
- [ ] Yesterday summary + simple “confirm fail / mark done” bubbles
- [ ] Template catalog (minimal seed list)
- [ ] Per-template fund +1 on success (display only ok for v0)

**Post-MVP:**

- Groups/circles chat, entry fees, events, book club
- Achievement shop & ₽ IAP
- Rankings all periods
- Moderation queue
- VK mini app

---

## 12. Open decisions (non-blocking)

- Bonus formula on 80% success
- Exact event spend % and caps
- Achievement bonus +2/+5 for weekly/monthly completions
- Max groups/circles after unlocks
- IAP slot pricing final numbers

---

## 13. References

- Product design sessions (chat archive)
- Legacy spreadsheet “Планировщик” — **reference only**, superseded by this spec
- Backend entry: `backend/fastapi_app/main.py`
- Mobile entry: `myTaskBet/App.tsx`
