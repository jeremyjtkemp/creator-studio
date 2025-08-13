# Creator Content Platform — Product Brief

## Project Overview

An internal, scalable platform for auto-generating and editing TikTok-style videos in a hook + demo format for multiple apps in our studio. The platform replaces manual content creation workflows with AI-powered batch generation, performance analytics, and streamlined asset management. Core format: viral hook + app demo + background music, optimized for 9:16 vertical video output.

## Target Audience

**Primary Users:**
- Internal team members (content creators, marketers, growth teams)
- Multi-project access with full editing capabilities
- No role-based restrictions initially

**Secondary Users (Future):**
- External creators with read-only dashboard access
- Performance tracking and leaderboard visibility

## Primary Benefits & Features

### Core Value Propositions
- **Batch Content Creation**: Generate 10+ video variations from single input
- **AI-Powered Hooks**: Auto-generate 20+ viral hook texts per app using scraped data + AI
- **Asset Management**: Google Drive sync with tagging and search capabilities
- **Performance Intelligence**: TikTok analytics integration with hook/creator leaderboards
- **Template System**: Reusable formats and layouts for consistent output

### Key Feature Sets

**1. Project & Navigation**
- Multi-project sidebar (one project per app)
- Isolated asset libraries and archives per project
- Quick project switching with persistent state

**2. Asset Management**
- Google Drive integration for automatic asset ingestion
- Comprehensive tagging system (hook, b-roll, creator, type)
- Preview thumbnails and search functionality
- 50+ default hook video library

**3. Video Creation Workflow**
- **Hook Section**: Visual selection + AI-generated text with customizable positioning/sizing
- **Demo Section**: B-roll sequencing with timeline editor and auto-captions
- **Music Section**: Licensed library with energy/vibe tagging and preview
- **Export**: 9:16 MP4 with auto-naming conventions

**4. Batch Generation**
- Apply single hook text to multiple visuals simultaneously
- One-click export of all variations
- Bulk download capabilities

**5. Performance Analytics**
- TikTok Business Account integration
- Hook performance tracking and optimization insights
- Creator and content leaderboards

**6. Content Archive**
- Searchable video library with performance-based filtering
- Tag-based organization and auto-categorization
- Draft/Ready status management

## High-Level Tech/Architecture

**Frontend Stack:**
- React (Vite) with TypeScript
- Tailwind CSS + ShadCN UI components
- Video editing and preview components

**Backend Stack:**
- Node.js with Hono API framework
- Supabase PostgreSQL for data persistence
- Firebase Authentication for user management

**External Integrations:**
- Google Drive API for asset synchronization
- TikTok Business API for performance analytics
- AI service integration for hook generation
- Music licensing API integration

**Infrastructure:**
- Cloudflare deployment platform
- File storage and CDN for video assets
- Background job processing for batch operations

**Development Tools:**
- pnpm for package management
- Drizzle ORM for database operations
- TypeScript for type safety across stack

## Success Metrics

- Reduction in manual content creation time (target: 80%+ decrease)
- Increase in content output volume (target: 10x more videos per week)
- Improved hook performance through data-driven optimization
- Streamlined asset management and reusability across projects
