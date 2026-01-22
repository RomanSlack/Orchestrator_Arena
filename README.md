# Orchestrator Arena

![Made with Claude Code](https://img.shields.io/badge/Made%20with-Claude%20Code-orange?style=flat-square&logo=anthropic)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-000?style=flat-square)

Time-boxed coding competitions where developers build real projects, submit GitHub repos, and get community feedback through voting.

## Overview

Orchestrator Arena is a platform for running competitive coding events. Participants join upcoming competitions, build solutions when the timer starts, and submit their GitHub repositories. After submissions close, the community votes on projects with a simple question: **"Would you use this?"**

### How It Works

1. **Join** - Sign up for upcoming competitions before they start
2. **Build** - When the competition goes live, the prompt is revealed and the clock starts
3. **Submit** - Push your code to GitHub and submit your repo before time runs out
4. **Vote** - After submissions close, vote on other participants' projects
5. **Win** - Top voted projects make the leaderboard

## Features

- GitHub OAuth authentication
- Real-time countdown timers
- GitHub repository validation
- Binary voting system ("Would you use this?")
- Live leaderboards
- User profiles with competition history

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Supabase and GitHub credentials

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Future Goals

- **Teams/Squads** - Compete as a team with shared submissions
- **Multiple Formats** - 1v1 duels, bracket tournaments, themed jams
- **Skill Profiles** - Track expertise across different tech stacks
- **Private Competitions** - Run internal hackathons for your org
- **Video Demos** - Attach walkthrough videos to submissions
- **AI Disclosure** - Optional transparency about AI tool usage
- **Sponsor Integration** - Branded competitions with prizes

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (Postgres + Realtime + Auth) |
| Auth | GitHub OAuth |
| Styling | Tailwind CSS + shadcn/ui |
| Validation | Zod |
| Deployment | Vercel |

## License

MIT
