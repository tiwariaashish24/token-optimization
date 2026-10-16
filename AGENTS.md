<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Setup

### Database Setup
1. Copy `.env.example` to `.env` and configure your DATABASE_URL
2. Run `pnpm db:generate` to generate Prisma client
3. Run `pnpm db:push` to push schema to database (or `pnpm db:migrate` for migration)
4. Run `pnpm db:studio` to open Prisma Studio (optional)

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for optimization features

### Available Scripts
- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm db:generate`: Generate Prisma client
- `pnpm db:push`: Push schema to database
- `pnpm db:migrate`: Create and apply migration
- `pnpm db:studio`: Open Prisma Studio

### API Endpoints
- `POST /api/optimizer/count`: Count tokens in text
- `GET /api/optimizer/count`: Get token history and stats
- `POST /api/optimizer/optimize`: Optimize text to reduce tokens
- `GET /api/optimizer/optimize`: Get optimization history and stats
