import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Settings, LogOut, Package as PackageIcon, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ShoppingCart,
  Calculator,
  MagnifyingGlass,
  House,
  Package,
  DownloadSimple,
} from "@phosphor-icons/react";

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  const navLinks = [
    { href: "/", label: "Accueil", icon: House },
    { href: "/arrivage", label: "Arrivage", icon: Package },
    { href: "/scanner", label: "Scanner", icon: Calculator },
    { href: "/track", label: "Suivi", icon: MagnifyingGlass },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(13,11,30,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(45, 79, 255, 0.06)",
      }}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow duration-300">
            <span className="text-white font-black text-lg">B</span>
          </div>
          <span className="font-bold text-white text-xl tracking-tight">bysis</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                      : "text-[#6C7378] hover:text-white hover:bg-white/8"
                  }`}
                >
                  <Icon size={16} weight={isActive(link.href) ? "fill" : "regular"} />
                  {link.label}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* CTA + Install + Mobile */}
        <div className="flex items-center gap-2">
          {/* Install PWA button — desktop */}
          {installPrompt && !isInstalled && (
            <button
              onClick={handleInstall}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-[0.97]"
              style={{
                background: "rgba(0,212,200,0.1)",
                border: "1px solid rgba(0,212,200,0.25)",
                color: "#00d4c8",
              }}
              title="ثبت التطبيق على هاتفك"
            >
              <DownloadSimple size={14} weight="bold" />
              ثبت التطبيق
            </button>
          )}

          {/* User Profile Avatar (desktop) */}
          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-white/10 transition-all duration-200 group">
                  <Avatar className="h-8 w-8 ring-2 ring-cyan-500/30 group-hover:ring-cyan-500/60 transition-all">
                    <AvatarImage src={(user as any).avatarUrl || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-bold">
                      {(user.name || "?").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white/80 font-medium max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-700 text-white">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-gray-700" />
                <Link href="/orders">
                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                    <PackageIcon className="h-4 w-4 mr-2" /> Mes commandes
                  </DropdownMenuItem>
                </Link>
                <Link href="/parametres">
                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                    <Settings className="h-4 w-4 mr-2" /> Paramètres
                  </DropdownMenuItem>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin/shipmaster">
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 text-pink-400">
                      <User className="h-4 w-4 mr-2" /> ShipMaster Admin
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-400 hover:bg-gray-800 focus:bg-gray-800">
                  <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Link href="/order" className="hidden md:block">
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 shadow-md shadow-cyan-500/25 rounded-xl font-semibold active:scale-[0.97] transition-all duration-200"
            >
              <ShoppingCart size={15} weight="bold" />
              Commander
            </Button>
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#6C7378] hover:text-white hover:bg-white/10 rounded-xl"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72"
              style={{
                background: "rgba(13,11,30,0.98)",
                border: "1px solid rgba(0,212,200,0.15)",
              }}
            >
              <div className="flex items-center gap-3 mb-8 mt-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-black text-lg">B</span>
                </div>
                <span className="font-bold text-white text-xl">bysis</span>
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                          isActive(link.href)
                            ? "bg-cyan-500/15 text-cyan-400"
                            : "text-[#6C7378] hover:text-white hover:bg-white/8"
                        }`}
                      >
                        <Icon size={18} weight={isActive(link.href) ? "fill" : "regular"} />
                        {link.label}
                      </button>
                    </Link>
                  );
                })}
                <Link href="/order" onClick={() => setOpen(false)}>
                  <Button className="w-full mt-4 gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 rounded-xl font-semibold">
                    <ShoppingCart size={16} weight="bold" />
                    Commander maintenant
                  </Button>
                </Link>

                {/* Google Login button for unauthenticated users — mobile menu */}
                {!isAuthenticated && (
                  <a
                    href={`/api/auth/google?returnTo=${encodeURIComponent(location)}`}
                    onClick={() => setOpen(false)}
                    className="w-full flex items-center justify-center gap-2 mt-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] border border-gray-600 text-gray-200 hover:bg-white/10"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Se connecter avec Google
                  </a>
                )}

                {/* Install PWA button — mobile menu */}
                {installPrompt && !isInstalled && (
                  <button
                    onClick={() => { handleInstall(); setOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 mt-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97]"
                    style={{
                      background: "rgba(0,212,200,0.1)",
                      border: "1px solid rgba(0,212,200,0.25)",
                      color: "#00d4c8",
                    }}
                  >
                    <DownloadSimple size={16} weight="bold" />
                    ثبت التطبيق على هاتفك 📲
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
