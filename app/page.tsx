"use client";

import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
// Import Phosphor Icons
import { Sword, ArrowRight, GithubLogo, GoogleLogo, CircleNotch } from "@phosphor-icons/react";

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
        
        <div className="mb-8 flex items-center gap-2 text-black dark:text-white">
          <Sword size={32} weight="duotone" className="text-zinc-600" />
          <h2 className="text-2xl font-bold tracking-tighter">
            PromptDuel
          </h2>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-black dark:text-zinc-50 sm:text-6xl">
            Stop guessing which prompt is better. 
            <span className="text-zinc-500 dark:text-zinc-400"> Duel them.</span>
          </h1>
          
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {user && (
              <span className="block mb-2 font-medium text-black dark:text-white">
                Welcome back, {user.email?.split('@')[0]}!
              </span>
            )}
            Unbiased, side-by-side LLM testing. Collect human-in-the-loop feedback and find the prompts that actually perform.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row w-full">
          {user ? (
            <Button asChild size="lg" className="w-full md:w-auto px-8 gap-2">
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight size={18} weight="bold" />
              </Link>
            </Button>
          ) : (
            <Button 
              size="lg" 
              variant="default"
              className="w-full md:w-auto px-8 gap-3"
              disabled={loading}
              onClick={signInWithGoogle}
            >
              {loading ? (
                <CircleNotch size={20} className="animate-spin" />
              ) : (
                <GoogleLogo size={20} weight="bold" />
              )}
              {loading ? "Signing in..." : "Get Started with Google"}
            </Button>
          )}

          <Button asChild variant="outline" size="lg" className="w-full md:w-auto px-8 gap-2">
            <a
              href="https://github.com/your-username/promptduel"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubLogo size={20} weight="bold" />
              Star on GitHub
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}