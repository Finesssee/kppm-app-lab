# Replicate Hub - AI App Library

A Canva-style, local-only AI app library built with Next.js 14+, TypeScript, and Supabase. Browse, execute, and clone AI applications with dynamic form rendering and Replicate integration.

## 🎯 Problem → Gap → Goal

**Problem** — The AI ecosystem is fragmented:
- Design tools like Canva start you from ready-made templates instead of a blank page
- Coding assistants take you from prompt to code/app — but you still start from scratch every time
- Model hosts like Replicate make it easy to run/deploy models via API — but they don't ship full, ready-to-use apps

**Gap** — There's no unified library where developers and makers can browse, share, remix, and instantly deploy AI apps with connectors across design tools, coding assistants, and model hosts.

**Goal** — Build an open-source Replicate Hub — the "Canva for AI apps" where anyone can:
- Browse a rich library of AI applications (not just models)
- Clone or customize apps instantly without starting from zero
- Integrate seamlessly with model hosting (Replicate), coding assistants, and app generators

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase CLI (`npm install -g supabase`)

### Environment Setup

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd replicate-hub
```

2. **Copy environment variables**
```bash
cp .env.local.example .env.local
```

3. **Configure environment variables** in `.env.local`:
```bash
# Get from https://replicate.com/account/api-tokens
REPLICATE_API_TOKEN=r8_your_token_here

# For local Supabase (will be provided by npx supabase status)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Local Development Setup

```bash
# Install dependencies
npm install

# Start Supabase locally
npx supabase start

# Get your local Supabase credentials
npx supabase status

# Update .env.local with the credentials from above

# Run database migrations
npm run db:migrate

# Seed the database with example apps
npm run db:seed

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📋 Available Scripts

```bash
# Development
npm run dev             # Start Next.js development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier

# Database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with example data
npm run db:reset        # Reset database and re-run migrations

# Testing
npm run test            # Run unit tests
npm run test:coverage   # Run tests with coverage report
npm run test:e2e        # Run Playwright E2E tests
```

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Forms**: React Hook Form with Zod validation
- **AI Integration**: Replicate API
- **Auth**: Supabase Auth (anonymous/magic links)

### Project Structure
```
app/                    # Next.js App Router pages
├── api/               # API routes
│   ├── apps/         # App search and details
│   ├── deployments/  # Deployment management
│   ├── predictions/  # Replicate predictions
│   └── runs/         # Execution history
src/
├── components/        # React components
│   ├── app-detail/   # App detail page components
│   ├── app-library/  # Library browsing components
│   ├── forms/        # Dynamic form system
│   └── ui/          # shadcn/ui components
├── lib/              # Utilities and helpers
│   ├── replicate.ts  # Replicate API connector
│   ├── schemas.ts    # Zod validation schemas
│   ├── api-error.ts  # Error handling
│   └── rate-limit.ts # Rate limiting
└── types/            # TypeScript definitions
```

### Database Schema

**apps** - AI application definitions
- `id` (UUID): Primary key
- `name`: Application name
- `slug`: URL-friendly identifier
- `category`: Application category
- `tags`: Array of tags
- `description`: Application description

**app_versions** - Versioned app configurations
- `app_id`: Reference to apps table
- `replicate_model`: Replicate model identifier
- `schema`: JSON manifest with inputs and configuration

**deployments** - User-specific deployments
- `app_id`: Reference to apps table
- `user_id`: Owner of the deployment
- `hardware`: Selected hardware tier
- `min_instances`: Minimum running instances
- `max_instances`: Maximum instances for scaling

**runs** - Execution history
- `deployment_id`: Reference to deployments
- `input_payload`: Input parameters
- `status`: Execution status
- `duration_ms`: Execution time

## 🔧 Configuration

### Replicate Integration
The app supports multiple Replicate features:
- **Generic predictions**: Direct model execution
- **Deployments**: Persistent, optimized endpoints
- **Streaming**: Real-time output for LLMs
- **File handling**: Image/audio upload and generation

### Rate Limiting
In-memory token bucket rate limiting:
- **Per IP**: 30 requests/minute
- **Per User**: 100 requests/minute (authenticated)

### Security
- Server-only API keys (never exposed to client)
- Row Level Security (RLS) on all tables
- User-scoped data access
- Input validation with Zod schemas

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests (requires running app)
npm run test:e2e
```

Test coverage targets:
- Unit tests: ≥70% statement coverage
- Integration tests: Database operations
- E2E tests: Critical user flows

## 🔍 Troubleshooting

### Missing Environment Variables
**Error**: "Missing required environment variables"
**Solution**: Ensure all variables in `.env.local.example` are set in `.env.local`

### Database Connection Issues
**Error**: "Database connection failed"
**Solution**: 
1. Check Supabase is running: `npx supabase status`
2. Verify credentials in `.env.local`
3. Restart Supabase: `npx supabase stop && npx supabase start`

### Replicate API Errors
**Error**: "REPLICATE_API_TOKEN is not configured"
**Solution**: 
1. Get token from https://replicate.com/account/api-tokens
2. Add to `.env.local`
3. Restart Next.js server

### Rate Limit Exceeded
**Error**: "Too many requests. Please slow down."
**Solution**: Wait for the time specified in `Retry-After` header

## 🎯 Features

### Core Functionality
- ✅ Browse AI app library with search and filters
- ✅ Dynamic form rendering from JSON schemas
- ✅ Replicate API integration
- ✅ User-scoped deployments
- ✅ Execution history tracking
- ✅ Real-time streaming for LLMs
- ✅ File upload/download support

### Seeded Example Apps
1. **Image Generator** - Stable Diffusion XL text-to-image
2. **Image to Image** - Style transfer and editing
3. **Chat Assistant** - Llama 2 conversational AI
4. **Text Summarizer** - Automatic summarization
5. **OCR Scanner** - Text extraction from images
6. **Text to Speech** - Natural voice synthesis

## 🔒 Security Notes

- **Local Only** - This project runs entirely locally
- **API Keys** - Store all secrets in `.env.local` (gitignored)
- **No Cloud** - No deployment configs or cloud dependencies
- **Server-Side** - Sensitive operations stay server-side

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Replicate API Documentation](https://replicate.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Note**: This is a local development project. All execution happens on your machine with no external dependencies required for basic functionality.