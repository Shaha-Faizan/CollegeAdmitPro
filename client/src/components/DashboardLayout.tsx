import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  GraduationCap,
  BookOpen,
  Menu,
  Bell,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "student" | "admin";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const { toast } = useToast();

  const studentMenuItems = [
    { path: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/student/application", icon: FileText, label: "Application" },
    { path: "/student/my-applications", icon: BookOpen, label: "My Applications" },
    { path: "/student/profile", icon: User, label: "Profile" },
  ];

  const adminMenuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/applications", icon: FileText, label: "Applications" },
    { path: "/admin/courses", icon: BookOpen, label: "Manage Courses" },
    { path: "/admin/profile", icon: User, label: "Profile" },
  ];

  const menuItems = role === "student" ? studentMenuItems : adminMenuItems;

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 h-16 px-6 border-b border-sidebar-border">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-medium text-lg">EduAdmit</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  {/* FIX: Replaced the nested <a> with a <div>. The outer <Link> provides the necessary <a> tag. */}
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-md hover-elevate cursor-pointer ${
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                    }`}
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="px-4 pb-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-card border-b border-card-border flex items-center justify-between px-4 md:px-6 gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="button-sidebar-toggle"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              toast({
                title: "Notifications",
                description: "You have no new notifications at this time.",
              });
            }}
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2" data-testid="button-profile-menu">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{role === "student" ? "ST" : "AD"}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">
                  {role === "student" ? "Student" : "Admin"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem data-testid="menu-profile">
                {/* Note: If you want these to be links, you should wrap the DropdownMenuItem in a Link component. */}
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}