import { Eye, Activity, BarChart3, FileText, LogOut, User, Stethoscope, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { forwardRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = forwardRef<HTMLElement>((_, ref) => {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const isAdmin = profile?.role === "admin";

  const navItems = isAdmin
    ? [
        { label: "Dashboard", icon: BarChart3, path: "/admin/dashboard" },
        { label: "Doctors", icon: Stethoscope, path: "/admin/doctors" },
        { label: "Reports", icon: FileText, path: "/admin/reports" },
        
        { label: "Video Analyzer", icon: Video, path: "/admin/video-analyzer" },
      ]
    : [
        { label: "My Patients", icon: BarChart3, path: "/doctor/dashboard" },
        { label: "Assessment", icon: Activity, path: "/doctor/assessment" },
        { label: "Reports", icon: FileText, path: "/doctor/reports" },
        { label: "Profile", icon: User, path: "/doctor/profile" },
        
      ];

  return (
    <nav ref={ref} className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to={isAdmin ? "/admin/dashboard" : "/doctor/dashboard"} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Eye className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-semibold text-foreground">Eye Complication Risk</span>
            <p className="text-xs text-muted-foreground">{isAdmin ? "Admin Panel" : `Dr. ${profile?.full_name || ""}`}</p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={location.pathname === item.path ? "default" : "ghost"}
              size="sm"
              className="gap-2 text-sm"
              asChild
            >
              <Link to={item.path}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>

        <Button variant="ghost" size="sm" className="gap-2" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
