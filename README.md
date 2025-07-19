# Instagram Analytics Backend

Node.js + TypeScript backend exposing four endpoints:

- `GET /api/followers` — users who follow you
- `GET /api/following` — users you follow
- `GET /api/non-followers` — those you follow who don’t follow back
- `GET /api/top-likers` — users who like your posts most

## Prerequisites

- Node.js v14+
- npm
- A long-lived Instagram Graph API token for testing

## Setup

1. **Clone & install**

   ```bash
   git clone git@github.com:Instagram-Analysis/instagram-analytics-BE.git
   cd instagram-analytics-BE
   npm install
   ```

2. **Configure environment**  
   Create `.env` in the root:

   ```env
   PORT=4000
   FRONTEND_URL=http://localhost:3000
   INSTAGRAM_ACCESS_TOKEN=<your-test-token>
   ```

3. **Run**
   ```bash
   npm run dev
   ```
   Server will start on [http://localhost:4000](http://localhost:4000).

## Available Scripts

- `npm run dev` – start with hot-reload
- `npm run build` – compile to `dist/`
- `npm run start` – run compiled code

## Project Layout

\`\`\`
src/
├── controllers/ Route handlers  
 ├── routes/ Express endpoints  
 ├── services/ Instagram API logic  
 ├── utils/ Helpers (error handling)  
 └── index.ts App entry point  
\`\`\`

## Next Steps

1. Verify stubs:
   ```bash
   curl http://localhost:4000/api/followers
   ```
2. Replace stubs in `services/instagram.service.ts` with real Graph API calls.
3. Implement OAuth flow for dynamic tokens.
