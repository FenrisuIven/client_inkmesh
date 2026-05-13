import { cn } from "@/lib/utils";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import {
  AppSidebar
} from "@/components/app-sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset>
        <main className="flex flex-col h-full w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
