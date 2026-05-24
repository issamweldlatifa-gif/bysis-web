import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface AuthGateModalProps {
  open: boolean;
  onClose: () => void;
  action?: "order" | "track" | "chat" | "history";
  returnPath?: string;
}

// Google icon SVG
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// Apple icon SVG
function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

// Phone icon
function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
    </svg>
  );
}

// Email icon
function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

const actionTitles = {
  order:   "Créez votre compte",
  track:   "Suivez vos commandes",
  chat:    "Chat personnalisé",
  history: "Sauvegardez vos calculs",
};

const actionSubtitles = {
  order:   "Connectez-vous pour passer et suivre vos commandes facilement.",
  track:   "Connectez-vous pour voir toutes vos commandes en temps réel.",
  chat:    "Connectez-vous pour que notre assistant mémorise vos commandes.",
  history: "Connectez-vous pour retrouver vos calculs de prix à tout moment.",
};

export default function AuthGateModal({ open, onClose, action = "order", returnPath }: AuthGateModalProps) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && open) onClose();
  }, [isAuthenticated, open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const currentPath = returnPath || (typeof window !== "undefined" ? window.location.pathname : "/");
  const googleLoginUrl = `/api/auth/google?returnTo=${encodeURIComponent(currentPath)}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38, mass: 0.9 }}
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
              background: "#111111",
              borderRadius: "24px 24px 0 0",
              paddingBottom: "env(safe-area-inset-bottom, 16px)",
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
            >
              <X size={16} />
            </button>

            <div className="px-6 pt-2 pb-6">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-5">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base font-black"
                  style={{ background: "linear-gradient(145deg, #0070BA, #003087)" }}
                >
                  B
                </span>
                <span className="text-white text-xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.03em" }}>
                  bysis
                </span>
              </div>

              {/* Title */}
              <h2 className="text-white text-2xl font-bold mb-1" style={{ letterSpacing: "-0.02em" }}>
                {actionTitles[action]}
              </h2>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
                {actionSubtitles[action]}
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                {/* Google */}
                <a href={googleLoginUrl} className="block">
                  <button
                    className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base font-semibold transition-all active:scale-[0.98]"
                    style={{
                      background: "rgba(255,255,255,0.10)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <GoogleIcon />
                    Continuer avec Google
                  </button>
                </a>

                {/* Apple — placeholder */}
                <button
                  onClick={() => {
                    // Apple login not yet implemented
                    alert("Apple Login bientôt disponible");
                  }}
                  className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base font-semibold transition-all active:scale-[0.98]"
                  style={{
                    background: "#fff",
                    color: "#111",
                    border: "none",
                  }}
                >
                  <AppleIcon />
                  Continuer avec Apple
                </button>

                {/* Phone — placeholder */}
                <button
                  onClick={() => alert("Connexion par téléphone bientôt disponible")}
                  className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base font-semibold transition-all active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <PhoneIcon />
                  Continuer avec un numéro de téléphone
                </button>

                {/* Email — placeholder */}
                <button
                  onClick={() => alert("Connexion par e-mail bientôt disponible")}
                  className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base font-semibold transition-all active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <EmailIcon />
                  Continuer avec un e-mail
                </button>
              </div>

              {/* Skip */}
              <button
                onClick={onClose}
                className="w-full mt-4 text-sm font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Continuer sans compte
              </button>

              <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                Connexion rapide et sécurisée 🔒
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
