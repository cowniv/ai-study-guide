# 31 · AI Study Guide

**Roadmap stage:** Phase 8 – Full-Stack · June 2026

**Inspired by:** Ponder, the portraits that explain themselves through voice and story, and Cuekoo's streaming agents service. Both made me think about how much easier something is to learn when it talks to you in a voice that fits, and when the answer shows up word by word instead of after a long spinner.

My student version: paste your notes (or upload a `.txt`/`.md` file), pick who explains it to you, and get a streamed explanation plus flashcards and a quiz. The flashcards use spaced repetition, so the ones you keep missing come back sooner. I made it for my own CpE reviewers at PUP.

### Features
- Streamed explanation in a chosen persona: patient tutor, museum guide, exam coach or storyteller
- Flashcards + a 5-question quiz returned as **structured JSON**, validated with **Zod** (once by the SDK, then again with stricter rules like "the answer index must point at a real choice")
- Study sessions with SM-2 style **spaced-repetition** scoring (Again / Hard / Good / Easy, keys 1–4), mastery bar and quiz history, all saved in **localStorage**
- The Anthropic API is only called from **server route handlers**; the key is read from env and never sent to the browser
