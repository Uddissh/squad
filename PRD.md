# PRD: Squad (working title) — Private Valorant Friend Hub

## 1. Overview
A minimal, private Discord-alternative for a fixed friend group that plays Valorant together. Not public-facing, not scalable-to-millions — built for one closed friend circle (invite-only).

## 2. Goals
- Text chat + voice-adjacent coordination for a small group (~5-20 friends)
- Valorant-specific utility: track who's on, LFG status, match/party planning
- Low-maintenance, low-cost (free tier: Vercel + Supabase)

## 3. Non-Goals (MVP)
- No voice/video calling (use Discord voice or in-game voice; this app is text + status only)
- No public sign-up — invite-only via shared link/code
- No mobile app — responsive web only

## 4. Core Features (MVP)
1. **Auth** — Supabase Auth, invite-code gated signup
2. **Single Server/Group Space** — one shared space, no multi-server complexity (unlike Discord)
3. **Channels** — a few fixed text channels (#general, #lfg, #memes)
4. **Real-time chat** — Supabase Realtime, messages persist
5. **Online/LFG status** — user sets status: Online / In-Game / LFG / Away
6. **Party board** — post "looking for X more for ranked/unrated", others can react "I'm in"
7. **Basic profile** — Riot ID, rank (manual entry), avatar

## 5. Stretch (Post-MVP)
- Match history pull via Riot API (rank, recent games)
- Simple polls (map veto, "who's hosting")
- Push notifications (web push) when someone goes LFG

## 6. Tech Stack
- **Frontend**: Next.js (App Router), deployed on Vercel
- **DB/Auth/Realtime**: Supabase (Postgres + Auth + Realtime channels)
- **Repo**: GitHub (single repo, CI via Vercel auto-deploy on push)

## 7. Data Model (high-level)
- `users`: id, riot_id, rank, avatar_url, status (enum)
- `channels`: id, name
- `messages`: id, channel_id, user_id, content, created_at
- `party_posts`: id, user_id, message, slots_needed, created_at
- `party_reactions`: post_id, user_id

## 8. Success Criteria
- All friends in the group can sign up via invite code and chat in real time
- LFG/party board actually gets used instead of a WhatsApp group
- Zero hosting cost at this scale (free tiers)

## 9. Open Questions (need your input before implementation plan)
- Exact friend group size (affects whether Realtime free tier suffices — fine up to ~20)
- Invite mechanism: shared code vs admin-approved request?
- Any interest in Riot API integration in MVP or purely post-MVP?
