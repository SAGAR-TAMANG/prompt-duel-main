import type { Metadata } from "next";
import { AppSidebar } from "@/components/sidebar-main";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { UserProvider } from "@/components/user-provider";

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

  return (
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
          <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2"
              />
              <h1 className="text-base font-medium">Welcome {userData ? userData.name : "Loading..."}</h1>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
                  <a
                    href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="dark:text-foreground"
                  >
                    GitHub
                  </a>
                </Button>
              </div>
            </div>
          </header>
          <main className="p-4 pt-0">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}