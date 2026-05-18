# Friction Log — AI Implementation Plan
**Feature:** Daily friction/fear/bad-habit tracking module for Life Tracker
**Goal:** Add a "Friction Log" section that tracks daily avoidance, time waste, and drift patterns — with streak analytics, weekly heatmaps, and JSON export integration.

---

## Context for the AI

This feature is being added to an existing personal life tracker web app. The app already has:
- A daily dashboard with study/sleep analytics
- A sleep data logger
- A goal and habit management section
- JSON export for day data and goals (used for LLM analysis)

The new section is called **"Friction Log"**. It is NOT a habit tracker. It is a diagnostic tool — the user logs what *went wrong or was avoided* each day, not what went right. Think of it as the shadow layer of the day.

---

## Feature Specification

### 1. Data Model

Add a `friction` object to the existing day JSON export. Structure:

```json
{
  "date": "2026-05-07",
  "friction": {
    "patterns_fired": ["dsa_revision_skip", "gsoc_avoidance", "reels"],
    "phone_in_bed": true,
    "trigger_note": "panicked looking at graphs after doing strings all week",
    "tags_fired": ["fear", "time_waste", "sleep_drift"],
    "logged_at": "23:14"
  }
}
```

#### Friction Pattern Master List (hardcoded, not user-configurable for now)

Each pattern has: `id`, `label`, `tag`, `category`

```json
[
  {
    "id": "dsa_revision_skip",
    "label": "Skipped DSA revision, did new topics only",
    "tag": "fear",
    "category": "avoidance_fear"
  },
  {
    "id": "gsoc_avoidance",
    "label": "Avoided GSoC / open source (made an excuse)",
    "tag": "avoidance",
    "category": "avoidance_fear"
  },
  {
    "id": "lc_contest_skip",
    "label": "Skipped or feared LC contest",
    "tag": "fear",
    "category": "avoidance_fear"
  },
  {
    "id": "reels",
    "label": "Reels / mindless scroll session",
    "tag": "time_waste",
    "category": "time_waste"
  },
  {
    "id": "group_chat_overdraft",
    "label": "Group chat / unproductive social time (30+ min)",
    "tag": "time_waste",
    "category": "time_waste"
  },
  {
    "id": "phone_in_bed",
    "label": "Phone use in bed after lights out",
    "tag": "sleep_drift",
    "category": "sleep"
  },
  {
    "id": "slept_late_woke_late",
    "label": "Slept late → woke late (cycle continued)",
    "tag": "sleep_drift",
    "category": "sleep"
  }
]
```

**Note:** `phone_in_bed` appears both as a pattern in the list AND as a separate boolean field in the JSON. This is intentional — it's a key correlating variable for sleep analytics.

---

### 2. UI Section: "Friction Log"

#### Placement
Add as a new tab or collapsible section in the daily logger view — same level as the sleep logger and study logger. It should be accessible in one tap from the dashboard. Suggested tab label: **"Friction"** with a small warning/flag icon.

#### Log Entry UI (daily input view)

**Header:**
- Title: `Friction Log — [Day Name, Date]`
- Subtitle: `"Tap what fired today — even partially"`
- Day counter (e.g., "Day 49") pulled from existing challenge state

**Pattern list — grouped by category:**

Group 1 label: `Avoidance / fear`
- dsa_revision_skip
- gsoc_avoidance
- lc_contest_skip

Group 2 label: `Time waste`
- reels
- group_chat_overdraft

Group 3 label: `Sleep / night`
- phone_in_bed
- slept_late_woke_late

**Each pattern row contains:**
1. Checkbox (toggleable, red fill when checked)
2. Pattern label text
3. Tag pill (color-coded by tag type — see Tag Colors below)
4. Streak indicator (see Streak Component below)

**Tag Colors:**
- `fear` → warm red-orange background, dark red text
- `avoidance` → pink/rose background, dark pink text
- `time_waste` → amber background, dark amber text
- `sleep_drift` → blue background, dark blue text

**Below the pattern list:**
- Single `<textarea>` with placeholder: `"Optional: what triggered it today?"`
- Save button: `"Save to log"`

**On save:**
- Write the friction entry to the day's JSON record
- Show a subtle confirmation (no modal, just a brief inline "Saved" state on the button)
- `logged_at` field is set automatically to current time

---

### 3. Streak Component

This is a key UI element. Each pattern row shows a 7-day mini streak tracker.

**Render logic:**
- Fetch the last 7 days of friction logs from storage
- For each of the 7 days, show a dot: red if the pattern fired, green if the day was logged but pattern did NOT fire, gray if no log exists for that day
- After the 7 dots, show a text label:
  - If pattern fired 7/7: `"7-day streak ⚠"` in red
  - If pattern fired 5+/7: `"[N] of last 7 days"` in amber
  - Otherwise: `"[N] of last 7 days"` in muted gray

**Streak counter calculation (for analytics view):**
- "Current streak" = consecutive days ending TODAY where pattern was fired
- If today's log is not yet saved, use yesterday as the last day

---

### 4. Weekly Heatmap Component (for time waste patterns)

