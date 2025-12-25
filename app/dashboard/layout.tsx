import type { Metadata } from "next";
import { AppSidebar } from "@/components/sidebar-main";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | PromptDuel",
    default: "Dashboard | PromptDuel",
  },
  description: "Manage your prompt duels and analyze LLM performance.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-[--header-height] items-center gap-2 px-4">
           <SidebarTrigger />
        </header>
        <main className="p-4 pt-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}