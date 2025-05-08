This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Prerequisites
- Install NodeJS latest from https://nodejs.org/en/download
- clone this repo
       git clone https://github.com/balasus1/manifest-generator.git
- cd manifest-generator
- npm install
- npm run dev

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

```bash
sudo pm2 start ecosystem.config.js
```

```bash
sudo pm2 save

sudo pm2 startup

sudo pm2 list
```
**Restarting nginx  server:**
```bash
sudo systemctl restart nginx
```
