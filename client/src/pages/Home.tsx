/**
 * Home.tsx — Bysis Homepage V3.0 (Master V23 Integration)
 * Design: Bysis Master Final V23 integrated into React
 * Data: loaded from DB via trpc.homepage.getData
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useChatContext } from "@/App";
import LensSheet from "@/components/LensSheet";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import HeroSectionV23 from "@/components/HeroSectionV23";
import BrandStatementV23 from "@/components/BrandStatementV23";
import VideoSliderV23 from "@/components/VideoSliderV23";
import StoresSectionV23 from "@/components/StoresSectionV23";
import FooterV23 from "@/components/FooterV23";
import "@/styles/bysis-master-v23.css";

// ─── User Header Button ──────────────────────────────────────────────────────
function UserHeaderButton({ headerScrolled, primaryColor, accentColor }: { headerScrolled: boolean; primaryColor: string; accentColor: string }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const iconColor = headerScrolled ? primaryColor : "#fff";
  const initials = user?.name ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => {
          if (!isAuthenticated) {
            window.location.href = getLoginUrl();
          } else {
            setOpen((v) => !v);
          }
        }}
        style={{
          background: "none", border: "none", cursor: "pointer", padding: 4,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.16s ease-out",
        }}
        onMouseDown={e => (e.currentTarget.style.transform = "scale(0.9)")}
        onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
        aria-label="Compte utilisateur"
      >
        {isAuthenticated && user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name ?? ""}
            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: `2px solid ${accentColor}` }}
          />
        ) : isAuthenticated ? (
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: `linear-gradient(135deg, ${accentColor} 0%, #B8962E 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: primaryColor, letterSpacing: "0.05em",
          }}>{initials}</div>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {open && isAuthenticated && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          background: "#fff", borderRadius: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          border: "1px solid rgba(0,0,0,0.07)",
          minWidth: 220, overflow: "hidden", zIndex: 2000,
        }}>
          {/* User info */}
          <div style={{ padding: "16px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 12 }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: `linear-gradient(135deg, ${accentColor} 0%, #B8962E 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 700, color: primaryColor,
              }}>{initials}</div>
            )}
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1C2B33" }}>{user?.name ?? "Client"}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#888", marginTop: 2 }}>{user?.role === "admin" ? "Administrateur" : "Client"}</p>
            </div>
          </div>
          {/* Menu items */}
          {([
            { label: "Profil", href: "/profile" },
            { label: "Commandes", href: "/orders" },
            { label: "Paramètres", href: "/settings" },
          ] as const).map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none", display: "block" }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: "100%", padding: "12px 18px", border: "none",
                  background: "transparent", color: "#1C2B33",
                  fontSize: 14, textAlign: "left", cursor: "pointer",
                  borderBottom: "1px solid #f0f0f0",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f8f8f8")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {item.label}
              </button>
            </Link>
          ))}
          {/* Logout */}
          <button
            onClick={() => { logout(); setOpen(false); }}
            style={{
              width: "100%", padding: "12px 18px", border: "none",
              background: "transparent", color: "#d32f2f",
              fontSize: 14, textAlign: "left", cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#ffebee")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Bottom Navigation ───────────────────────────────────────────────────────
function BottomNav({ accentColor, primaryColor, onOpenChat, chatOpen, onOpenLens, lensOpen }: any) {
  // const { data: cartCount } = trpc.cart.getCount.useQuery();
  const cartCount = 0;

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      height: 64, background: "#fff", borderTop: "1px solid #e0e0e0",
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
      zIndex: 1000,
    }}>
      {[
        { icon: "🔍", label: "Lens", onClick: onOpenLens, active: lensOpen },
        { icon: "📦", label: "Arrivage", onClick: () => window.location.href = "/arrivage" },
        { icon: "🛒", label: "Commander", onClick: () => window.location.href = "/commander", badge: cartCount },
        { icon: "📋", label: "Suivi", onClick: () => window.location.href = "/suivi" },
        { icon: "🤖", label: "AI", onClick: onOpenChat, active: chatOpen },
      ].map((item, i) => (
        <button
          key={i}
          onClick={item.onClick}
          style={{
            border: "none", background: "transparent", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 4, color: item.active ? accentColor : "#666",
            fontSize: 24,
            transition: "color 0.2s",
          }}
          onMouseEnter={e => !item.active && (e.currentTarget.style.color = primaryColor)}
          onMouseLeave={e => !item.active && (e.currentTarget.style.color = "#666")}
        >
          <span>{item.icon}</span>
          {item.badge && (
            <span style={{
              position: "absolute", top: 8, right: 8,
              background: accentColor, color: primaryColor,
              borderRadius: "50%", width: 18, height: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700,
            }}>
              {item.badge}
            </span>
          )}
          <span style={{ fontSize: 10, fontWeight: 600 }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const { openChat, closeChat, chatOpen } = useChatContext();
  const toggleChat = useCallback(() => {
    if (chatOpen) {
      closeChat();
    } else {
      openChat();
    }
  }, [chatOpen, openChat, closeChat]);

  const [lensOpen, setLensOpen] = useState(false);
  const toggleLens = useCallback(() => setLensOpen((v) => !v), []);
  const { data: homepageData, isLoading } = trpc.homepage.getData.useQuery();

  const [headerScrolled, setHeaderScrolled] = useState(false);

  // Defaults
  const s = homepageData?.settings;
  const heroVideo = homepageData?.heroVideo;
  const sliderVideos = homepageData?.sliderVideos ?? [];
  const stores = homepageData?.stores ?? [];

  const primaryColor = s?.primaryColor ?? "#1C2B33";
  const accentColor = s?.accentColor ?? "#D4AF37";
  const fontFamily = s?.fontFamily ?? "Inter, sans-serif";

  // ── Header scroll effect ──────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#1C2B33", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#D4AF37", fontSize: 24, letterSpacing: "0.2em", fontWeight: 900 }}>BYSIS ••</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily, background: "#fff", minHeight: "100vh", overflowX: "hidden", paddingBottom: 64 }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
        padding: "16px 20px",
        background: headerScrolled ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: headerScrolled ? "blur(20px)" : "none",
        borderBottom: headerScrolled ? "1px solid rgba(0,0,0,0.08)" : "none",
        transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontWeight: 900, fontSize: 22, letterSpacing: "0.15em",
            color: headerScrolled ? primaryColor : "#fff",
            transition: "color 0.3s",
          }}>BYSIS ••</span>
        </Link>
        <UserHeaderButton headerScrolled={headerScrolled} primaryColor={primaryColor} accentColor={accentColor} />
      </header>

      {/* ── HERO SECTION (V23) ─────────────────────────────────────────────── */}
      <HeroSectionV23
        title="Bysis"
        subtitle="Découvrez une nouvelle façon de magasiner"
        ctaText={s?.heroButtonText || "DÉCOUVRIR"}
        ctaLink={s?.heroButtonLink || "/arrivage"}
        videoUrl={heroVideo?.videoUrl}
        backgroundColor={primaryColor}
      />

      {/* ── BRAND STATEMENT (V23) ──────────────────────────────────────────── */}
      <BrandStatementV23
        text={s?.adminHeadline || "Empower Your Style"}
        subtext="Découvrez les meilleures marques au meilleur prix"
      />

      {/* ── VIDEO SLIDER (V23) ─────────────────────────────────────────────── */}
      <VideoSliderV23
        title="Nos Dernières Vidéos"
        sectionNote="Voir tout"
        videos={sliderVideos.map((v: any) => ({
          id: v.id,
          title: v.title,
          videoUrl: v.videoUrl,
          backgroundColor: v.backgroundColor,
        }))}
      />

      {/* ── STORES SECTION (V23) ───────────────────────────────────────────── */}
      <StoresSectionV23
        title={s?.storesSectionTitle || "Nos Boutiques"}
        stores={stores.map((store: any) => ({
          id: store.id,
          name: store.name,
          backgroundColor: store.backgroundColor,
          textColor: store.textColor,
          logoUrl: store.logoUrl,
          link: store.link,
        }))}
      />

      {/* ── FOOTER (V23) ───────────────────────────────────────────────────── */}
      <FooterV23
        logo="BYSIS"
        slogan="Votre destination shopping de confiance"
        navLinks={[
          { label: "Arrivage", href: "/arrivage" },
          { label: "Commander", href: "/commander" },
          { label: "Suivi", href: "/suivi" },
          { label: "Garantie", href: "/garantie" },
          { label: "Contact", href: "/contact" },
        ]}
        legalLinks={[
          { label: "Conditions", href: "#" },
          { label: "Confidentialité", href: "#" },
          { label: "Cookies", href: "#" },
        ]}
        socialLinks={[
          { icon: "f", href: s?.footerFacebook || "#", label: "Facebook" },
          { icon: "📷", href: s?.footerInstagram || "#", label: "Instagram" },
          { icon: "💬", href: s?.footerWhatsapp ? `https://wa.me/${s.footerWhatsapp}` : "#", label: "WhatsApp" },
        ]}
      />

      {/* ── BOTTOM NAV ─────────────────────────────────────────────────────── */}
      <BottomNav accentColor={accentColor} primaryColor={primaryColor} onOpenChat={toggleChat} chatOpen={chatOpen} onOpenLens={toggleLens} lensOpen={lensOpen} />
      <LensSheet isOpen={lensOpen} onClose={() => setLensOpen(false)} />
    </div>
  );
}
