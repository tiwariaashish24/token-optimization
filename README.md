# Token Optimizer

A web application for estimating token usage, optimizing text with OpenAI models, analyzing documents, and tracking optimization history and estimated costs.

## Features

- **Token counting** — estimate token usage for pasted text and supported text/code files.
- **AI text optimization** — rewrite text more concisely while preserving its key meaning.
- **Multiple optimization techniques** — General, Compression, Summarization, and Code Optimization.
- **Document analysis** — upload a document, ask a question about its contents, and receive an AI-generated analysis with document statistics.
- **Cost estimates** — estimate input/output costs based on the pricing table configured in the application.
- **History and statistics** — review saved optimizations, token usage, and aggregate reduction statistics.
- **API key settings** — use a browser-saved OpenAI API key or configure a server-side key.
- **Responsive interface and theme support** — built with reusable UI components and a theme switcher.

## Tech Stack

- [Next.js](https://nextjs.org/) App Router
- [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [Prisma](https://www.prisma.io/) ORM
- PostgreSQL
- [Zod](https://zod.dev/) request validation
- pnpm

## Getting Started

### Prerequisites

- Node.js compatible with the installed Next.js version
- pnpm (the repository specifies pnpm in `package.json`)
- A PostgreSQL database
- An OpenAI API key for AI optimization and document analysis

### 1. Clone the repository

```bash
git clone https://github.com/tiwariaashish24/token-optimization.git
cd token-optimization
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root. Configure the database URL for your PostgreSQL instance and an OpenAI API key:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
OPENAI_API_KEY="your_openai_api_key"
```

Use your actual database credentials and API key. Keep `.env` out of version control and never commit secrets.

The app also allows an API key to be entered in Settings in the browser. That key is stored in browser local storage and sent to the app for supported AI requests. Only use this option on a device and browser profile you trust.

### 4. Generate Prisma Client and prepare the database

```bash
pnpm db:generate
pnpm db:push
```

The project also provides `pnpm db:migrate` for creating and applying development migrations, and `pnpm db:studio` to open Prisma Studio. Use the database workflow appropriate for your environment; do not use development migrations against production without reviewing them.

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Build the application for production |
| `pnpm start` | Start the production server after building |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Synchronize the Prisma schema with the database |
| `pnpm db:migrate` | Run Prisma development migrations |
| `pnpm db:studio` | Open Prisma Studio |

## How to Use

1. Open the **Optimizer** tab and paste text or upload a supported text/code file.
2. Choose a model and an optimization technique.
3. Select **Count Tokens** to view an estimate, or **Optimize Text** to request a concise rewrite.
4. Review the optimized output, estimated token reduction, and configured cost estimate.
5. Open **Document** to upload a document, enter a question, and view the generated analysis.
6. Use **History** and **Statistics** to inspect saved runs and usage summaries.
7. Configure an OpenAI API key in **Settings** if you are not using the server-side environment variable.

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/optimizer/count` | Count/estimate tokens for submitted text |
| `GET` | `/api/optimizer/count` | Retrieve token-count history and statistics |
| `POST` | `/api/optimizer/optimize` | Optimize submitted text and return token/cost estimates |
| `GET` | `/api/optimizer/optimize` | Retrieve recent optimizations and aggregate statistics |
| `POST` | `/api/document/analyze` | Analyze an uploaded document against a user query |

The optimization endpoint accepts JSON with `text`, optional `model`, and optional `technique`. The supported techniques are `general`, `compression`, `summarization`, and `code-optimization`. AI routes can receive an `x-api-key` request header; otherwise they use `OPENAI_API_KEY` from the server environment.

## Project Structure

```text
.
├── prisma/
│   └── schema.prisma
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── document/analyze/
│   │   │   └── optimizer/
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   │   ├── openai.ts
│   │   ├── prisma.ts
│   │   └── tokenizer.ts
│   ├── services/
│   │   ├── cost.service.ts
│   │   └── optimizer.service.ts
│   └── types/
├── package.json
├── prisma.config.ts
└── README.md
```

## Important Notes

- **Token counts are estimates.** The current tokenizer helper uses character and word-count heuristics and applies an adjustment to code-like text; it does not currently use the model's official tokenizer. Treat displayed counts and reductions as approximate, not exact API usage.
- **Pricing is configurable in code.** The cost service contains a model pricing table. Verify and update the values against current provider pricing before relying on estimates.
- **Database required.** Optimization records, token usage, history, and statistics depend on a correctly configured PostgreSQL database.
- **Supported upload formats depend on the selected input.** The document-analysis API reads uploaded files as text. Although the UI may offer PDF selection, PDF content extraction is not implemented by simply calling `file.text()`; use text-based files unless PDF parsing is added.

## Security

- Never commit API keys, database credentials, or other secrets.
- A key stored in browser local storage is accessible to scripts running in that browser context. For shared or untrusted devices, use a secure server-side secret instead.
- Apply appropriate authentication, authorization, rate limits, and upload-size validation before exposing this application publicly.

## Contributing

Contributions and improvements are welcome. Open an issue to discuss a bug or proposed change, then submit a pull request with a clear description and testing notes.

## License

No license is specified in this repository yet. Unless a license is added, the code is not explicitly granted an open-source license.

