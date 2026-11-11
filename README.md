# NextAI Video Generator

> **Autonomous Daily AI News Video Pipeline**: Converts verified daily AI breakthroughs from [AIShort](https://aishort.nextai-apps.com/) into viral, high-retention 9:16 vertical videos (YouTube Shorts & Instagram Reels) with zero human effort.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Planning & Design](https://img.shields.io/badge/Status-Design%20%26%20Planning-purple.svg)]()

---

## Architecture & Implementation Docs

- **[System Architecture Specification](docs/ARCHITECTURE.md)**: End-to-end data flow, decoupled consumer contract, component deep dive, and security isolation.
- **[Detailed Implementation Plan](docs/IMPLEMENTATION_PLAN.md)**: 7-phase execution roadmap from feed ingestion to automated social publishing and GitHub Actions cron.

---

## Highlights

- **Decoupled Architecture**: Consumes AIShort's public feed (`https://aishort.nextai-apps.com/v1/feed/latest.json`) over standard HTTPS. Zero direct dependencies or database coupling.
- **Viral 3-Act Scripting**: Uses Gemini 2.5 Flash to transform 60-word news briefings into high-retention 35-second scripts (Hook, Meat, Call to Action).
- **Free Neural Voice & Word Boundaries**: Microsoft Edge-TTS delivers crisp neural voiceover with millisecond-level word timing offsets at \$0 cost.
- **React-Powered Video Engine**: Remotion composes 1080x1920 vertical videos with Ken Burns image pans, kinetic glowing subtitles, audio waveforms, and obsidian branding.
- **Autonomous Multi-Platform Distribution**: Automated uploaders for YouTube Data API v3 (`#Shorts`) and Meta Graph API (Instagram Reels).
- **Zero-Touch Execution**: Scheduled daily GitHub Actions workflow with deduplication tracking in `data/posted_archive.json`.

---

## Directory Structure

```
nextai-video-generator/
├── docs/
│   ├── ARCHITECTURE.md          # Complete system architecture & data contracts
│   └── IMPLEMENTATION_PLAN.md   # Step-by-step phased execution roadmap
├── data/
│   └── posted_archive.json      # Deduplication ledger tracking posted stories
├── src/
│   ├── feed/                    # Decoupled AIShort feed consumer & selector
│   ├── script/                  # Gemini 2.5 Flash prompt & script synthesis
│   ├── audio/                   # Edge-TTS voice synthesis & subtitle alignment
│   ├── video/                   # Remotion React 1080x1920 video composition
│   ├── render/                  # Headless bundler & MP4 rendering engine
│   └── social/                  # YouTube Shorts & Instagram Reels publishers
├── .github/
│   └── workflows/               # Scheduled autonomous cron pipeline
└── README.md
```

---

## Getting Started (Coming in Phase 1)

```bash
# Clone the repository
git clone https://github.com/sverma9312/nextai-video-generator.git
cd nextai-video-generator

# Install dependencies
pnpm install

# Test feed ingestion & story selection
pnpm test:feed

# Run local preview of video composition
pnpm remotion preview
```

---

## License

Proprietary © 2026 NextAI Apps Studio. All rights reserved.
