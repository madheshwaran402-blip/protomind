# ProtoMind 🚀

**AI-Powered Electronics Prototyping Platform**

Live: https://protomind-ten.vercel.app

---

## What is ProtoMind?

ProtoMind takes a natural language idea and generates everything you need to build an electronics prototype:

- Component selection with 200+ parts
- Wiring diagrams and 3D visualization  
- Arduino/ESP32 firmware code
- 270+ AI tools (compliance, pitch deck, BOM, testing, etc.)
- Circuit simulation (Wokwi-style)
- Hardware IDE (Monaco editor + Web Serial)
- Digital Twin (real hardware ↔ virtual sync)

## Features Built (270 Days + 30-Day Sprint)

### Core (Days 1-270)
- 270+ AI accordion tools in the Viewer
- 3D component visualization with Three.js
- Achievement and XP system
- Project history and versioning
- Component database (200+ parts)

### New Sprint (Days 1-30)
- `/wizard` — 3-step project requirements wizard
- `/roadmap` — AI daily project planner
- `/protoscan` — AI component photo identification
- `/ide` — Monaco-based Hardware IDE with Web Serial
- `/simulator2` — Wokwi-style board simulator
- `/esim` — Enhanced SVG drag-drop simulator
- `/digitaltwin` — Real hardware live sync
- `/landing` — Product landing page
- `/hub` — Navigation hub

## Stack

- **React 18 + Vite** — Frontend framework
- **Tailwind CSS** — Styling
- **Three.js + R3F** — 3D visualization
- **Monaco Editor** — Code editing
- **Ollama (llama3.2)** — Local AI (offline, free)
- **Web Serial API** — Hardware communication
- **Supabase** — Cloud sync
- **Vercel** — Deployment

## Run Locally

```bash
git clone https://github.com/madheshwaran402-blip/protomind
cd protomind
npm install
npm run dev
```

Install [Ollama](https://ollama.ai) and run:
```bash
ollama pull llama3.2
ollama serve
```

## License

MIT
