import { Eye, BarChart3, Stethoscope, FileText, Video, User, Activity, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const adminItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: BarChart3 },
  { title: "Doctors", url: "/admin/doctors", icon: Stethoscope },
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "Video Analyzer", url: "/admin/video-analyzer", icon: Video },
];

const doctorItems = [
  { title: "My Patients", url: "/doctor/dashboard", icon: BarChart3 },
  { title: "Assessment", url: "/doctor/assessment", icon: Activity },
  { title: "Reports", url: "/doctor/reports", icon: FileText },
  { title: "Profile", url: "/doctor/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const isAdmin = profile?.role === "admin";
  const items = isAdmin ? adminItems : doctorItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Eye className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">Eye Complication Risk</p>
              <p className="text-[10px] text-muted-foreground">{isAdmin ? "Admin Panel" : `Dr. ${profile?.full_name || ""}`}</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="ghost"
          size="sm"
          className={`w-full gap-2 text-muted-foreground hover:text-foreground ${collapsed ? "justify-center px-0" : "justify-start"}`}
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
