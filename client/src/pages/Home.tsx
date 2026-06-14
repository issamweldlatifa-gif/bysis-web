/**
 * Home.tsx — Bysis Homepage V3.0
 * Design: Bysis_Full.html integrated into React
 * Data: loaded from DB via trpc.homepage.getData
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useChatContext } from "@/App";
import LensSheet from "@/components/LensSheet";

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ accentColor, primaryColor, onOpenChat, chatOpen, onOpenLens, lensOpen }: { accentColor: string; primaryColor: string; onOpenChat: () => void; chatOpen: boolean; onOpenLens: () => void; lensOpen: boolean }) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: "#121212", borderTop: "1px solid #2a2a2a",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "10px 0 calc(10px + env(safe-area-inset-bottom))",
    }}>
      <button onClick={onOpenLens} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lensOpen ? 1 : 0.85 }}>
        <img
          src="/manus-storage/lens-icon-final_394b0a96.png"
          alt="Lens"
          width={28}
          height={28}
          style={{
            width: 28, height: 28,
            objectFit: "contain",
            imageRendering: "crisp-edges",
          }}
        />
        <span style={{ color: lensOpen ? accentColor : "#F2F2F7", fontSize: 10, letterSpacing: "0.05em" }}>Lens</span>
      </button>
      <Link href="/arrivage" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F2F2F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span style={{ color: "#F2F2F7", fontSize: 10, letterSpacing: "0.05em" }}>Arrivage</span>
      </Link>
      <Link href="/commander" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none" }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: `linear-gradient(135deg, ${accentColor} 0%, #B8962E 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 20px ${accentColor}66`,
          marginTop: -16,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <span style={{ color: accentColor, fontSize: 10, letterSpacing: "0.05em", fontWeight: 600 }}>Commander</span>
      </Link>
      <Link href="/suivi" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F2F2F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span style={{ color: "#F2F2F7", fontSize: 10, letterSpacing: "0.05em" }}>Suivi ••</span>
      </Link>
      <button
        onClick={onOpenChat}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, opacity: chatOpen ? 1 : 0.85 }}
      >
        <img
          src="/manus-storage/ai-icon-48_36db3133.gif"
          alt="AI"
          width={28}
          height={28}
          style={{
            width: 28, height: 28,
            objectFit: "contain",
            imageRendering: "crisp-edges",
            filter: "brightness(1.1)",
          }}
        />
        <span style={{ color: "#F2F2F7", fontSize: 10, letterSpacing: "0.05em" }}>AI ••</span>
      </button>
    </nav>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const { openChat, closeChat, chatOpen } = useChatContext();
  const toggleChat = useCallback(() => { chatOpen ? closeChat() : openChat(); }, [chatOpen, openChat, closeChat]);
  const [lensOpen, setLensOpen] = useState(false);
  const toggleLens = useCallback(() => setLensOpen((v) => !v), []);
  const { data: homepageData, isLoading } = trpc.homepage.getData.useQuery();

  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroPaused, setHeroPaused] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  // Defaults
  const s = homepageData?.settings;
  const heroVideo = homepageData?.heroVideo;
  const sliderVideos = homepageData?.sliderVideos ?? [];
  const stores = homepageData?.stores ?? [];

  const primaryColor = s?.primaryColor ?? "#1C2B33";
  const accentColor = s?.accentColor ?? "#D4AF37";
  const fontFamily = s?.fontFamily ?? "Inter, sans-serif";
  const heroButtonText = s?.heroButtonText ?? "DÉCOUVRIR ••";
  const heroButtonLink = s?.heroButtonLink ?? "/arrivage";
  const heroButtonColor = s?.heroButtonColor ?? "#D4AF37";
  const heroButtonTextColor = s?.heroButtonTextColor ?? "#1C2B33";
  const adminHeadline = s?.adminHeadline ?? "DESTOCKAGE EUROPE •• Qualité Française, Prix Tunisien";
  const adminButtonText = s?.adminButtonText ?? "VOIR LES OFFRES ••";
  const adminButtonLink = s?.adminButtonLink ?? "/arrivage";
  const storesSectionTitle = s?.storesSectionTitle ?? "نشريو منهم مباشرة ليك ••";

  // ── Header scroll effect ──────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Hero video pause/play ─────────────────────────────────────────────────
  const toggleHeroPause = useCallback(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setHeroPaused(false); }
    else { v.pause(); setHeroPaused(true); }
  }, []);

  // ── Slider navigation ─────────────────────────────────────────────────────
  const goToSlide = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, sliderVideos.length - 1));
    setCurrentSlide(clamped);
    const container = sliderRef.current;
    if (!container) return;
    const cardWidth = container.offsetWidth * 0.72 + 16;
    container.scrollTo({ left: clamped * cardWidth, behavior: "smooth" });
  }, [sliderVideos.length]);

  // ── Touch swipe ───────────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#1C2B33", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#D4AF37", fontSize: 24, letterSpacing: "0.2em", fontWeight: 900 }}>BYSIS ••</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily, background: "#fff", minHeight: "100vh", overflowX: "hidden" }}>

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
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/arrivage" style={{ textDecoration: "none" }}>
            <span style={{ color: headerScrolled ? primaryColor : "#fff", fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", transition: "color 0.3s" }}>Arrivage</span>
          </Link>
          <Link href="/commander" style={{ textDecoration: "none" }}>
            <span style={{
              background: accentColor, color: primaryColor,
              padding: "8px 18px", borderRadius: 36, fontSize: 12, fontWeight: 700,
              letterSpacing: "0.05em",
            }}>Commander ••</span>
          </Link>
        </div>
      </header>

      {/* ── HERO VIDEO ─────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", height: "85vh", overflow: "hidden", background: "#000" }}>
        {heroVideo ? (
          <video
            ref={heroVideoRef}
            src={heroVideo.videoUrl}
            autoPlay muted loop playsInline
            preload="metadata"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${primaryColor} 0%, #2d4a5a 100%)` }} />
        )}

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 100%)",
        }} />

        {/* Pause button */}
        <button
          onClick={toggleHeroPause}
          style={{
            position: "absolute", top: 80, right: 20,
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.16s ease-out",
          }}
          onMouseDown={e => (e.currentTarget.style.transform = "scale(0.94)")}
          onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {heroPaused ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          )}
        </button>

        {/* CTA Button */}
        <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Link href={heroButtonLink} style={{ textDecoration: "none" }}>
            <button style={{
              background: heroButtonColor, color: heroButtonTextColor,
              padding: "16px 40px", borderRadius: 36,
              fontWeight: 700, fontSize: 14, letterSpacing: "0.15em",
              border: "none", cursor: "pointer",
              boxShadow: `0 8px 32px ${heroButtonColor}66`,
              transition: "transform 0.16s ease-out, box-shadow 0.16s ease-out",
            }}
              onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {heroButtonText}
            </button>
          </Link>
        </div>
      </section>

      {/* ── ADMIN SECTION (below hero) ─────────────────────────────────────── */}
      <section style={{
        background: primaryColor, padding: "48px 24px",
        textAlign: "center",
      }}>
        <h2 style={{
          color: "#fff", fontSize: "clamp(18px, 4vw, 28px)",
          fontWeight: 800, letterSpacing: "0.05em",
          marginBottom: 24, lineHeight: 1.3,
        }}>
          {adminHeadline}
        </h2>
        <Link href={adminButtonLink} style={{ textDecoration: "none" }}>
          <button style={{
            background: accentColor, color: primaryColor,
            padding: "16px 36px", borderRadius: 36,
            fontWeight: 700, fontSize: 13, letterSpacing: "0.1em",
            border: "none", cursor: "pointer",
            transition: "transform 0.16s ease-out",
          }}
            onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {adminButtonText}
          </button>
        </Link>
      </section>

      {/* ── VIDEO SLIDER ───────────────────────────────────────────────────── */}
      {sliderVideos.length > 0 && (
        <section style={{ padding: "40px 0", background: "#f8f8f8", overflow: "hidden" }}>
          <div
            ref={sliderRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{
              display: "flex", gap: 16,
              padding: "0 14%",
              overflowX: "auto", scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
            }}
          >
            {sliderVideos.map((video, i) => (
              <Link key={video.id} href={video.linkUrl ?? "/"} style={{ textDecoration: "none", flexShrink: 0 }}>
                <div
                  onClick={() => goToSlide(i)}
                  style={{
                    width: "72vw", maxWidth: 320,
                    aspectRatio: "9/16",
                    borderRadius: 20, overflow: "hidden",
                    scrollSnapAlign: "center",
                    transform: i === currentSlide ? "scale(1)" : "scale(0.92)",
                    transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
                    boxShadow: i === currentSlide ? "0 20px 60px rgba(0,0,0,0.25)" : "0 8px 24px rgba(0,0,0,0.12)",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <video
                    src={video.videoUrl}
                    autoPlay={i === currentSlide}
                    muted loop playsInline
                    preload={i === currentSlide ? "auto" : "none"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                    padding: "40px 16px 16px",
                  }}>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: "0.05em", margin: 0 }}>{video.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            {sliderVideos.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                style={{
                  width: i === currentSlide ? 24 : 8, height: 8,
                  borderRadius: 4, border: "none", cursor: "pointer",
                  background: i === currentSlide ? primaryColor : "#ccc",
                  transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── STORES STACK ───────────────────────────────────────────────────── */}
      {stores.length > 0 && (
        <section style={{ padding: "40px 0", background: "#fff" }}>
          <h2 style={{
            textAlign: "center", fontSize: "clamp(16px, 3.5vw, 22px)",
            fontWeight: 800, color: primaryColor,
            letterSpacing: "0.05em", marginBottom: 24, padding: "0 20px",
          }}>
            {storesSectionTitle}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {stores.map(store => (
              <Link key={store.id} href={store.linkUrl ?? "/"} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: store.backgroundColor ?? "#F5F5F0",
                    padding: "20px 24px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "opacity 0.16s ease-out",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = "0.85"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                >
                  <span style={{
                    fontWeight: 800, fontSize: "clamp(16px, 4vw, 22px)",
                    letterSpacing: "0.05em",
                    color: store.isDark ? "#fff" : "#1C2B33",
                  }}>
                    {store.name}
                  </span>
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt={store.name} style={{ height: 48, objectFit: "contain" }} loading="lazy" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={store.isDark ? "#fff" : "#1C2B33"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ background: primaryColor, color: "#fff", padding: "40px 24px 100px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ fontWeight: 900, fontSize: 28, letterSpacing: "0.2em", color: accentColor }}>BYSIS ••</span>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 8 }}>Qualité Française, Prix Tunisien</p>
          </div>

          {/* Social icons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 32 }}>
            {s?.footerFacebook && (
              <a href={s.footerFacebook} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.7)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {s?.footerInstagram && (
              <a href={s.footerInstagram} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.7)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            )}
            {s?.footerWhatsapp && (
              <a href={`https://wa.me/${s.footerWhatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.7)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              </a>
            )}
            {s?.footerEmail && (
              <a href={`mailto:${s.footerEmail}`} style={{ color: "rgba(255,255,255,0.7)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
            )}
          </div>

          {/* Links */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { label: "Arrivage", href: "/arrivage" },
              { label: "Commander", href: "/commander" },
              { label: "Suivi", href: "/suivi" },
              { label: "Garantie", href: "/garantie" },
              { label: "Contact", href: "/contact" },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13 }}>
                {link.label}
              </Link>
            ))}
          </div>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
            © {new Date().getFullYear()} BYSIS •• Tous droits réservés
          </p>
        </div>
      </footer>

      {/* ── BOTTOM NAV ─────────────────────────────────────────────────────── */}
      <BottomNav accentColor={accentColor} primaryColor={primaryColor} onOpenChat={toggleChat} chatOpen={chatOpen} onOpenLens={toggleLens} lensOpen={lensOpen} />
      <LensSheet isOpen={lensOpen} onClose={() => setLensOpen(false)} />
    </div>
  );
}
