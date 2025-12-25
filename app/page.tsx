"use client";

import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import Link from "next/link"; // Import Link
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Home() {
  const [loading, setLoading] = useState<boolean | undefined>(true);
  const [user, setUser] = useState<User | null>(null);

  // Check user when component mounts
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
          scopes:
            "openid email profile",
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) console.error("OAuth start error:", error);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="invert"
          src="/twospoon-logo.svg"
          alt="Next.js logo"
          width={180}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Master Your Meta Ads Performance with the River AI Agent
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            { user && `Hello ${user.email}. `}
            Stop digging through Business Manager. Connect to the{" "}
            <span className="font-medium text-zinc-950 dark:text-zinc-50">
              river-mcp-server
            </span>{" "}
            and let our AI Agent analyze your Meta advertising data. 
            Use natural language to audit campaigns, track ROAS, and uncover optimization opportunities instantly.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full">
          
          {/* LOGIC: If User exists, show Continue. If not, show Connect. */}
          {user ? (
            <Link
              href="/chat"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cyan-700 px-5 text-white transition-colors hover:bg-cyan-950 md:max-w-[250px]"
            >
              Continue to Agent 
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:max-w-[250px]"
              disabled={loading}
              onClick={signInWithGoogle}
            >
              <Image
                className="dark:invert"
                src="/google-logo.png"
                alt="Google logo"
                width={16}
                height={16}
              />
              {loading ? "Connecting.." : "Connect Account"}
            </button>
          )}

          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:max-w-[250px]"
            href="https://github.com/twospoon/river-chat-mcp"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  );
}