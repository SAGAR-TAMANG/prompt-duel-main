import { Metadata } from "next";
import { ComponentExample } from "@/components/component-example";

export const metadata: Metadata = {
  title: "My Duels | Dashboard", 
};

export default function Page() {
  return <ComponentExample />;
}