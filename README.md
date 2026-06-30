# 31 · AI Study Guide

**Roadmap stage:** Phase 8 – Full-Stack · June 2026

**Inspired by:** Ponder, the portraits that explain themselves through voice and story, and Cuekoo's streaming agents service. Both made me think about how much easier something is to learn when it talks to you in a voice that fits, and when the answer shows up word by word instead of after a long spinner.

My student version: paste your notes (or upload a `.txt`/`.md` file), pick who explains it to you, and get a streamed explanation plus flashcards and a quiz. The flashcards use spaced repetition, so the ones you keep missing come back sooner. I made it for my own CpE reviewers at PUP.

### Features
- Streamed explanation in a chosen persona: patient tutor, museum guide, exam coach or storyteller
- Flashcards + a 5-question quiz returned as **structured JSON**, validated with **Zod** (once by the SDK, then again with stricter rules like "the answer index must point at a real choice")
- Study sessions with SM-2 style **spaced-repetition** scoring (Again / Hard / Good / Easy, keys 1–4), mastery bar and quiz history, all saved in **localStorage**
- The Anthropic API is only called from **server route handlers**; the key is read from env and never sent to the browser
- Input limits (40–20,000 characters, text files only), a simple **per-IP rate limit**, and friendly error messages for rate limits, bad requests and connection problems
- Stop button that cancels the stream (and the upstream request)
- **Mock mode**: with no `ANTHROPIC_API_KEY`, both routes return canned responses built from your notes, so the whole app runs without a key

### Tech
Next.js 15 (App Router, Route Handlers, streaming `Response`) · React 19 · TypeScript · Anthropic TypeScript SDK (`@anthropic-ai/sdk`, Claude Opus 5.5, structured outputs) · Zod · Tailwind CSS v4

### Run
```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY, or leave it empty for mock mode
npm run dev
npm test
npm run lint
```
Open http://localhost:3000.

### What I practiced
- Streaming a model response through a route handler into a `ReadableStream`, and reading it on the client with `getReader()`