Used specifically for `reels` and `group_chat_overdraft` patterns.

**Render:** 7 small squares labeled M T W T F S S
- Red fill = fired that day
- Amber fill = fired but logged with trigger note (optional distinction)
- Light gray = not fired or no log

Pull data from the last 7 days of friction logs in storage.

---

### 5. Analytics View: "Friction Analytics"

Accessible from the main analytics/dashboard section. Show after 7+ days of data exist.

#### Metric Cards (2×2 grid)

| Card | Value | Sub-label |
|------|-------|-----------|
| GSoC avoidance streak | Current streak in days | "longest: Xd → now" |
| Reels frequency | `X / 30` days fired | "Y% of days" |
| Phone in bed | `X / 30` days | "corr. +Zmin avg wake delay" |
| DSA revision skip | Current streak | "X of last 7 days" |

**Phone-in-bed correlation logic:**
- For each day where `phone_in_bed = true`, look up that day's sleep log entry
- Compare planned wake time vs actual wake time (fields already exist in sleep log)
- Average the delta across all phone-in-bed days
- This is the `+Zmin avg wake delay` stat

#### 30-Day Pattern Frequency Chart

A simple bar or dot chart showing each pattern on the Y axis and number of days fired in last 30 days on the X axis. Sort descending. This gives a clear "biggest friction sources this month" view at a glance.

#### Tag-Level Summary

Group by tag (`fear`, `avoidance`, `time_waste`, `sleep_drift`), count total pattern-fires per tag this month. Show as a small horizontal bar breakdown.

---

### 6. JSON Export Integration

Extend the existing day export to include the friction object. No breaking changes — friction is a new optional key. Days before this feature was added simply won't have the key.

The existing LLM analysis prompt (used during the 40-day challenge) should be updated to include a friction summary section. Suggested addition to the export/analysis prompt:

```
If friction data is present for a day, analyze:
1. Which patterns fired and their tags
2. Any active avoidance streaks (flag anything 5+ days)
3. Correlation between phone_in_bed and wake time if sleep data is also present
4. The trigger note if provided — treat it as qualitative signal
```

---

### 7. Storage Schema

If the app uses localStorage or a JSON file per day, add the `friction` key to the existing day object. No new table or storage structure needed.

If the app uses a database, add a `friction_log` table:

```sql
CREATE TABLE friction_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT NOT NULL UNIQUE,       -- ISO date "2026-05-07"
  patterns    TEXT NOT NULL,              -- JSON array of fired pattern IDs
  phone_in_bed BOOLEAN DEFAULT FALSE,
  trigger_note TEXT,
  tags_fired  TEXT,                       -- JSON array of unique tags
  logged_at   TEXT                        -- "HH:MM"
);
```

---

### 8. Implementation Order (step-by-step for the AI)

Follow this order exactly. Do not skip ahead.

**Step 1 — Data layer**
- Define the `FRICTION_PATTERNS` constant (the master list from Section 1)
- Write `saveFrictionLog(date, data)` function
- Write `getFrictionLog(date)` function — returns null if no entry
- Write `getFrictionLogRange(startDate, endDate)` function — returns array of entries

**Step 2 — Streak utility**
- Write `getPatternStreak(patternId)` — returns current consecutive streak count (days ending today)
- Write `getPatternLast7(patternId)` — returns array of 7 booleans (fired or not, last 7 days)

**Step 3 — Log Entry UI**
- Build the Friction Log section/tab
- Render grouped pattern list with checkboxes
- Add tag pills (static, based on pattern's tag field)
- Wire up Save button to `saveFrictionLog`
- Add streak component using `getPatternLast7` (render after data loads)
- Add trigger note textarea

**Step 4 — Analytics UI**
- Build the 4 metric cards
- Implement phone-in-bed correlation (join friction log with sleep log data)
- Build 30-day frequency chart
- Build tag-level summary bar

**Step 5 — Export integration**
- Extend day export JSON to include `friction` object
- Update any LLM analysis export/prompt generation to include friction summary

**Step 6 — Polish**
- Add empty state for analytics when < 7 days of data exist: `"Log for 7 days to unlock friction analytics"`
- Ensure streak warnings (7-day streaks) are visually prominent — red color, warning icon
- Mobile responsive: pattern rows should be tappable with at least 44px touch target height

---

### 9. What NOT to build (scope boundaries)

- Do NOT add custom pattern creation UI in this version. Patterns are hardcoded.
- Do NOT add severity ratings (1-5 sliders) per pattern. Boolean fired/not-fired is the right level of friction for daily logging.
- Do NOT add notifications or reminders in this version.
- Do NOT rename "Friction Log" to anything softer. The name is intentional.

---

### 10. Design Direction

The Friction Log section should feel **utilitarian and clinical**, not punishing. The visual language:
- Muted background when nothing is checked (calm)
- Red activates only on checked items (signal, not noise)
- Streak warnings use red sparingly — only for 5+ day streaks
- The trigger note field is visually quiet — it's optional, not demanded

Match the existing app's visual style. Do not introduce a new design system.

---

*End of plan. Implement in order: data layer → streak utilities → log UI → analytics → export integration → polish.*