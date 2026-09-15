import { Link, useLocation } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Send, LogOut, ArrowLeft } from "lucide-react";

interface AdminNavProps {
  onLogout: () => void;
  rightSlot?: React.ReactNode;
}

const AdminNav = ({ onLogout, rightSlot }: AdminNavProps) => {
  const { pathname } = useLocation();
  const isNotifications = pathname.startsWith("/admin/notifications");
  const isPrivateLead = pathname.startsWith("/admin/private-leads");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          {isPrivateLead ? (
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin"><ArrowLeft className="w-4 h-4" /> Admin</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant={!isNotifications ? "default" : "ghost"}
                size="sm"
                className="h-8"
              >
                <Link to="/admin">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Înscrieri</span>
                </Link>
              </Button>
              <Button
                asChild
                variant={isNotifications ? "default" : "ghost"}
                size="sm"
                className="h-8"
              >
                <Link to="/admin/notifications">
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Notificări</span>
                </Link>
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rightSlot}
          <Button variant="ghost" size="sm" onClick={onLogout} className="h-8">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Ieși</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminNav;