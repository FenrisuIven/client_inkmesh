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
      <AppSidebar variant="floating" className="pt-18 [&>[data-sidebar='sidebar']]:ring-0 [&>[data-sidebar='sidebar']]:shadow-md [&>[data-sidebar='sidebar']]:border-b-2 [&>[data-sidebar='sidebar']]:border-r-2 [&>[data-sidebar='sidebar']]:border-neutral-200/50"/>
      <SidebarInset>
        <main className="flex flex-col h-full w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
