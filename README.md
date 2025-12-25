# ⚔️ PromptDuel

> **"Stop guessing which prompt is better. Duel them and let the data decide."**

PromptDuel is a lightweight tool designed for AI engineers and prompt designers to evaluate LLM outputs through side-by-side "blind" testing. Instead of relying on your own bias, PromptDuel allows you to collect human-in-the-loop feedback to find the most effective prompts.

## 🚀 The Problem

When developing AI Agents, small changes in a prompt can lead to drastically different results. It's hard to track which iteration is actually "better" without a structured way to compare them and gather external feedback.

## ✨ Key Features

* **Side-by-Side Comparison:** View two different prompt outputs in a clean, split-screen interface.
* **Blind Testing:** Hide model/prompt names to get unbiased feedback from testers.
* **Sharable Duel Links:** Generate a unique URL to send to clients or team members for voting.
* **Persistent History:** All duels and votes are stored securely using **Supabase**.
* **One-Click Login:** Fast, secure access via Google Auth.

## 🛠️ Tech Stack

* **Frontend:** Next.js / React (hosted on Vercel)
* **Backend/Database:** [Supabase](https://supabase.com)
* **Authentication:** Supabase Google Auth
* **Domain:** [promptduel.feynmanpi.com](https://www.google.com/search?q=https://promptduel.feynmanpi.com)

## 🏗️ Getting Started

1. **Clone the repo:** `git clone https://github.com/yourusername/promptduel`
2. **Install dependencies:** `npm install`
3. **Set up Environment Variables:** Create a `.env` file with your Supabase URL and Anon Key.
4. **Run locally:** `npm run dev`

---

## 📈 Build in Public

This project is part of my **#BuildInPublic** journey where I focus on persistence and shipping real-world tools.

Follow my progress:

* **X (Twitter):** [@sagar_builds](https://www.google.com/search?q=https://x.com/sagar_builds)
* **Instagram:** [@sagar_builds](https://www.google.com/search?q=https://instagram.com/sagar_builds)

---

### Catchy Descriptions for Site Header/Socials:

* *"Compare your prompts early, get feedback instantly."*
* *"The 'Pepsi Challenge' for LLM Prompts."*
* *"Unbiased feedback for your AI iterations."*
* *"Where the best prompt wins."*