"use client";

import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [loading, setLoading] = useState<boolean | undefined>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    loadUser();
  }, []);

  async function signInWithGoogle() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
          scopes: "openid email profile",
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) console.error("OAuth error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-20 px-8 sm:items-start">
        
        {/* Replace with your PromptDuel Logo */}
        <div className="mb-8 flex items-center gap-2">
          <span className="text-4xl">⚔️</span>
          <h2 className="text-2xl font-bold tracking-tighter text-black dark:text-white">
            PromptDuel
          </h2>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-black dark:text-zinc-50 sm:text-6xl">
            Stop guessing which prompt is better. 
            <span className="text-zinc-600 dark:text-zinc-400"> Duel them.</span>
          </h1>
          
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {user && <span className="block mb-2 font-medium text-black dark:text-white">Welcome back, {user.email?.split('@')[0]}!</span>}
            Unbiased, side-by-side LLM testing. Collect human-in-the-loop feedback and find the prompts that actually perform.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 font-medium sm:flex-row w-full">
          {user ? (
            <Link
              href="/dashboard"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-zinc-600 px-8 text-white transition-all hover:bg-zinc-700 md:w-auto"
            >
              Go to Dashboard
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <button
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-black px-8 text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 md:w-auto"
              disabled={loading}
              onClick={signInWithGoogle}
            >
              <Image
                className="dark:invert"
                src="/google-logo.png"
                alt="Google"
                width={18}
                height={18}
              />
              {loading ? "Signing in..." : "Get Started with Google"}
            </button>
          )}

          <a
            className="flex h-12 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-8 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-transparent dark:hover:bg-zinc-900 md:w-auto"
            href="https://github.com/your-username/promptduel"
            target="_blank"
            rel="noopener noreferrer"
          >
            Star on GitHub
          </a>
        </div>
      </main>
    </div>
  );
}