import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShoppingBag, MapPin, MessageCircle, LogIn, X } from "lucide-react";

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

export default function AuthGateModal({ open, onClose, action = "order", returnPath }: AuthGateModalProps) {
  const { isAuthenticated } = useAuth();
  const msg = actionMessages[action];
  const Icon = msg.icon;

  if (isAuthenticated) {
    onClose();
    return null;
  }

  const loginUrl = getLoginUrl();

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
          <a href={loginUrl} className="w-full">
            <Button className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 shadow-lg">
              <LogIn className="mr-2 h-5 w-5" />
              Se connecter / S'inscrire
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
          Connexion rapide via Google ou email — gratuit et sécurisé 🔒
        </p>
      </DialogContent>
    </Dialog>
  );
}
