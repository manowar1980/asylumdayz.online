import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ShieldCheck, LogIn, LogOut, Menu, X, Users, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImg from "@assets/Asylum_Image_(logo)_1768056666318.jpeg";

export function Navigation() {
  const [location] = useLocation();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "HOME" },
    { href: "/info", label: "SERVERS" },
    { href: "/maps", label: "MAPS" },
    { href: "/battlepass", label: "BATTLEPASS" },
    { href: "/donate", label: "DONATE" },
    { href: "/support", label: "SUPPORT" },
  ];

  if (isAuthenticated && user?.isAdmin) {
    links.push({ href: "/admin", label: "ADMIN" });
  }

  const isActive = (path: string) => location === path;

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) return user.firstName[0].toUpperCase();
    return "U";
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) return user.firstName;
    return user?.email?.split("@")[0] || "User";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo / Brand */}
          <Link href="/">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded border border-red-900 group-hover:border-red-500 transition-colors">
                <img src={logoImg} alt="Asylum Logo" className="object-cover w-full h-full" />
              </div>
              <span className="font-tactical text-lg sm:text-2xl tracking-widest text-white group-hover:text-red-500 transition-colors duration-300 flex items-center gap-2">
                <span className="xs:inline">ASYLUM </span><span className="text-red-600">DAYZ</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <div 
                  className={cn(
                    "px-3 xl:px-4 py-2 cursor-pointer font-display font-bold tracking-wider text-xs xl:text-sm transition-all duration-200 border-l-2 border-transparent",
                    isActive(link.href) 
                      ? "text-red-500 bg-red-900/10 border-red-500" 
                      : "text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20"
                  )}
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </div>
              </Link>
            ))}
          </div>

          {/* Auth Button - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 bg-gray-800 rounded-full animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded border border-white/10 cursor-pointer hover:bg-white/10 transition-colors group/profile">
                      <Avatar className="w-7 h-7 border border-red-900 group-hover/profile:border-red-500 transition-colors">
                        <AvatarImage src={user.profileImageUrl || undefined} alt={getDisplayName()} />
                        <AvatarFallback className="bg-red-900/50 text-white text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-300 font-mono max-w-[100px] truncate group-hover/profile:text-white transition-colors">
                        {getDisplayName()}
                      </span>
                      <ChevronDown className="w-3 h-3 text-gray-500 group-hover/profile:text-white transition-colors" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-zinc-950 border-white/10 text-white p-2">
                    <DropdownMenuLabel className="font-tactical text-xs tracking-widest text-gray-400">COMMANDER INTERFACE</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem asChild className="focus:bg-red-900/20 focus:text-white cursor-pointer py-2.5">
                      <Link href="/factions" className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-blue-400" />
                        <span>MANAGE FACTIONS</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem 
                      onClick={() => logout()}
                      className="focus:bg-red-900/40 text-red-500 focus:text-red-400 cursor-pointer py-2.5"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>LOGOUT SYSTEM</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <a href="/api/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-900 text-red-500 hover:bg-red-950 hover:text-red-400 hover:border-red-500 h-9"
                  data-testid="button-login"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  LOGIN
                </Button>
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Show user avatar on mobile if logged in */}
            {isAuthenticated && user && (
              <Avatar className="w-8 h-8 border border-red-900">
                <AvatarImage src={user.profileImageUrl || undefined} alt={getDisplayName()} />
                <AvatarFallback className="bg-red-900/50 text-white text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="text-white hover:bg-white/10"
              data-testid="button-mobile-menu"
            >
              {isMobileOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="lg:hidden bg-black/95 border-b border-red-900/50">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <div 
                  className={cn(
                    "block px-3 py-3 rounded text-base font-bold font-display cursor-pointer",
                    isActive(link.href)
                      ? "text-red-500 bg-red-900/20"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                  data-testid={`nav-mobile-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </div>
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 mt-2">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded">
                    <Avatar className="w-10 h-10 border border-red-900">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={getDisplayName()} />
                      <AvatarFallback className="bg-red-900/50 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-display text-sm">{getDisplayName()}</p>
                      <p className="text-gray-500 text-xs font-mono mb-2">{user.email}</p>
                      <Link href="/factions">
                        <Button 
                          onClick={() => setIsMobileOpen(false)}
                          variant="outline" 
                          size="sm" 
                          className="w-full h-9 border-white/10 text-white hover:bg-white/5 justify-start px-3 text-xs font-mono"
                          data-testid="button-mobile-manage-factions"
                        >
                          <Users className="w-3 h-3 mr-2 text-blue-400" />
                          MANAGE FACTIONS
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <Button 
                    onClick={() => logout()} 
                    variant="ghost" 
                    className="w-full justify-start text-red-500 hover:text-red-400 h-12"
                    data-testid="button-mobile-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    LOGOUT
                  </Button>
                </div>
              ) : (
                <a href="/api/login" className="block w-full">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white hover:text-red-400 h-12"
                    data-testid="button-mobile-login"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    LOGIN
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
