# ⚔️ Tactics Math Arena

> **Gamified Math Study Companion aligned with enVision 2.0 (Grade 7 Topic 3: Analyze and Solve Percent Problems)**  
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

## 🚀 Deploying to Render

This app is a high-speed static web application ready for Render deployment on a custom subdomain:

1. **Connect Repo:** Link this GitHub repo (`tshown-dot/tactics-math-arena`) in Render.
2. **Build Settings:**
   * **Environment:** `Static Site`
   * **Build Command:** `npm run build`
   * **Publish Directory:** `dist`
3. **Custom Subdomain:**
   * In Render settings, add your custom domain/subdomain (e.g. `arena.yourdomain.com`).
   * Add the CNAME record in your DNS manager. SSL certificates are provisioned automatically for free!

---

## 🗄️ Database Setup (Supabase)

The file `supabase_schema.sql` contains the complete schema and RLS policies for your Supabase project.

1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/gorvcvovtxykqzrscayg/sql/new).
2. Copy and paste the contents of `supabase_schema.sql`.
3. Click **Run**.
4. Test accounts pre-seeded:
   * **PIN:** `1042` | **Passcode:** `star7`
   * **PIN:** `7777` | **Passcode:** `math7`
