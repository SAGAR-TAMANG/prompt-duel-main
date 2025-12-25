import { Metadata } from "next";
import { ComponentExample } from "@/components/component-example";
import { DataTable } from "@/components/data-table";
import { ChartAreaInteractive } from "@/components/chat-area-interactive";

export const metadata: Metadata = {
  title: "My Duels | Dashboard", 
};

export default function Page() {
  return (
    <>
      {/* <ComponentExample /> */}
      {/* <ChartAreaInteractive /> */}
      <DataTable />
    </>
  
);
}