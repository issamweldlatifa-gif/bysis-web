import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShoppingBag, MapPin, MessageCircle, X } from "lucide-react";

interface AuthGateModalProps {
  open: boolean;
  onClose: () => void;
  action?: "order" | "track" | "chat" | "history";
  returnPath?: string;
}

const actionMessages = {
  order: {
    title: "Connexion requise",
    description: "Pour passer une commande et suivre son statut en temps réel, connectez-vous à votre compte.",
    icon: ShoppingBag,
    color: "text-pink-500",
  },
  track: {
    title: "Suivre mes commandes",
    description: "Connectez-vous pour voir toutes vos commandes et leur statut en temps réel.",
    icon: MapPin,
    color: "text-blue-500",
  },
  chat: {
    title: "Chat personnalisé",
    description: "Connectez-vous pour que notre assistant se souvienne de vos commandes et vous aide mieux.",
    icon: MessageCircle,
    color: "text-green-500",
  },
  history: {
    title: "Historique des calculs",
    description: "Connectez-vous pour sauvegarder et retrouver vos calculs de prix.",
    icon: ShoppingBag,
    color: "text-purple-500",
  },
};

// Google icon SVG component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function AuthGateModal({ open, onClose, action = "order", returnPath }: AuthGateModalProps) {
  const { isAuthenticated } = useAuth();
  const msg = actionMessages[action];
  const Icon = msg.icon;

  if (isAuthenticated) {
    onClose();
    return null;
  }

  const currentPath = returnPath || (typeof window !== "undefined" ? window.location.pathname : "/");
  const googleLoginUrl = `/api/auth/google?returnTo=${encodeURIComponent(currentPath)}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="text-center pt-4">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted ${msg.color}`}>
            <Icon className="h-8 w-8" />
          </div>
          <DialogTitle className="text-xl font-bold">{msg.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {msg.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4 pb-2">
          {/* Google Login Button */}
          <a href={googleLoginUrl} className="w-full">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-all duration-200"
            >
              <GoogleIcon className="mr-3 h-5 w-5" />
              Se connecter avec Google
            </Button>
          </a>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full h-10 text-sm text-muted-foreground hover:text-foreground"
          >
            Continuer sans compte
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-2">
          Connexion rapide et sécurisée via Google 🔒
        </p>
      </DialogContent>
    </Dialog>
  );
}
