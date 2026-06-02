import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton d'une carte produit (2 colonnes) */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
      {/* Image placeholder */}
      <Skeleton className="w-full aspect-square" />
      <div className="p-3 space-y-2">
        {/* Platform badge */}
        <Skeleton className="h-4 w-12 rounded-full" />
        {/* Product name */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        {/* Price */}
        <Skeleton className="h-5 w-20 mt-1" />
        {/* Button */}
        <Skeleton className="h-8 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

/** Grille skeleton pour le catalogue (8 cartes) */
export function CatalogueGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-3 pt-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton pour les filtres catégories */
export function CategoryFilterSkeleton() {
  return (
    <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
      ))}
    </div>
  );
}

/** Skeleton pour la page détail produit */
export function ProduitDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero image */}
      <Skeleton className="w-full aspect-square" />
      <div className="p-4 space-y-4">
        {/* Platform badge */}
        <Skeleton className="h-5 w-16 rounded-full" />
        {/* Title */}
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
        {/* Price */}
        <Skeleton className="h-8 w-32" />
        {/* Description */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* Buttons */}
        <Skeleton className="h-12 w-full rounded-2xl mt-4" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** Skeleton pour une ligne de commande */
export function OrderRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
      <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

/** Skeleton pour la liste des commandes */
export function OrdersListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderRowSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton pour la page TrackOrder */
export function TrackOrderSkeleton() {
  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-28 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="space-y-3 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
