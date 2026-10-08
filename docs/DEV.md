# Local development (MVP)

## Backend

```powershell
cd d:\OSPanel\home\mytaskbet\backend
.\venv\Scripts\activate
python main.py
```

API: http://127.0.0.1:8000 — docs at http://127.0.0.1:8000/docs

Database: `backend/taskbet.db` (SQLite). Schema auto-updates on startup via `bootstrap_schema()`.

## Mobile (Android emulator)

```powershell
cd d:\OSPanel\home\mytaskbet\myTaskBet
npm install
npm start
# other terminal:
npm run android
```

API URL for emulator: `http://10.0.2.2:8000/api` (see `src/config.ts`).

## First run

1. Start backend.
2. Open app → **Регистрация** (username: latin letters and digits only, password ≥ 6).
3. Create task → reserve 20/50/100 → **Выполнено** / **Не выполнено**.

## Release build (later)

Signed AAB from `myTaskBet/android` — set production `API_BASE_URL` in `src/config.ts` before release.
