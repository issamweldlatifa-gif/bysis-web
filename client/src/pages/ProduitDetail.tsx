import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import { ShoppingCart, ArrowLeft, Package, ExternalLink, Loader2, Tag } from "lucide-react";

const PLATFORM_LABELS: Record<string, string> = {
  shein: "Shein", aliexpress: "AliExpress", temu: "Temu", local: "Local",
};
const PLATFORM_COLORS: Record<string, string> = {
  shein: "#E8192C", aliexpress: "#FF6A00", temu: "#FF4D00", local: "#1A1A1A",
};

export default function ProduitDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const productId = parseInt(params.id || "0");

  const { data: product, isLoading, error } = trpc.products.get.useQuery(
    { id: productId },
    { enabled: productId > 0 }
  );

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    </AppLayout>
  );

  if (error || !product) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-64 px-8 text-center">
        <Package size={40} className="text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-gray-500">Produit introuvable</p>
        <button onClick={() => navigate("/catalogue")} className="mt-4 text-sm text-blue-600 underline">
          Retour au catalogue
        </button>
      </div>
    </AppLayout>
  );

  const discountedPrice = product.discount && product.discount > 0
    ? Math.round(product.priceTnd * (1 - product.discount / 100) * 10) / 10
    : product.priceTnd;

  const handleAddToCart = () => {
    addItem({
      id: String(product.id),
      name: product.name,
      priceTnd: discountedPrice,
      imageUrl: product.imageUrl ?? undefined,
      productLink: product.platformLink ?? undefined,
      platform: product.platform ?? undefined,
    });
    toast.success(`${product.name} ajouté au panier 🛒`);
  };

  const handleOrder = () => {
    const params = new URLSearchParams({
      productLink: product.platformLink || "",
      productName: product.name,
      quantity: "1",
    });
    navigate(`/order?${params.toString()}`);
  };

  return (
    <AppLayout>
      <div className="w-full bg-white min-h-screen pb-32">
        {/* Back button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => navigate("/catalogue")}
            className="flex items-center gap-1.5 text-sm text-gray-500 active:scale-95 transition-transform">
            <ArrowLeft size={16} />
            Catalogue
          </button>
        </div>

        {/* Product image */}
        <div className="w-full aspect-square bg-gray-50 relative">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={64} className="text-gray-300" />
            </div>
          )}
          {product.discount && product.discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              -{product.discount}%
            </div>
          )}
          <div className="absolute top-4 right-4 text-sm font-bold px-3 py-1 rounded-full text-white"
            style={{ background: PLATFORM_COLORS[product.platform || "local"] || "#1A1A1A" }}>
            {PLATFORM_LABELS[product.platform || "local"] || product.platform}
          </div>
        </div>

        {/* Product info */}
        <div className="px-4 pt-4 pb-6">
          <h1 className="text-xl font-black text-gray-900 leading-tight mb-2">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-black text-gray-900">{discountedPrice} DT</span>
            {product.discount && product.discount > 0 && (
              <span className="text-lg text-gray-400 line-through">{product.priceTnd} DT</span>
            )}
            {product.priceEur && (
              <span className="text-sm text-gray-400">≈ {product.priceEur}€</span>
            )}
          </div>

          {/* Stock */}
          {product.stock !== null && product.stock !== undefined && (
            <div className="flex items-center gap-1.5 mb-4">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-gray-600">
                {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
              </span>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mb-4 p-4 bg-gray-50 rounded-2xl">
              <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Platform link */}
          {product.platformLink && (
            <a
              href={product.platformLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 mb-4">
              <ExternalLink size={14} />
              Voir sur {PLATFORM_LABELS[product.platform || "local"]}
            </a>
          )}

          {/* Category tag */}
          <div className="flex items-center gap-1.5 mb-6">
            <Tag size={13} className="text-gray-400" />
            <span className="text-xs text-gray-400">Produit Bysis</span>
          </div>
        </div>

        {/* Fixed bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 px-4 py-4 flex gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm border-2 border-gray-900 text-gray-900 active:scale-[0.97] transition-transform">
            <ShoppingCart size={18} />
            Ajouter au panier
          </button>
          <button
            onClick={handleOrder}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white active:scale-[0.97] transition-transform"
            style={{ background: "#1A1A1A" }}>
            Commander
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
