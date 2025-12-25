import type { Metadata } from "next";
import { AppSidebar } from "@/components/sidebar-main";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { UserProvider } from "@/components/user-provider";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/site-header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QueryProvider } from "@/components/query-providers";

export const metadata: Metadata = {
  title: {
    template: "%s | PromptDuel",
    default: "Dashboard | PromptDuel",
  },
  description: "Manage your prompt duels and analyze LLM performance.",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  
  // Get the logged-in user
  const { data: { user } } = await supabase.auth.getUser()
  const userData = user ? {
    name: user.user_metadata.full_name || user.email?.split('@')[0],
    email: user.email ?? "",
    avatar: user.user_metadata.avatar_url ?? "",
  } : null

  if (!user) {
    redirect("/") // Fallback redirect
  }
  
  return (
    <QueryProvider>
      <UserProvider initialUser={user}>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" fetchedUser={userData} />
          <SidebarInset>
            <SiteHeader userData={userData} />

            <main className="p-4 pt-4">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </UserProvider>
    </QueryProvider>
  );
}