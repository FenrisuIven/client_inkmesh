import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import {
  AppSidebar
} from "@/components/app-sidebar";
import {
  Button
} from "@/components/ui/button";
import { Header } from "@/components/header";

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InkMesh",
  description: "Bachelors qualification project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset>
        <main>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
