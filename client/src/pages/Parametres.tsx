import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, User, Phone, MapPin, Save, Package } from "lucide-react";
import { Link } from "wouter";

const GOUVERNORATS = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia",
  "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Nouvelle", color: "bg-blue-100 text-blue-700" },
  processing: { label: "En traitement", color: "bg-[#FFF9E6] text-yellow-700" },
  waiting_payment: { label: "En attente paiement", color: "bg-orange-100 text-orange-700" },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-700" },
  arrived: { label: "Arrivée", color: "bg-teal-100 text-teal-700" },
  completed: { label: "Complétée", color: "bg-[#E8F5E9] text-green-700" },
  cancelled: { label: "Annulée", color: "bg-[#FFEBEE] text-red-700" },
};

export default function Parametres() {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"profile" | "orders">("profile");

  const { data: profile, refetch } = trpc.userProfile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myOrders, isLoading: ordersLoading } = trpc.userProfile.myOrders.useQuery(undefined, {
    enabled: isAuthenticated && tab === "orders",
    refetchInterval: 30000, // Poll every 30s for live updates
  });

  const updateProfile = trpc.userProfile.update.useMutation({
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès ✅");
      refetch();
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    gouvernorat: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        gouvernorat: profile.gouvernorat || "",
      });
    }
  }, [profile]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-sm mx-4">
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Connectez-vous pour accéder à vos paramètres</p>
            <Link href="/">
              <Button variant="outline" className="w-full">Retour à l'accueil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="font-bold text-lg">Mon Compte</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6 bg-white rounded-2xl p-4 shadow-sm">
          <Avatar className="h-16 w-16 ring-2 ring-pink-200">
            <AvatarImage src={profile?.avatarUrl || user?.avatarUrl || ""} />
            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-xl font-bold">
              {(profile?.name || user?.name || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-lg">{profile?.name || user?.name || "Utilisateur"}</p>
            <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("profile")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "profile" ? "bg-pink-500 text-white shadow-md" : "bg-white text-muted-foreground hover:bg-gray-100"}`}
          >
            <User className="inline h-4 w-4 mr-1" />
            Profil
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "orders" ? "bg-pink-500 text-white shadow-md" : "bg-white text-muted-foreground hover:bg-gray-100"}`}
          >
            <Package className="inline h-4 w-4 mr-1" />
            Mes Commandes
          </button>
        </div>

        {/* Profile Tab */}
        {tab === "profile" && (
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-pink-500" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Nom complet</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Votre nom"
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Numéro de téléphone
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Ex: 20 123 456"
                  className="mt-1 rounded-xl"
                  type="tel"
                />
              </div>
              <div>
                <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Adresse
                </Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Votre adresse"
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Gouvernorat</Label>
                <Select value={form.gouvernorat} onValueChange={(v) => setForm(f => ({ ...f, gouvernorat: v }))}>
                  <SelectTrigger className="mt-1 rounded-xl">
                    <SelectValue placeholder="Sélectionner votre gouvernorat" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOUVERNORATS.map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => updateProfile.mutate(form)}
                disabled={updateProfile.isPending}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 font-semibold"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateProfile.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="space-y-3">
            {ordersLoading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : !myOrders || myOrders.length === 0 ? (
              <Card className="shadow-sm border-0">
                <CardContent className="pt-8 pb-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Aucune commande pour l'instant</p>
                  <Link href="/order">
                    <Button className="mt-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white border-0">
                      Passer une commande
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              myOrders.map((order: any) => {
                const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
                return (
                  <Card key={order.id} className="shadow-sm border-0 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm">#{order.id}</span>
                            {order.trackingCode && (
                              <span className="text-xs text-muted-foreground font-mono bg-gray-100 px-2 py-0.5 rounded">
                                {order.trackingCode}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{order.productLink}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      {/* Status Timeline */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-1 overflow-x-auto pb-1">
                          {["new", "processing", "waiting_payment", "shipped", "arrived", "completed"].map((s, i) => {
                            const statuses = ["new", "processing", "waiting_payment", "shipped", "arrived", "completed"];
                            const currentIdx = statuses.indexOf(order.status);
                            const isActive = i <= currentIdx && order.status !== "cancelled";
                            return (
                              <div key={s} className="flex items-center">
                                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${isActive ? "bg-pink-500" : "bg-gray-200"}`} />
                                {i < 5 && <div className={`h-0.5 w-4 flex-shrink-0 ${i < currentIdx && order.status !== "cancelled" ? "bg-pink-500" : "bg-gray-200"}`} />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="h-24" />
    </div>
  );
}
