# MyVita

Personal dashboard for your own public footprint. This first version is a local web app: findings are simulated on your machine, and the profile is stored in `data/store.json`.

## Run

```bash
cd myindex
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Delete `data/store.json` to restore the sample profile.

## Database

`prisma/schema.prisma` is the PostgreSQL schema for Supabase. Generate the client after you set `DATABASE_URL` (see `.env.example`):

```bash
npx prisma generate
```

The interface does not require a database yet.
