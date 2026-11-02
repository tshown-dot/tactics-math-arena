# ⚔️ Tactics Math Arena

> **Gamified Math Study Companion aligned with enVision 2.0 (Grade 6 Topic 3: Numeric and Algebraic Expressions)**  
> Built for classroom stations, independent practice, and study halls with an authentic *Final Fantasy Tactics*-style micro-grid battle engine.

---

## 🌟 Features

### 1. The Tactics Micro-Grid Arena
* **5x3 Tactical Grid:** Maneuver onto **Shield Runes**, **Attack Boosters**, or **Coin Caches** while dodging the enemy's telegraphed danger zones!
* **Turn Timeline Bar:** Classic CT gauge (`Ignis` ➔ `Percentage Phantom`) showing upcoming turns.
* **Math-Powered Actions:** Solving math problems unleashes tactical strikes, heals shields, and shatters boss barriers.
* **60 FPS Chromebook-Native:** Lightweight, zero-lag 2D engine built specifically for school laptops and touchscreens.

### 2. The Grind (Instructional Scaffolding)
* **Intentional Ramping:** Rapid-fire pre-skill fluency (4-button quick checks) mixed with surprise **Elite Golems** (number pad exact entry).
* **Teachable Moments:** Wrong answers don't just buzz red—they diagnose the misconception (e.g. `$7\% \neq 0.7$`), show the enVision Key Concept formula card, and allow students to retry.
* **Risk vs. Reward:** Students can challenge the Boss immediately, or grind minions to earn mistake shields and attack buffs.

### 3. The Percentage Phantom (2-Phase Climax)
* **Phase 1 (Spectral Barrier):** Multipart problems cracking the outer shield.
* **Phase 2 (Enraged Core):** Screen-shaking higher-order thinking extension dilemmas (comparing discounts, taxes, and bank interest).

### 4. Zero-PII School Privacy (FERPA Compliant)
* **Student Logins:** 4-digit PIN + secret passcode.
* **Zero Names in the Game:** The game only knows anonymous IDs like `#1042`.
* **Private Roster Vault:** Teacher maintains the mapping (`PIN` $\leftrightarrow$ `Student Name`) in their private Google Sheet.
* **Supabase Cloud Sync:** Anonymous sub-100ms session logs and profile state saves.

---

## 🚀 Deploying to Render on `shownlab.com` Subdomain

This app is a high-speed, zero-build static web application ready for Render deployment on a custom subdomain (e.g., `math.shownlab.com` or `arena.shownlab.com`):

1. **Connect Repo:** Link this GitHub repo (`tshown-dot/tactics-math-arena`) in the [Render Dashboard](https://dashboard.render.com).
2. **Build Settings:**
   * **Service Type:** `Static Site`
   * **Build Command:** *(leave blank / empty)*
   * **Publish Directory:** `.` (root directory)
3. **Custom Subdomain (`*.shownlab.com`):**
   * In your Render static site dashboard, navigate to **Settings** ➔ **Custom Domains**.
   * Add your desired subdomain (e.g., `math.shownlab.com` or `arena.shownlab.com`).
   * In your DNS manager for `shownlab.com`, create a `CNAME` record pointing the host (e.g., `math` or `arena`) to your Render onrender address (e.g. `tactics-math-arena.onrender.com`).
   * Render automatically issues and manages free SSL/TLS certificates!

---

## 🗺️ Overworld Map & Cartridge Progression

The Realm of Numeria connects all modular cartridges through a unified tactical progression graph:

1. **Spire of Powers (Lesson 3-1):** Exponents & Repeated Multiplication *(Charge Runner)*
2. **Vault of Divisors (Lesson 3-2):** Greatest Common Factor *(Vault Breaker)*
3. **The Siege Works (Lesson 3-3):** Order of Operations *(Demolition Crane)*
4. **Resonance Bastion (Lesson 3-4):** Least Common Multiple *(Power Grid)*
5. **The Alchemist's Forge (Lesson 3-6):** The Distributive Property *(Reserved Modular Node)*
6. **Plains of Convergence (Lesson 3-7):** Combining Like Terms *(Term Popper)*
7. **The Citadel of Percents (Apex Boss):** Topic 3 Climax *(The Percentage Phantom)*

* **Progression Gating:** Clearing each realm unlocks the next node on the tactical map, awarding XP, Gold Coins, and Mastery Stars.
* **Lesson 3-6 Modular Plug:** Lesson 3-6 is marked as an active reserved slot (`isWip: true`), automatically bridging Lesson 3-4 to 3-7 until the cartridge is placed into `cartridges/distributive/`.
* **Teacher Demo Override:** Logging in with PIN `7777` instantly unlocks all realms and the Apex Boss for classroom demonstrations.

---

## 🗄️ Database Setup (Supabase)

The file `supabase_schema.sql` contains the complete schema and RLS policies for your Supabase project.

1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/gorvcvovtxykqzrscayg/sql/new).
2. Copy and paste the contents of `supabase_schema.sql`.
3. Click **Run**.
4. Test accounts pre-seeded:
   * **PIN:** `1042` | **Passcode:** `star7`
   * **PIN:** `7777` | **Passcode:** `math7`
