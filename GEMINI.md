# Project: enVision 2.0 Math Companion (7th Grade - Topic 3)

## Stack & Target
- Single-page application built with plain HTML, Tailwind CSS (via CDN), and vanilla JavaScript.
- Target device: Low-spec student Chromebooks (fast, lightweight, zero build steps, zero heavy frameworks).
- Database: Supabase (REST API with Anon/Publishable Key only; strictly NO service_role key in frontend).

## Architecture Rules
1. Zero Framework Bloat: Do not install React, Next.js, or Canvas physics libraries unless explicitly told. Use clean DOM elements and CSS.
2. Scope Isolation: We are building strictly for 7th Grade Topic 3, Lesson 3-1 first. Do not scaffold other topics, shops, inventory, or complex state until Lesson 3-1 is verified.
3. Verification Gate: Before touching or modifying files, present an Implementation Plan. Always test math input parsing with multiple formats ($15, 15, 15.00).
4. No PII: All student state uses an anonymous 4-digit PIN and passcode.
