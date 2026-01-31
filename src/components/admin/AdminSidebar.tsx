import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Calendar,
  Ticket,
  Image,
  Settings,
  ChevronLeft,
  Menu,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const menuItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Pengguna",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Kategori",
    icon: FolderOpen,
    href: "/admin/categories",
  },
  {
    title: "Event",
    icon: Calendar,
    href: "/admin/events",
  },
  {
    title: "Tiket",
    icon: Ticket,
    href: "/admin/tickets",
  },
  {
    title: "Check-in",
    icon: ScanLine,
    href: "/admin/check-in",
  },
  {
    title: "Banner",
    icon: Image,
    href: "/admin/banners",
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && "mx-auto")}
        >
          {collapsed ? (
            <Menu className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/admin" && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Link to="/">
          <Button variant="outline" className="w-full" size={collapsed ? "icon" : "default"}>
            {collapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              "Kembali ke Website"
            )}
          </Button>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
