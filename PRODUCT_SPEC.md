# Orchestrator Arena

## Product Specification & Vision Document

---

## Executive Summary

A competitive, time-boxed coding platform for the vibe coding era. Participants use AI-assisted development (Claude Code, Copilot, etc.), push to GitHub, and submit working artifacts to themed bounties. The platform generates high-resolution signals about shipping ability, taste, and AI leverage efficiency—signals that traditional coding assessments cannot capture.

**The long-term vision**: Competitions are the filter. Talent formation is the product. Real projects are the payoff.

---

## Core Insight

Vibe coding is a real behavioral shift happening now. There's no platform purpose-built for it:

- Existing hackathons are too slow and resume-driven
- Traditional coding assessments (HackerRank, LeetCode) measure algorithm knowledge, not shipping ability
- Companies hiring for AI-native roles have no signal for "can they work with AI effectively?"

This platform fills that gap.

---

## What Makes It Different

### 1. Time-Locked Competitions
Each bounty has a strict start and end window. Submissions must be created within the window. Git commit history serves as proof of work.

### 2. Vibe-First Evaluation
Voting focuses on:
- Does it work?
- Is it interesting or unexpected?
- Is it polished enough to demo?
- Did they do something clever with AI assistance?

**Not**: lines of code, test coverage, or architecture purity.

### 3. AI-Native Workflow
- Optional Claude Code integration badge
- Metadata showing AI assistance level (self-reported or inferred)
- Prompt snippets can be optionally shared and voted on separately

### 4. GitHub as Source of Truth
- Repo must be public
- Platform ingests commits, README, demo links
- No uploads of zip files or screenshots only
- Built-in anti-cheat through commit timestamps and activity patterns

---

## Competition Formats

### Flash Bounties
- **Duration**: 30-90 minutes
- **Scope**: Very constrained prompt
- **Example**: "Build the weirdest useful CLI tool using only one file"
- **Best for**: Testing speed and instinct

### Vibe-athons
- **Duration**: 24-72 hours
- **Scope**: Multiple tracks, teams allowed
- **Features**: Live leaderboard updates
- **Best for**: More ambitious projects, team dynamics

### Async Bounties
- **Duration**: Always open, weekly voting cycles
- **Scope**: Ongoing challenges
- **Best for**: Onboarding new users, casual participation

### Duels (Future)
- **Duration**: 60 minutes
- **Format**: Head-to-head, same prompt, audience votes live after demos
- **Best for**: High spectacle, esport feel

### Brackets (Future)
- **Format**: Advance rounds, prompts escalate, winners keep building on their repo
- **Best for**: Tournament-style events

---

## Platform Architecture

### Four Core Surfaces

```
┌─────────────────────────────────────────────────────────────┐
│                         ARENA                                │
│              (Live competition experience)                   │
├─────────────────────────────────────────────────────────────┤
│                         STAGE                                │
│              (Competitor dashboard)                          │
├─────────────────────────────────────────────────────────────┤
│                        GALLERY                               │
│              (Post-sprint showcase)                          │
├─────────────────────────────────────────────────────────────┤
│                        LEAGUE                                │
│              (Profiles, rankings, skill tracking)            │
└─────────────────────────────────────────────────────────────┘
```

---

## Arena (Live Experience)

The homepage during an active event.

### Live Team/Competitor Cards
- Name, track, time remaining
- "Shipping meter" based on repo signals:
  - Commit activity
  - CI status (green/red)
  - Demo URL present
  - Release tags
- Latest commit message summary
- Optional status pings (structured, 140 chars, 1 per 10 min)

### Event Timeline
- Event-wide feed of big moments:
  - First demo online
  - First successful deploy
  - Major commits
  - Build failures/recoveries
- Highlight detection from repo activity patterns

### Future: Map View
Stylized "arena map" where competitors occupy tiles, activity animates based on progress. Not MVP, but high spectacle potential.

---

## Stage (Competitor Dashboard)

What competitors use during the sprint.

