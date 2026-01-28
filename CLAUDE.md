# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ImpostoFacil is a Next.js 16 educational platform helping Brazilian businesses understand the 2023 tax reform (EC 132/2023). It features an AI-powered chat assistant and a knowledge base covering IBS, CBS, and IS taxes.

## Development Commands

```bash
npm run dev       # Start development server (port 3000)
npm run build     # Production build
npm run lint      # ESLint with Next.js + TypeScript rules
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router, React 19, TypeScript strict mode)
- **UI**: Tailwind CSS 4, shadcn/ui components, Radix UI primitives
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **AI**: OpenRouter API (Claude 3.5 Sonnet), OpenAI embeddings

### Key Directories
- `src/app/` - Next.js App Router with route groups: `(auth)` for login/signup, `(dashboard)` for protected routes
- `src/components/ui/` - shadcn/ui components
- `src/lib/supabase/` - Supabase clients (server.ts for SSR, client.ts for browser, admin.ts for service role)
- `src/lib/openrouter/` - LLM client with system prompt template
- `src/lib/embeddings/` - OpenAI embeddings and hybrid search logic
- `src/content/` - Static MDX articles organized by category (ibs, cbs, is, transicao, glossario)
- `src/hooks/use-chat.ts` - Client-side chat state management with SSE streaming

### Chat System Architecture
1. **API Route** (`src/app/api/chat/route.ts`): Edge Runtime endpoint that:
   - Fetches user profile for personalized context
   - Performs hybrid search (70% semantic + 30% full-text) on knowledge base
   - Streams responses via Server-Sent Events
   - Persists messages to Supabase

2. **Client Hook** (`src/hooks/use-chat.ts`): Manages streaming response parsing, message queue, and conversation state

3. **System Prompt**: Located in `src/lib/openrouter/client.ts` with `{{USER_CONTEXT}}` and `{{KNOWLEDGE_CONTEXT}}` placeholders

### Search Implementation
Hybrid search in `src/lib/embeddings/search.ts` combines:
- Semantic search via `match_content_chunks` RPC (OpenAI embeddings)
- Full-text search via `search_content` RPC (PostgreSQL)

### Authentication Flow
- Middleware in `src/middleware.ts` protects dashboard routes
- Server-side session via cookies (`src/lib/supabase/server.ts`)
- Auth actions in `src/app/(auth)/actions.ts`

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL
```

## Path Alias

TypeScript path alias `@/*` maps to `./src/*`
