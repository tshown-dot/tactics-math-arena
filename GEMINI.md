# Project: enVision 2.0 Math Companion (7th Grade - Topic 3)

## Stack & Target
- Single-page application built with plain HTML5, Tailwind CSS (via CDN), and vanilla JavaScript (ES Modules).
- Target device: Low-spec student Chromebooks (1366x768 viewport, fast, lightweight, zero build steps, zero heavy frameworks, no vertical scrolling needed).
- Hybrid Backend Architecture:
  - State & Game Data: Supabase REST API (Anon/Publishable Key only; strictly NO service_role key in frontend).
  - Summary Logs: Google Sheets via Google Apps Script (GAS) Web App POST endpoint using native `fetch()` (`no-cors`).
- FERPA / Privacy: Zero Student PII transmitted or stored across either tool. All student activity is keyed strictly to an anonymous 4-digit PIN.

## Architecture Rules
1. Zero Framework Bloat: Do not install React, Next.js, or Canvas physics libraries unless explicitly told. Use clean DOM elements and CSS.
2. Scope Isolation: We are building strictly for 7th Grade Topic 3, Lesson 3-1 first. Do not scaffold other topics, shops, inventory, or complex state until Lesson 3-1 is verified.
3. Verification Gate: Before touching or modifying files, present an Implementation Plan. Always test math input parsing with multiple formats ($15, 15, 15.00).
4. No PII: All student state uses an anonymous 4-digit PIN. Private roster mapping is kept in teacher's external Google Sheet only.
5. Offline Resilience: Always fallback to `localStorage` when network or endpoints are unreachable.

## Core Game Design Pillars
1. **Natural Genre-to-Lesson Fit:** The mathematical concept dictates the game genre (e.g., percents -> tactical multipliers/mitigation; scale/ratios -> crane/balancing; exponents -> combo/scaling progression). Never pause gameplay for disconnected pop-up quiz cards.
2. **Real Stakes & Failure States:** Games must have tangible tension via timers, turn limits, countdowns, health pools, or failure states. Failure must deliver rapid diagnostic feedback and an instant (<2 sec) retry loop.
3. **Reinforce & Extend (Not an Instructional Tutorial):** Games assume students have already received direct instruction. The goal is to challenge and reinforce from novel angles, culminating in higher-order thinking dilemmas/boss phases.
4. **Authentic Video Game DNA (Anti-Sandbox):** Immediate objective clarity within 10 seconds (What am I controlling? What is stopping me? How do I win?). High tactile juice (screen shake, crisp SFX, punchy animations) without feeling like a math simulation or spreadsheet.
5. **Chromebook-Native Station Flow:** Strict 1366x768 viewport fit with zero vertical scrolling; bite-sized 3-6 minute runs tailored for classroom station rotations.
