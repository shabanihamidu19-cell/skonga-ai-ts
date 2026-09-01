# SKONGA AI (TypeScript)

Clean TypeScript + Vite migration of the original monolithic `www/index.html`.

**Owner:** KCL Platform TZ  
**Original:** [skonga-ai-v1](https://github.com/shabanihamidu19-cell/skonga-ai-v1)

---

## Why this migration?

The previous app was a **single 258 KB / 5 200+ line `index.html`**. Hard to maintain.

This version uses Vite + TypeScript with modular structure.

| Layer | Status |
|--------|--------|
| **Vite + TypeScript** | ✅ Scaffold + core modules |
| **CSS** | 🔄 Upload next (`src/styles/main.css`) |
| **Auth** | ✅ Typed module (`src/auth`) — same `_fb` bridge |
| **Pay / Pro** | ✅ Module (`src/pay`) |
| **Chat sessions** | ✅ Typed storage |
| **Theme / Toast** | ✅ Modules |
| **Full chat streaming, notes, graphs, attach…** | 🔄 Progressive port |

---

## Quick start

```bash
git clone https://github.com/shabanihamidu19-cell/skonga-ai-ts.git
cd skonga-ai-ts
npm install
npm run dev          # http://localhost:5173
```

Build for Capacitor:

```bash
npm run build        # outputs to www/
npx cap sync android
```

---

## Project structure

```
skonga-ai-ts/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── capacitor.config.json
├── src/
│   ├── main.ts
│   ├── config.ts
│   ├── types/
│   ├── auth/
│   ├── chat/
│   ├── pay/
│   ├── ui/
│   ├── utils/
│   └── styles/main.css
└── public/
```

---

## License

MIT — KCL Platform TZ
