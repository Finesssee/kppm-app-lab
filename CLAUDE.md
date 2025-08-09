# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Recent Updates - Phase 1 Implementation (January 2025)

### Core Library Features Completed
- **Database Schema**: Added app statistics (fork_count, run_count, rating_avg), featured flag, and full-text search indexes
- **API Endpoints**: 
  - `/api/apps` - List and filter apps with pagination and sorting
  - `/api/apps/[slug]` - Get app details with version schema
  - `/api/apps/[slug]/stats` - Get app statistics
  - `/api/apps/categories` - Get dynamic categories with counts
  - `/api/apps/search` - Advanced search with filters
- **React Query Integration**: Added hooks for data fetching with caching
- **UI Enhancements**:
  - Real-time search with debouncing
  - Sort options (recent, popular, trending, alphabetical)
  - Stats display (runs, forks, ratings)
  - Featured app badges
  - Loading states and error handling
- **Seed Data**: 10 reference apps across categories (Image, Text, Audio, Data Analysis)

### Key Files Added/Modified
- `supabase/migrations/002_core_library.sql` - Stats and search indexes
- `src/lib/db.ts` - Server-side Supabase client
- `src/lib/queries/apps.ts` - React Query hooks
- `src/hooks/use-debounce.ts` - Debounce hook for search
- `app/api/apps/` - All API endpoints
- `scripts/seed.ts` - Enhanced with 10 reference apps

## Development Commands

```bash
# Core development
npm run dev             # Start Next.js dev server on http://localhost:3000
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Run ESLint
npm run format          # Format with Prettier

# Database operations  
npm run db:migrate      # Run Supabase migrations
npm run db:seed         # Seed database with example apps
npm run db:reset        # Reset and re-migrate database

# Testing
npm run test            # Run unit tests
npm run test:coverage   # Run tests with coverage
npm run test:e2e        # Run Playwright E2E tests

# Type checking
npx tsc --noEmit       # Check TypeScript types without emitting files
```

## Architecture Overview

### Application Type
Next.js 14+ "Replicate Hub" - A Canva-style AI app library with:
- Dynamic form rendering from JSON schemas
- Replicate API integration for AI model execution
- Supabase for database and authentication
- User-scoped deployments and execution history

### Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript with strict mode
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **AI Integration**: Replicate API with streaming support

### Key Architectural Patterns

1. **Server Components by Default** (Next.js App Router)
   - Pages in `app/` are server components unless marked with 'use client'
   - API routes in `app/api/` use Next.js Route Handlers
   - Server-only operations use `import 'server-only'`

2. **Replicate Connector** (`src/lib/replicate.ts`)
   - Server-only module with Bearer auth
   - 30s timeout, 2 retries with exponential backoff
   - Supports predictions, deployments, and SSE streaming
   - Normalized error handling

3. **Dynamic Form System** (`src/components/forms/DynamicForm.tsx`)
   - Schema-driven from Zod schemas
   - Field types: text, textarea, number, select, file, slider, checkbox, boolean
   - Client and server validation with same schemas
   - File uploads limited to 5MB by default

4. **Database Schema** (Supabase/PostgreSQL)
   - `apps`: AI application definitions
   - `app_versions`: Versioned configurations with Replicate settings
   - `deployments`: User-scoped deployment instances
   - `runs`: Execution history with input/output tracking
   - RLS policies for user data isolation

5. **API Design** (`app/api/`)
   - Rate limiting: 30 req/min per IP, 100 req/min per user
   - Correlation IDs for request tracking
   - Normalized error responses with status codes
   - Zod validation for all inputs

### Path Aliases
- `@/*` maps to `./src/*` (configured in tsconfig.json)

## Important Development Notes

### Environment Variables
Required in `.env.local`:
```bash
REPLICATE_API_TOKEN=r8_...          # Server-only, from replicate.com
NEXT_PUBLIC_SUPABASE_URL=...        # Public Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # Public anon key
SUPABASE_SERVICE_ROLE_KEY=...       # Server-only service key
```

### TypeScript Configuration
- **Strict mode enabled** with all strict checks
- `noUnusedLocals` and `noUnusedParameters` enforced
- ESLint provides additional strictness
- Always handle nullable types explicitly

### API Routes Pattern
```typescript
// app/api/[route]/route.ts
import { rateLimitMiddleware } from '@/lib/rate-limit'

async function handler(request: NextRequest) {
  const correlationId = generateCorrelationId()
  try {
    // Validate with Zod
    // Process request
    // Return NextResponse.json()
  } catch (error) {
    return errorResponse(error, correlationId)
  }
}

export const GET = rateLimitMiddleware(handler)
```

### Adding New AI Apps
1. Define manifest in database seed (`scripts/seed.ts`)
2. Include `replicate` config with model, hardware, instances
3. Define `inputs` array with Zod-compatible field definitions
4. Run `npm run db:seed` to update database

### Manifest Input Field Types
```typescript
type InputType = 
  | 'text'      // Single line text
  | 'textarea'  // Multi-line text
  | 'number'    // Numeric input
  | 'select'    // Dropdown with options
  | 'file'      // File upload (5MB default)
  | 'slider'    // Range with min/max/step
  | 'checkbox'  // Boolean toggle
  | 'boolean'   // Same as checkbox
```

### Routing Structure
- `/` - App library with search/filter (server component)
- `/apps/[slug]` - App detail with dynamic form (mixed)
- `/api/apps/search` - POST search endpoint
- `/api/apps/[slug]` - GET app details
- `/api/deployments/clone-run` - POST create/reuse deployment
- `/api/predictions/run` - POST execute prediction

### Security Patterns
- **Never expose** `REPLICATE_API_TOKEN` or `SUPABASE_SERVICE_ROLE_KEY` to client
- Use Supabase RLS for all user data access
- Validate all inputs with Zod schemas
- Rate limit all API endpoints
- Server-only imports for sensitive operations

### Testing Approach
- Unit tests for Replicate connector, schemas, utilities
- Integration tests for API routes with mocked services
- E2E tests with Playwright for critical user flows
- Target ≥70% statement coverage

### Local Development Flow
1. Start Supabase: `npx supabase start`
2. Run migrations: `npm run db:migrate`
3. Seed data: `npm run db:seed`
4. Start Next.js: `npm run dev`
5. Access at http://localhost:3000

## Next Implementation Phases

### Phase 2: Deployment System (Planned)
- User authentication with Supabase Auth
- One-click deployment flow to Replicate
- User-scoped deployments tracking
- Prediction runs with streaming results
- Error handling and retry logic

### Phase 3: Creator Features (Planned)
- App submission system
- Creator profiles and attribution
- Collections and staff picks
- Basic analytics dashboard
- Plugin architecture for connectors (Vercel, Cursor, etc.)

### Common Tasks

**Update database schema:**
1. Create new migration in `supabase/migrations/`
2. Run `npm run db:migrate`
3. Update seed script if needed
4. Run `npm run db:seed`

**Add new API endpoint:**
1. Create route in `app/api/[path]/route.ts`
2. Define Zod schema for validation
3. Apply rate limiting middleware
4. Add correlation ID and error handling

**Modify form rendering:**
1. Update schema in `src/lib/schemas.ts`
2. Form component auto-adapts to schema
3. Server validation uses same schema