import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ShieldCheck, LogIn, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/Asylum_Image_(logo)_1768056666318.jpeg";

export function Navigation() {
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "HOME" },
    { href: "/info", label: "SERVERS" },
    { href: "/battlepass", label: "BATTLEPASS" },
    { href: "/donate", label: "DONATE" },
  ];

  if (isAuthenticated && user?.isAdmin) {
    links.push({ href: "/admin", label: "ADMIN" });
  }

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo / Brand */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="relative w-10 h-10 overflow-hidden rounded border border-red-900 group-hover:border-red-500 transition-colors">
                <img src={logoImg} alt="Asylum Logo" className="object-cover w-full h-full" />
              </div>
              <span className="font-tactical text-2xl tracking-widest text-white group-hover:text-red-500 transition-colors duration-300">
                ASYLUM<span className="text-red-600">DAYZ</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <div 
                  className={cn(
                    "px-4 py-2 cursor-pointer font-display font-bold tracking-wider text-sm clip-path-slant transition-all duration-200 border-l-2 border-transparent",
                    isActive(link.href) 
                      ? "text-red-500 bg-red-900/10 border-red-500" 
                      : "text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20"
                  )}
                >
                  {link.label}
                </div>
              </Link>
            ))}
          </div>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                 <span className="text-xs text-muted-foreground font-mono hidden lg:block">
                   [{user?.username}]
                 </span>
                 <Button 
                   onClick={() => logout()} 
                   variant="ghost" 
                   size="sm"
                   className="text-red-500 hover:text-red-400 hover:bg-red-950/30"
                 >
                   <LogOut className="w-4 h-4 mr-2" />
                   LOGOUT
                 </Button>
              </div>
            ) : (
              <a href="/api/login">
                <Button 
                   variant="outline" 
                   size="sm"
                   className="border-red-900 text-red-500 hover:bg-red-950 hover:text-red-400 hover:border-red-500"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  LOGIN
                </Button>
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="text-white hover:bg-white/10"
            >
              {isMobileOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-black/95 border-b border-red-900/50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <div 
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-bold font-display cursor-pointer",
                    isActive(link.href)
                      ? "text-red-500 bg-red-900/20"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </div>
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 mt-2">
              {isAuthenticated ? (
                 <Button 
                   onClick={() => logout()} 
                   variant="ghost" 
                   className="w-full justify-start text-red-500 hover:text-red-400"
                 >
                   <LogOut className="w-4 h-4 mr-2" />
                   LOGOUT
                 </Button>
              ) : (
                <a href="/api/login" className="block w-full">
                  <Button 
                     variant="ghost" 
                     className="w-full justify-start text-white hover:text-red-400"
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
