import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle, Clock, Package, Truck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
  new: { label: "Nouvelle", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  processing: { label: "En traitement", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  waiting_payment: { label: "En attente de paiement", color: "bg-orange-100 text-orange-800", icon: AlertCircle },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-800", icon: Truck },
  arrived: { label: "Arrivée", color: "bg-green-100 text-green-800", icon: Package },
  completed: { label: "Complétée", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

export default function OrderTracking() {
  const [match, params] = useRoute("/order-tracking/:trackingCode");
  const [, setLocation] = useLocation();
  const [searchCode, setSearchCode] = useState(params?.trackingCode || "");
  const [showSearch, setShowSearch] = useState(!params?.trackingCode);

  const { data: order, isLoading, refetch } = trpc.orders.getByTrackingCode.useQuery(
    { trackingCode: searchCode || params?.trackingCode || "" },
    { enabled: !!searchCode || !!params?.trackingCode }
  );

  const handleSearch = () => {
    if (searchCode) {
      setLocation(`/order-tracking/${searchCode}`);
      setShowSearch(false);
      refetch();
    } else {
      toast.error("Veuillez entrer un code de suivi");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (showSearch && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Suivi de commande
            </h1>
            <p className="text-slate-600">
              Entrez votre code de suivi pour voir l'état de votre commande
            </p>
          </div>

          <Card className="p-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="trackingCode">Code de suivi</Label>
                <Input
                  id="trackingCode"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="BYS-XXXXXXXXX-XXXXXX"
                  className="text-lg"
                />
              </div>
              <Button onClick={handleSearch} className="w-full" size="lg">
                Rechercher
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Commande non trouvée
            </h2>
            <p className="text-slate-600 mb-6">
              Vérifiez votre code de suivi et réessayez
            </p>
            <Button onClick={() => setShowSearch(true)}>
              Nouvelle recherche
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.new;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Button variant="outline" onClick={() => setShowSearch(true)}>
            ← Nouvelle recherche
          </Button>
        </div>

        <Card className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Commande {order.trackingCode}
              </h1>
              <p className="text-slate-600">
                Créée le {new Date(order.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${config.color}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-semibold">{config.label}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Customer Info */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Informations client
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-slate-600">Nom:</span>{" "}
                  {order.customerName}
                </p>
                {order.customerPhone && (
                  <p>
                    <span className="font-medium text-slate-600">Téléphone:</span>{" "}
                    {order.customerPhone}
                  </p>
                )}
                {order.customerEmail && (
                  <p>
                    <span className="font-medium text-slate-600">Email:</span>{" "}
                    {order.customerEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Informations produit
              </h2>
              <div className="space-y-2 text-sm">
                {order.productType && (
                  <p>
                    <span className="font-medium text-slate-600">Type:</span>{" "}
                    {order.productType}
                  </p>
                )}
                {order.productCategory && (
                  <p>
                    <span className="font-medium text-slate-600">Catégorie:</span>{" "}
                    {order.productCategory}
                  </p>
                )}
                <p>
                  <span className="font-medium text-slate-600">Quantité:</span>{" "}
                  {order.quantity}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-slate-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Détails de prix
            </h2>
            <div className="space-y-2">
              {order.sourcePrice && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Prix source:</span>
                  <span className="font-medium">${order.sourcePrice}</span>
                </div>
              )}
              {order.calculatedPrice && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Prix calculé:</span>
                  <span className="font-medium">${order.calculatedPrice}</span>
                </div>
              )}
              {order.finalPrice && (
                <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span className="font-semibold text-slate-900">Prix final:</span>
                  <span className="font-bold text-lg text-blue-600">
                    ${order.finalPrice}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Image */}
          {order.imageUrl && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Image du produit
              </h2>
              <img
                src={order.imageUrl}
                alt="Product"
                className="w-full max-w-md h-auto rounded-lg border border-slate-200"
              />
            </div>
          )}

          {/* Notes */}
          {order.customerNotes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">
                Notes du client
              </h3>
              <p className="text-blue-800">{order.customerNotes}</p>
            </div>
          )}

          {order.adminNotes && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">
                Notes administrateur
              </h3>
              <p className="text-purple-800">{order.adminNotes}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
