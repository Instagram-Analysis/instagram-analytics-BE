# Instagram Analytics — Backend

This is the **Express.js + TypeScript** backend for the Instagram Analytics dashboard.  
It exposes REST endpoints for:

- Logging in via Instagram credentials
- Fetching followers (`/api/followers`)
- Fetching following (`/api/following`)
- Identifying non-followers (`/api/non-followers`)
- Aggregating top likers (`/api/top-likers`)

## Setup

1. Clone this repo and install dependencies:

   ```bash
   git clone git@github.com:Instagram-Analysis/instagram-analytics-BE.git
   cd instagram-analytics-BE
   npm install
   ```

2. Create a `.env` file in the project root with:

   ```dotenv
   PORT=4000
   FRONTEND_URL=http://localhost:3000
   SESSION_SECRET=your-session-secret
   # For future Graph API use:
   INSTAGRAM_GRAPH_TOKEN=your-long-lived-token
   ```

3. Run in development:
   ```bash
   npm run dev
   ```
   The server listens on [http://localhost:4000](http://localhost:4000).

## Available Scripts

- `npm run dev` — start with `ts-node-dev` and hot-reload
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the compiled code

## Instagram API Integration

> **Historical note:** We initially used the unofficial [`instagram-private-api`](https://github.com/dilame/instagram-private-api) to log in with raw credentials, but ran into persistent two-factor and checkpoint challenges that were difficult to automate.
>
> **Current direction:** Migrating to the **official Instagram Graph API**. In the upcoming version:
>
> 1. Users will authenticate via OAuth (no raw passwords or 2FA handling in our code).
> 2. We’ll exchange the OAuth code for a long‐lived access token.
> 3. Followers, following, and media metrics will be fetched via:
>    - `GET https://graph.instagram.com/me/followers?access_token=…`
>    - `GET https://graph.instagram.com/me/following?access_token=…`
>    - `GET https://graph.instagram.com/me/media?fields=id,like_count&access_token=…`

Until the migration is complete, the existing private-API login (with 2FA challenge) remains active. Expect an update soon!

## License

MIT