### Checklist-Driven Flow
1. Connect GitHub (OAuth)
2. Create repo from event template OR verify existing repo
3. Confirm repo is public and created within time window
4. Auto-detected stack suggestions (Vercel, Netlify, Render)
5. Submit required links:
   - Repository URL
   - Live demo URL
   - Optional: 60-second demo video

### Constraint Enforcement
- Timer locked and visible
- Allowed tech tags per track
- Required proof:
  - Commit activity within window
  - README sections present
  - License file

### Progress Signals
- Build status (CI or health check ping)
- Demo uptime check
- Optional lint/smoke test results

---

## Gallery (Post-Sprint Showcase)

Product Hunt style, but competition-native.

### Submission Pages Include
- Demo embed or link
- Screenshots/GIFs
- One-liner description
- "What's novel" section
- Feature bullets
- Repo metadata (commits, contributors, stack)
- AI usage disclosure
- Optional: prompt excerpts shared

### Gallery Filters
- By track
- Newest
- Most voted
- Judges' picks
- Most remixed

### Social Features
- "Remix" button to fork after event ends
- Remix lineage tracking
- Comment threads (moderated, focused on ideas)

---

## League (Profiles & Skill Tracking)

### Individual Profiles

After 5-10 competitions, a profile emerges:

```
┌─────────────────────────────────────────────────────────────┐
│  @username                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  Speed:        ████████░░  (top 15%)                        │
│  AI Leverage:  ██████████  (top 5%)                         │
│  Scope:        ██████░░░░  (tends to over-scope)            │
│  Polish:       ███████░░░  (top 25%)                        │
│  Consistency:  ████████░░  (8/10 placed top 20%)            │
│                                                              │
│  Stack:        React, Node, Python, CLI tools               │
│  Specialties:  Developer tools, data visualization          │
│  Best format:  Flash bounties (30-90 min)                   │
│                                                              │
│  Recent:       🥇 DevTools Sprint  🥉 API Challenge          │
└─────────────────────────────────────────────────────────────┘
```

### Skill Dimensions Tracked

| Dimension | What It Measures | How It's Captured |
|-----------|------------------|-------------------|
| **Speed-to-Working** | Time from prompt to first successful deploy | Commit timestamps, deploy logs |
| **AI Leverage** | Efficiency of AI-assisted development | Output/time ratio, recovery patterns |
| **Scope Judgment** | Ability to scope appropriately for time | Feature completion vs ambition |
| **Stack Fluency** | Framework/language proficiency | Tech detected across submissions |
| **Product Instinct** | Taste, user value creation | Voting patterns, "would use" ratio |
| **Consistency** | Reliable performance across events | Variance in placement over time |
| **Polish** | Attention to detail, finish quality | Judge scores, demo quality |

### Leaderboards
- Overall rankings
- Per-track rankings
- Specialty rankings (dev tools, web apps, CLI, etc.)
- Rising stars (most improvement)

---

## Voting & Judging System

### Voting Window
- Opens at deadline
- Lasts 12-48 hours
- Spectator votes limited per day (anti-spam)

### MVP Voting (Simple)
- **Works?** (Yes/No - binary gate)
- **Would you use this?** (Yes/No/Maybe)
- Optional: one-sentence comment

### Full Rubric (Future)
| Criterion | Scale | Weight |
|-----------|-------|--------|
| Works | Binary gate | Required |
| Novelty | 1-5 | 25% |
| Polish | 1-5 | 25% |
| Usefulness | 1-5 | 25% |
| Delight | 1-5 | 25% |

### Score Composition
- Weighted average with anti-sybil protections
- Judge votes count more (2-3x weight)
- Diminishing returns per voter (prevents brigading)
- Optional voter "confidence" rating

### Awards Per Event
- Overall Winner
- Best Polish
- Most Novel
- Best Under Constraints
- Crowd Favorite
- Judges' Pick

---

## Long-Term Vision: Talent Formation

### Phase 1: Signal Generation
**Purpose**: Create high-resolution signals about who can ship.

- Time-locked bounties
- GitHub-verified work
- Outcome-focused voting
- Lightweight reputation (decays over time)

