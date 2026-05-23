import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
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
    { href: "/calculator", label: "Calculatrice", icon: Calculator },
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
