import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Calculator() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    sourceUrl: "",
    sourcePrice: "",
    quantity: "1",
    customerNotes: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const createOrderMutation = trpc.orders.create.useMutation();
  const analyzeImageMutation = trpc.calculator.analyzeImage.useMutation();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imagePreview) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeImageMutation.mutateAsync({
        imageUrl: imagePreview,
        sourcePrice: formData.sourcePrice,
      });
      setAnalysisResult(result);
      toast.success("Image analysée avec succès!");
    } catch (error) {
      toast.error("Erreur lors de l'analyse de l'image");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!formData.customerName) {
      toast.error("Veuillez entrer votre nom");
      return;
    }

    try {
      const order = await createOrderMutation.mutateAsync({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone || undefined,
        customerEmail: formData.customerEmail || undefined,
        sourceUrl: formData.sourceUrl || undefined,
        sourcePrice: formData.sourcePrice || undefined,
        quantity: parseInt(formData.quantity),
        customerNotes: formData.customerNotes || undefined,
      });

      toast.success(`Commande créée! Code de suivi: ${order.trackingCode}`);
      setLocation(`/order-tracking/${order.trackingCode}`);
    } catch (error) {
      toast.error("Erreur lors de la création de la commande");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Calculateur de Prix
          </h1>
          <p className="text-slate-600">
            Uploadez une image de produit et nous calculerons automatiquement le prix.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Upload Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">
              1. Uploadez l'image du produit
            </h2>

            <div className="mb-6">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-64 object-cover rounded-lg border-2 border-blue-200"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview("");
                      setAnalysisResult(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Changer
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 font-medium">
                    Cliquez pour uploader une image
                  </p>
                  <p className="text-slate-500 text-sm">
                    PNG, JPG, GIF jusqu'à 10MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {imagePreview && !analysisResult && (
              <Button
                onClick={handleAnalyzeImage}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  "Analyser l'image"
                )}
              </Button>
            )}

            {analysisResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">
                    Analyse terminée
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {analysisResult.productType}
                  </p>
                  <p>
                    <span className="font-medium">Catégorie:</span>{" "}
                    {analysisResult.productCategory}
                  </p>
                  <p>
                    <span className="font-medium">Qualité:</span>{" "}
                    {analysisResult.qualityLevel}
                  </p>
                  <p>
                    <span className="font-medium">Prix source:</span> $
                    {analysisResult.sourcePrice}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    <span className="font-medium">Prix calculé:</span> $
                    {analysisResult.calculatedPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Form Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">
              2. Informations de la commande
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Nom *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Téléphone</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  placeholder="+212 6XX XXX XXX"
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <Label htmlFor="sourceUrl">URL du produit</Label>
                <Input
                  id="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="sourcePrice">Prix source ($)</Label>
                <Input
                  id="sourcePrice"
                  value={formData.sourcePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sourcePrice: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="customerNotes">Notes</Label>
                <Textarea
                  id="customerNotes"
                  value={formData.customerNotes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerNotes: e.target.value,
                    })
                  }
                  placeholder="Remarques ou demandes spéciales..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={createOrderMutation.isPending || !formData.customerName}
                className="w-full"
                size="lg"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer la commande"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
