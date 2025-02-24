This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm install

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Next to run on any server

```bash

npm run build

npm run start
```

**Frontend server:**

sudo pm2 start ecosystem.config.js

```bash
pm2 save

pm2 startup

pm2 list
```
**Restarting nginx  server:**

sudo systemctl restart nginx