import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import AppLayout from "@/components/AppLayout";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Search, ShoppingCart, Package } from "lucide-react";
import { CatalogueGridSkeleton } from "@/components/SkeletonCatalogue";

const PLATFORM_LABELS: Record<string, string> = {
  shein: "Shein", aliexpress: "AliExpress", temu: "Temu", local: "Local",
};
const PLATFORM_COLORS: Record<string, string> = {
  shein: "#E8192C", aliexpress: "#FF6A00", temu: "#FF4D00", local: "#1A1A1A",
};

export default function Catalogue() {
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: productsData, isLoading } = trpc.products.list.useQuery({
    limit,
    offset: page * limit,
    categoryId: selectedCategory ?? undefined,
    search: search || undefined,
  });

  const products = productsData?.items ?? [];
  const total = productsData?.total ?? 0;

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: String(product.id),
      name: product.name,
      priceTnd: product.priceTnd,
      imageUrl: product.imageUrl ?? undefined,
      productLink: product.platformLink ?? undefined,
      platform: product.platform,
    });
    toast.success(`${product.name} ajouté au panier 🛒`);
  };

  return (
    <AppLayout>
      <div className="w-full bg-white min-h-screen pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-3 border-b border-gray-100">
          <h1 className="text-xl font-black text-gray-900 mb-3">Catalogue</h1>
          {/* Search */}
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Rechercher un produit..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm outline-none bg-gray-50 border border-gray-100"
            />
          </div>
          {/* Categories filter */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => { setSelectedCategory(null); setPage(0); }}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: selectedCategory === null ? "#1A1A1A" : "#F5F5F5",
                color: selectedCategory === null ? "#fff" : "#666",
              }}>
              Tout
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setPage(0); }}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: selectedCategory === cat.id ? "#1A1A1A" : "#F5F5F5",
                  color: selectedCategory === cat.id ? "#fff" : "#666",
                }}>
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="px-3 pt-4">
          {isLoading ? (
            <CatalogueGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-8">
              <Package size={40} className="text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">Aucun produit trouvé</p>
              <p className="text-xs text-gray-400 mt-1">Essayez une autre recherche ou catégorie</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-3">{total} produit{total > 1 ? "s" : ""}</p>
              <div className="grid grid-cols-2 gap-3">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNavigate={() => navigate(`/produit/${product.id}`)}
                    onAddToCart={(e) => handleAddToCart(product, e)}
                  />
                ))}
              </div>
              {/* Pagination */}
              {total > limit && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 disabled:opacity-40">
                    ← Précédent
                  </button>
                  <span className="text-xs text-gray-500">{page + 1} / {Math.ceil(total / limit)}</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={(page + 1) * limit >= total}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 disabled:opacity-40">
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ProductCard({ product, onNavigate, onAddToCart }: {
  product: any;
  onNavigate: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
}) {
  const discountedPrice = product.discount > 0
    ? Math.round(product.priceTnd * (1 - product.discount / 100) * 10) / 10
    : product.priceTnd;

  return (
    <div
      onClick={onNavigate}
      className="rounded-2xl overflow-hidden bg-white border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-50">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            width={200}
            height={200}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-gray-300" />
          </div>
        )}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            -{product.discount}%
          </div>
        )}
        <div className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
          style={{ background: PLATFORM_COLORS[product.platform] || "#1A1A1A" }}>
          {PLATFORM_LABELS[product.platform] || product.platform}
        </div>
      </div>
      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2 mb-1.5">{product.name}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-black text-gray-900">{discountedPrice} DT</span>
            {product.discount > 0 && (
              <span className="text-[10px] text-gray-400 line-through ml-1">{product.priceTnd} DT</span>
            )}
          </div>
          <button
            onClick={onAddToCart}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform"
            style={{ background: "#1A1A1A" }}>
            <ShoppingCart size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
