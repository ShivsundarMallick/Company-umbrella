import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Settings, LogOut, ChevronRight, Crown, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  if (!user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Avatar className="h-10 w-10 border-2 border-muted">
            <AvatarFallback className="bg-muted text-muted-foreground">
              <UserCircle className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-warning rounded-full flex items-center justify-center">
            <span className="text-[8px] text-warning-foreground font-bold">G</span>
          </span>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-card rounded-xl shadow-elevated border border-border z-50 py-2 animate-scale-in">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-medium text-foreground">Guest User</p>
              <p className="text-sm text-muted-foreground">Limited access</p>
            </div>

            <button
              onClick={() => handleNavigate("/pricing")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
            >
              <Crown className="w-5 h-5 text-warning" />
              <span className="flex-1 text-sm font-medium text-foreground">Upgrade to Pro</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="border-t border-border mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
      >
        <Avatar className="h-10 w-10 border-2 border-accent">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback className="bg-accent text-accent-foreground font-display font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-card rounded-xl shadow-elevated border border-border z-50 py-2 animate-scale-in">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="font-medium text-foreground">{user?.name || "User"}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleNavigate("/pricing")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
            >
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground">Payment Plans</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => handleNavigate("/settings")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground">Settings</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-border pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;