**Constraint**: No forums, no thought leadership. Only artifacts.

### Phase 2: Cohort Formation
**Purpose**: Convert individual signal into group signal.

- Automatic or opt-in squad formation
- Squads exist for single competition window
- Performance tracked at individual AND squad level

**Outputs**:
- Squad chemistry score
- Role emergence data (builder, finisher, designer, integrator)
- Reliability under time pressure

### Phase 3: Real Project Injection
**Purpose**: Route high-performing squads into real work.

**Project Sources**:
- Sponsored startups
- Internal platform projects
- Open infrastructure problems
- Research prototypes
- Enterprise proof-of-concepts

**Mechanism**:
- Projects framed as paid bounties or milestone contracts
- Clear scope, short timelines, real stakes
- Squads opt in, not assigned
- Platform takes coordination fee

### Phase 4: Persistent Elite Groups
**Purpose**: Form durable execution units.

- Top squads can choose to persist
- Priority access to higher-value projects
- Reputation compounds across projects
- Internal trust replaces heavy review

**End state**: AI-native strike teams.

---

## Hiring & Enterprise Use Cases

### Why This Signal Matters

Traditional assessments test: "Can you write an algorithm correctly?"

This platform tests: "Can you ship a working thing fast with AI assistance?"

Companies hiring for AI-native roles need the second signal.

### Enterprise Features

#### Talent Sourcing
- Filter by skill profile, stack, specialty
- Example: "Show me top 10% speed, built developer tools, uses TypeScript"

#### Assessment Replacement
- Invite candidates to private competitions
- Watch how they actually work
- No take-home projects or whiteboard interviews

#### Team Composition Analysis
- Mix of "fast shippers" and "polish people"
- Profiles show who's who
- Squad compatibility predictions

#### Verified Badges
- Companies sponsor tracks
- Winners get "Stripe-verified" or "Vercel-verified" badges
- Signal for specific domain competency

---

## Revenue Model

### Phase 1 (Competition Platform)
| Stream | Description |
|--------|-------------|
| Sponsored Bounties | Companies pay to post challenges |
| Platform Fees | % of prize pools |
| Premium Analytics | Deeper competition insights |

### Phase 2 (Talent Platform)
| Stream | Description |
|--------|-------------|
| Company Subscriptions | Access to search/filter profiles |
| Assessment-as-a-Service | Run private competitions for candidates |
| Recruiter Seats | Pay per outreach through platform |
| Verified Badges | Sponsor tracks, award branded badges |

### Phase 3 (Project Marketplace)
| Stream | Description |
|--------|-------------|
| Coordination Fees | % of project payments |
| Enterprise Contracts | Custom strike team engagements |
| Revenue Share | Optional equity participation in exceptional outcomes |

**Principle**: No ads. Ever.

---

## Anti-Cheat & Fairness

### Enforcement Mechanisms

| Threat | Defense |
|--------|---------|
| Pre-building | Repo must be created after prompt drop |
| Vote brigading | Diminishing returns, rate limits, judge weight |
| Fake activity | Commit content analysis, not just timestamps |
| Recycled projects | Similarity detection against prior work |
| Multiple accounts | GitHub OAuth, soft identity verification |

### Design Principles
- Soft enforcement, not surveillance-heavy
- Reputation decay (old wins matter less)
- Consistency requirements (one lucky win ≠ profile)
- Challenge mechanism (competitors can flag suspicious entries)
- Clear disclosure rules for AI usage

