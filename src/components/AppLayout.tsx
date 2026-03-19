import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedBackground from "@/components/AnimatedBackground";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        <AnimatedBackground />
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-background/60 backdrop-blur-xl px-4">
            <SidebarTrigger className="mr-3" />
            <span className="text-sm font-medium text-muted-foreground">
              {profile?.role === "admin" ? "Admin Panel" : `Dr. ${profile?.full_name || ""}`}
            </span>
          </header>
          <main className="flex-1 relative">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
