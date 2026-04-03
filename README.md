<div align="center">

# RepIQ

### AI-Powered Workout Analytics for Hevy

[![Next.js](https://img.shields.io/badge/Next.js_14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Log in with your [Hevy](https://www.hevyapp.com/) account. RepIQ fetches your **entire workout history**, computes detailed analytics, and uses AI to generate personalized coaching insights.

**No database. No accounts. Fully stateless.**

[Getting Started](#-getting-started) &bull; [Features](#-features) &bull; [Tech Stack](#-tech-stack) &bull; [Privacy](#-privacy--security)

</div>

---

## ✨ Features

### Dashboard — Training Overview

| Feature | Description |
|:---|:---|
| **Summary Stats** | Workouts, volume, sets, streak, avg duration, weekly frequency |
| **Muscle Distribution** | Donut chart — set breakdown by muscle group |
| **Muscle Balance** | Radar chart — visualize training balance across all groups |
| **Lift Progression** | 1RM area chart with progress % for top 6 exercises |
| **Weekly Volume** | Stacked bar chart — sets per muscle group over 8 weeks |
| **Volume Trend** | 12-week combo chart (volume bars + sets line) |
| **Session Duration** | Duration trend over time with average reference |
| **Rep Range Distribution** | Strength (1-5), hypertrophy (6-12), endurance (13-20), high rep (21+) |
| **Workout Time** | Color-coded bar chart — when you train |
| **Training Frequency** | Full-year GitHub-style heatmap |
| **Strength Signals** | Flags exercises as plateaued, declining, or gaining |

### AI Coach — Personalized Intelligence

| Feature | Description |
|:---|:---|
| **Coaching Insights** | 3 specific, actionable insights based on your actual numbers |
| **Chat with Your Data** | Ask anything about your training in natural language |
| **Goal Generator** | AI sets realistic 8-week strength targets from your progression |
| **Nutrition Hints** | Personalized calorie, protein, and recovery guidance |

### Exercises & Records

| Feature | Description |
|:---|:---|
| **Exercise Ranking** | Top exercises by sessions, volume, best 1RM, and trend |
| **Personal Records** | Timeline of recent PRs grouped by date |
| **Lift Progression** | Detailed 1RM tracking per exercise |

### Navigation

- **Sidebar** — Collapsible navigation: Dashboard, AI Coach, Exercises, Records
- **Top Bar** — Account name, auth type badge, logout button
- **Responsive** — Works on desktop and tablet

---

## 🔐 Authentication

| | Hevy Credentials | Hevy PRO API Key |
|:---|:---:|:---:|
| **Requires PRO** | No | Yes |
| **Data Range** | All time | All time |
| **Volume Data** | Full (estimated by Hevy) | Calculated from sets |
| **Muscle Groups** | From API | Local mapping (~50 exercises) |
| **Personal Records** | Yes | Limited |
| **Biometrics** | Yes | No |

> **Recommended:** Use **Hevy Credentials** for the richest data. No PRO membership needed.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** — check with `node -v`
- **AI API key** (optional, free) — for AI features

### 1. Install

```bash
git clone https://github.com/your-username/RepIQ.git
cd RepIQ
npm install
```

### 2. Configure AI (optional)

Create `.env.local` in the project root:

```env
# Free — get a key at https://aistudio.google.com/apikey
GEMINI_API_KEY=your-gemini-key-here
```

<details>
<summary>Other AI providers (paid)</summary>

```env
# Anthropic (Claude) — https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-your-key-here

# OpenAI (GPT-4o-mini) — https://platform.openai.com
OPENAI_API_KEY=sk-your-key-here
```

Priority: Gemini (free) → Anthropic → OpenAI. First valid key wins.

</details>

Without an AI key, analytics still work — AI features show fallback content.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your Hevy account.

### 4. Deploy (optional)

Deploy to [Vercel](https://vercel.com) with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Add `GEMINI_API_KEY` as an environment variable in your Vercel project settings.

---

## 🛠 Tech Stack

| Layer | Technology |
|:---|:---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Charts** | [Recharts](https://recharts.org/) |
| **AI** | [Google Gemini](https://ai.google.dev/) (free), [Anthropic](https://docs.anthropic.com/), [OpenAI](https://platform.openai.com/docs) |
| **Auth** | Hevy Internal API (OAuth2) |

---

## 📁 Project Structure

```
app/
  page.tsx                          Login page (credentials + API key)
  dashboard/page.tsx                Tabbed dashboard (sidebar layout)
  layout.tsx                        Root layout + OG metadata
  icon.svg                          Favicon
  opengraph-image.tsx               Auto-generated OG preview image
  api/
    hevy/login/route.ts             Credentials auth (Hevy OAuth2)
    hevy/validate/route.ts          API key validation
    hevy/workouts/route.ts          Fetch workouts + compute analytics
    insights/route.ts               AI coaching insights
    goals/route.ts                  AI goal generator
    chat/route.ts                   AI chat with your data
    nutrition/route.ts              AI nutrition hints

lib/
  types.ts                          All TypeScript interfaces
  ai.ts                             Multi-provider AI client (Gemini/Anthropic/OpenAI)
  hevy.ts                           Hevy PRO API client
  hevy-internal.ts                  Hevy internal API client
  analytics.ts                      All computation functions
  insights.ts                       AI insights prompt + generation

components/
  Sidebar.tsx                       Collapsible sidebar navigation
  TopBar.tsx                        Account info + logout header
  StatCard.tsx                      Summary metric card
  InsightCard.tsx                   AI insight card with type badge
  DataChat.tsx                      Chat interface for training Q&A
  GoalGenerator.tsx                 AI strength goal cards
  NutritionHints.tsx                AI nutrition guidance cards
  ProgressChart.tsx                 1RM area chart with exercise selector
  VolumeChart.tsx                   Weekly stacked bar chart
  VolumeTrend.tsx                   12-week volume + sets combo chart
  DurationTrend.tsx                 Session duration area chart
  MuscleDistribution.tsx            Donut chart by muscle group
  MuscleRadar.tsx                   Radar/spider chart for balance
  RepRangeChart.tsx                 Horizontal bar breakdown
  TimeOfDay.tsx                     Workout time bar chart
  FrequencyGrid.tsx                 365-day activity heatmap
  ExerciseRanking.tsx               Ranked exercise table
  PRTimeline.tsx                    Personal records timeline
  PlateauSection.tsx                Strength signal cards
  LoadingOverlay.tsx                Full-screen loading spinner
```

---

## 🔒 Privacy & Security

- **Credentials stay safe** — sent directly to Hevy's servers, never stored by RepIQ
- **Stateless sessions** — auth tokens live in `sessionStorage`, cleared when you close the tab
- **No database** — nothing is saved to disk or any external service
- **Server-side only** — API keys are never exposed to the browser
- **Proxied requests** — all Hevy API calls go through Next.js routes, tokens never leave the server

---

## ☕ Support

If RepIQ helps your training, consider supporting the project:

<a href="https://paypal.me/TaiebBourbia">
  <img src="https://img.shields.io/badge/Buy_me_a_coffee-PayPal-F59E0B?style=for-the-badge&logo=paypal&logoColor=white" alt="Buy me a coffee" />
</a>

---

## 📄 License

MIT
