# swippy

## Prerequisites

- Node.js 22+
- pnpm (install with `corepack enable` and `corepack prepare pnpm@10.16.1 --activate`)

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create a `.env` file in the repository root and set your LTA key:
   ```env
   LTA_ACCOUNT_KEY=your_lta_account_key_here
   FRONTEND_ORIGIN=http://localhost:5173
   PORT=3001
   ```

## Run in development mode

Run frontend and backend together:

```bash
pnpm dev
```

- Frontend: `http://localhost:5173`
- Backend health endpoint: `http://localhost:3001/api/health`
