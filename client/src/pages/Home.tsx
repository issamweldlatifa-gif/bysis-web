import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { ShoppingCart, Package, TrendingUp, MessageCircle } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Bysis</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-600">Bienvenue, {user?.name}</span>
                {user?.role === 'admin' && (
                  <Button onClick={() => setLocation('/admin')} variant="outline">
                    Dashboard Admin
                  </Button>
                )}
                <Button onClick={logout} variant="outline">
                  Déconnexion
                </Button>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Connexion</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Plateforme d'Import Intelligente
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Calculez automatiquement le prix de vos produits Shein et AliExpress grâce à notre analyseur IA multimodal. Gérez vos commandes, suivez vos arrivages et servez vos clients en toute simplicité.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => setLocation('/calculator')}>
              Commencer
            </Button>
            <Button size="lg" variant="outline">
              En savoir plus
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Fonctionnalités principales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <h4 className="font-semibold text-slate-900">Calcul Intelligent</h4>
              </div>
              <p className="text-slate-600 text-sm">
                Analysez les images de produits et calculez automatiquement les prix avec notre IA.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart className="w-8 h-8 text-green-600" />
                <h4 className="font-semibold text-slate-900">Gestion Commandes</h4>
              </div>
              <p className="text-slate-600 text-sm">
                Créez, suivez et gérez vos commandes avec des codes de suivi uniques.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-8 h-8 text-purple-600" />
                <h4 className="font-semibold text-slate-900">Gestion Arrivages</h4>
              </div>
              <p className="text-slate-600 text-sm">
                Gérez votre stock local et affichez les articles disponibles.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-8 h-8 text-orange-600" />
                <h4 className="font-semibold text-slate-900">Support IA</h4>
              </div>
              <p className="text-slate-600 text-sm">
                Chatbot intelligent pour assister vos clients 24/7.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Prêt à commencer?
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines de commerçants qui utilisent Bysis pour optimiser leurs importations.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => setLocation('/calculator')}>
            Créer une commande maintenant
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2026 Bysis. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
