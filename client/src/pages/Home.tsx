import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  ScanLine,
  History,
  ShoppingCart,
  Store,
  MessageCircle,
  Package,
  TrendingUp,
  Star,
  ChevronRight,
  Truck,
  Shield,
  Zap,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold text-slate-900">bysis</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === "admin" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLocation("/admin")}
                  >
                    Admin
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={logout}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <Button size="sm" asChild>
                <a href={getLoginUrl()}>Connexion</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-100 to-white pt-12 pb-8 px-4">
        <div className="max-w-screen-lg mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            Achetez depuis{" "}
            <span className="text-pink-500">Shein</span>,{" "}
            <span className="text-red-500">AliExpress</span>{" "}
            &amp;{" "}
            <span className="text-orange-500">Temu</span>
          </h1>
          <p className="text-slate-600 text-lg mb-8 max-w-xl mx-auto">
            On commande pour vous et on livre directement chez vous en Tunisie.
            Prix calculé en dinars, livraison 20–25 jours, zéro stress.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-2xl px-6"
              onClick={() => setLocation("/calculator")}
            >
              <ScanLine className="w-5 h-5" />
              Calculer mon prix
            </Button>
            <Button
              size="lg"
              className="bg-blue-900 hover:bg-blue-800 text-white gap-2 rounded-2xl px-6"
              onClick={() => setLocation("/calculator")}
            >
              <ShoppingCart className="w-5 h-5" />
              Passer commande
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-2xl px-6 border-blue-300 text-blue-700"
              onClick={() => setLocation("/chatbot")}
            >
              <MessageCircle className="w-5 h-5" />
              Parler au chatbot
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-blue-700 text-white py-5 px-4">
        <div className="max-w-screen-lg mx-auto grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">170+</p>
            <p className="text-blue-200 text-sm">Commandes livrées</p>
          </div>
          <div>
            <p className="text-2xl font-bold">98%</p>
            <p className="text-blue-200 text-sm">Satisfaction client</p>
          </div>
          <div>
            <p className="text-2xl font-bold">20-25j</p>
            <p className="text-blue-200 text-sm">Délai de livraison</p>
          </div>
          <div>
            <p className="text-2xl font-bold">3</p>
            <p className="text-blue-200 text-sm">Plateformes</p>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-screen-lg mx-auto">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            PLATEFORMES
          </p>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Où on commande pour vous
          </h2>
          <p className="text-slate-500 mb-8">
            Trois des plus grandes plateformes mondiales, accessibles depuis la Tunisie.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <p className="font-semibold text-slate-900">Shein</p>
              <p className="text-slate-500 text-sm">Mode &amp; tendances</p>
            </div>
            <div className="border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <p className="font-semibold text-slate-900">AliExpress</p>
              <p className="text-slate-500 text-sm">Tout &amp; moins cher</p>
            </div>
            <div className="border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <p className="font-semibold text-slate-900">Temu</p>
              <p className="text-slate-500 text-sm">Prix imbattables</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-screen-lg mx-auto">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            COMMENT ÇA MARCHE
          </p>
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            Simple en 3 étapes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <ScanLine className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                1. Scannez votre produit
              </h3>
              <p className="text-slate-500 text-sm">
                Uploadez une photo du produit depuis Shein ou AliExpress. Notre IA analyse et calcule le prix automatiquement.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                2. Passez votre commande
              </h3>
              <p className="text-slate-500 text-sm">
                Remplissez vos informations et confirmez. Vous recevez un code de suivi unique pour votre commande.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                3. Recevez chez vous
              </h3>
              <p className="text-slate-500 text-sm">
                Livraison directe à votre adresse en Tunisie en 20–25 jours ouvrables. Suivi en temps réel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Bysis */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-screen-lg mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Pourquoi choisir Bysis ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Calcul IA instantané</h3>
                <p className="text-slate-500 text-sm">
                  Notre IA analyse l'image du produit et calcule le prix final en dinars en quelques secondes.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Paiement sécurisé</h3>
                <p className="text-slate-500 text-sm">
                  Paiement après confirmation de commande. Zéro risque de fraude ou d'arnaque.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Service client 24/7</h3>
                <p className="text-slate-500 text-sm">
                  Notre chatbot IA répond à toutes vos questions à tout moment. Support humain disponible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-screen-lg mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Prêt à commander ?
          </h2>
          <p className="text-blue-100 mb-6">
            Rejoignez des centaines de clients satisfaits en Tunisie.
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 gap-2 rounded-2xl px-8"
            onClick={() => setLocation("/calculator")}
          >
            Calculer mon prix maintenant
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden">
        <div className="grid grid-cols-5 py-2">
          <button
            className="flex flex-col items-center gap-1 py-1 text-blue-600"
            onClick={() => setLocation("/calculator")}
          >
            <ScanLine className="w-5 h-5" />
            <span className="text-xs font-medium">Scan</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 py-1 text-slate-500 hover:text-blue-600"
            onClick={() => setLocation("/order-tracking")}
          >
            <History className="w-5 h-5" />
            <span className="text-xs">Historique</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 py-1 text-slate-500 hover:text-blue-600"
            onClick={() => setLocation("/calculator")}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs">Commandes</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 py-1 text-slate-500 hover:text-blue-600"
            onClick={() => setLocation("/order-tracking")}
          >
            <Store className="w-5 h-5" />
            <span className="text-xs">Boutique</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 py-1 text-slate-500 hover:text-blue-600"
            onClick={() => setLocation("/chatbot")}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Chat</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 pb-20 md:pb-6">
        <div className="max-w-screen-lg mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-semibold text-white">bysis</span>
          </div>
          <p className="text-sm">&copy; 2026 Bysis. Tous droits réservés.</p>
          <div className="flex gap-4 text-sm">
            <button
              className="hover:text-white transition-colors"
              onClick={() => setLocation("/order-tracking")}
            >
              Suivi commande
            </button>
            <button
              className="hover:text-white transition-colors"
              onClick={() => setLocation("/chatbot")}
            >
              Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