### What We Accept
- People getting better over time (that's growth)
- Specializing in one format (shows focus)
- Using AI heavily (that's the point)

---

## MVP Scope

### V1: Ruthlessly Minimal

**One format**: Open Arena, 2 hours, solo only
**One track**: Web apps
**Simple voting**: Binary "would you use this?" + optional comment

#### Core Features
- [ ] GitHub OAuth
- [ ] Create/join competition
- [ ] Countdown timer
- [ ] Submit repo + demo link
- [ ] Voting window
- [ ] Leaderboard
- [ ] Basic profile (past competitions, placements)

#### Not in MVP
- Squads/teams
- Brackets/duels
- Live spectating features
- Esport broadcast layer
- Sponsor portal
- Full skill taxonomy
- Private competitions

### V1 Success Metrics
- 50+ participants across first 10 events
- 80%+ submission rate (started → submitted)
- Qualitative signal: do placements feel "right" to judges?
- 5+ hiring managers say they'd pay for this signal

---

## Technical Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                    (Next.js / React)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│                    (Node.js / tRPC)                          │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Database     │ │  GitHub API     │ │   Job Queue     │
│   (Postgres)    │ │  (Webhooks)     │ │   (Bull/Redis)  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Repo Analyzer  │
                    │  (Background)   │
                    └─────────────────┘
```

### Key Integrations
- **GitHub**: OAuth, webhooks, repo analysis
- **Deployment platforms**: Vercel/Netlify status checks
- **Payments**: Stripe (for prizes, subscriptions)

---

## Data Model (Core Entities)

```
User
├── id
├── github_id
├── username
├── avatar_url
├── created_at
└── profile (skill scores, computed)

Competition
├── id
├── title
├── description
├── prompt (revealed at start)
├── track
├── format (flash, vibe-athon, async)
├── starts_at
├── ends_at
├── voting_ends_at
├── prize_pool
└── status (upcoming, live, voting, completed)

Submission
├── id
├── competition_id
├── user_id
├── repo_url
├── demo_url
├── video_url (optional)
├── submitted_at
├── commit_count
├── first_commit_at
├── last_commit_at
└── status (draft, submitted, disqualified)

Vote
├── id
├── submission_id
├── voter_id
├── would_use (yes, no, maybe)
├── comment (optional)
├── is_judge
└── created_at

SkillScore (computed, per user)
├── user_id
├── dimension (speed, ai_leverage, scope, etc.)
├── score (0-100)
├── percentile
├── sample_size (competitions counted)
└── last_updated
```

---

## Risks & Failure Modes

### Platform Risks

| Risk | Mitigation |
|------|------------|
| Cold start (not enough participants) | Private beta with known vibe coders, community partnerships |
| Becomes popularity contest | Judge weight, anonymous early voting, anti-influencer mechanics |
| Gaming/cheating at scale | Reputation decay, consistency requirements, challenge mechanism |
| Shallow dev social app | No forums, no thought leadership, artifacts only |
| Feature creep | Ruthless MVP discipline, validate before building |

### Business Risks

| Risk | Mitigation |
|------|------------|
| Companies don't pay for signal | Validate with 5+ hiring managers before building enterprise features |
| Winners don't translate to good hires | Track conversion, gather feedback, refine signal |
| Competition with established platforms | Focus on AI-native niche, differentiated signal |

---

## Open Questions

1. **Prompt design**: Who creates prompts? How do you ensure they're good?
2. **Judge selection**: Who are judges? How do they earn trust?
3. **AI disclosure**: Required or optional? How granular?
4. **Team formation**: Opt-in squads vs algorithmic matching?
5. **Geographic considerations**: Time zones for live events?
6. **Prize structure**: Cash vs reputation vs both?
7. **Moderation**: How to handle disputes, appeals?

---

## Next Steps

### Immediate
1. Run 3-5 manual competitions (Discord + GitHub + manual scoring)
2. Validate signal quality with participants and judges
3. Talk to 5 hiring managers about the skill profile concept
4. Identify 20-50 "founding competitors" for private beta

### After Validation
1. Build MVP (6-8 weeks)
2. Run 10+ competitions
3. Iterate on voting/scoring based on feedback
4. Build basic skill profiles
5. Pilot with 1-2 companies for hiring use case

---

## Appendix: Naming Ideas

- Orchestrator Arena
- Vibe League
- Ship Sprint
- Arena.dev
- Speedrun.dev
- VibeCraft
- ShipIt Arena
- Prompt Sprint

---

*Document Version: 1.0*
*Last Updated: January 2025*
