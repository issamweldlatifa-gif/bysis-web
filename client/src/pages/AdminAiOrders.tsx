'use client';
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, RefreshCw, CheckCircle, XCircle, Clock, Eye, Package, Phone, MapPin, User, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  paid:      "bg-green-100 text-green-800 border-green-200",
  shipped:   "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending:   "⏳ En attente",
  confirmed: "✅ Confirmé",
  paid:      "💰 Payé",
  shipped:   "🚚 Expédié",
  delivered: "📦 Livré",
  cancelled: "❌ Annulé",
};

export default function AdminAiOrders() {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { data: orders = [], refetch, isLoading } = trpc.aiOrders.adminList.useQuery();
  const confirmMutation = trpc.aiOrders.confirm.useMutation({
    onSuccess: () => { toast.success("Commande confirmée ✅"); refetch(); setShowConfirmDialog(false); setSelectedOrder(null); },
    onError: (e) => toast.error(e.message),
  });
  const rejectMutation = trpc.aiOrders.reject.useMutation({
    onSuccess: () => { toast.success("Commande rejetée"); refetch(); setShowRejectDialog(false); setSelectedOrder(null); },
    onError: (e) => toast.error(e.message),
  });
  const updateStatusMutation = trpc.aiOrders.updateStatus.useMutation({
    onSuccess: () => { toast.success("Statut mis à jour"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = orders.filter((o: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (o.customerName || "").toLowerCase().includes(q) ||
      (o.customerPhone || "").includes(q) ||
      (o.trackingCode || "").toLowerCase().includes(q) ||
      (o.productName || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Commandes AI Chat</h2>
          <p className="text-sm text-gray-500">{orders.length} commande(s) au total</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Rechercher par nom, téléphone, code suivi..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucune commande AI</p>
          <p className="text-sm">Les commandes créées via le chat apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order: any) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{order.customerName} {order.customerLastName}</span>
                    <Badge className={`text-xs border ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.customerPhone}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.gouvernorat}</span>
                    {order.trackingCode && (
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{order.trackingCode}</span>
                    )}
                  </div>
                  {order.productName && (
                    <p className="text-sm text-gray-700 mt-1 truncate">📦 {order.productName}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {order.totalPriceTnd && (
                    <p className="font-bold text-gray-900">{Number(order.totalPriceTnd).toFixed(2)} د.ت</p>
                  )}
                  {order.depositAmount && (
                    <p className="text-xs text-orange-600">تسبقة: {Number(order.depositAmount).toFixed(2)} د.ت</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('fr-TN')}
                  </p>
                </div>
              </div>

              {/* Quick actions */}
              {order.status === "pending" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1"
                    onClick={() => { setSelectedOrder(order); setShowConfirmDialog(true); }}
                  >
                    <CheckCircle className="w-4 h-4" /> Confirmer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-1"
                    onClick={() => { setSelectedOrder(order); setShowRejectDialog(true); }}
                  >
                    <XCircle className="w-4 h-4" /> Rejeter
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Dialog */}
      {selectedOrder && !showConfirmDialog && !showRejectDialog && (
        <Dialog open onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Commande {selectedOrder.trackingCode}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Customer info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2"><User className="w-4 h-4" /> Client</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Nom:</span> <span className="font-medium">{selectedOrder.customerName} {selectedOrder.customerLastName}</span></div>
                  <div><span className="text-gray-500">Tél:</span> <span className="font-medium">{selectedOrder.customerPhone}</span></div>
                  <div><span className="text-gray-500">Gouvernorat:</span> <span className="font-medium">{selectedOrder.gouvernorat}</span></div>
                  <div><span className="text-gray-500">Moatamadia:</span> <span className="font-medium">{selectedOrder.moatamadia}</span></div>
                  {selectedOrder.userEmail && (
                    <div className="col-span-2"><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedOrder.userEmail}</span></div>
                  )}
                </div>
              </div>

              {/* Product info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2"><Package className="w-4 h-4" /> Produit</h4>
                <div className="space-y-1 text-sm">
                  {selectedOrder.productName && <p><span className="text-gray-500">Produit:</span> <span className="font-medium">{selectedOrder.productName}</span></p>}
                  {selectedOrder.productUrl && (
                    <p><span className="text-gray-500">Lien:</span> <a href={selectedOrder.productUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 inline-flex"><ExternalLink className="w-3 h-3" /> Voir le produit</a></p>
                  )}
                  {selectedOrder.productImageUrl && (
                    <img src={selectedOrder.productImageUrl} alt="Produit" className="w-24 h-24 object-cover rounded-lg mt-2" loading="lazy" />
                  )}
                </div>
              </div>

              {/* Price info */}
              <div className="bg-yellow-50 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">💰 Prix</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedOrder.totalPriceTnd && <div><span className="text-gray-500">Total:</span> <span className="font-bold text-gray-900">{Number(selectedOrder.totalPriceTnd).toFixed(2)} د.ت</span></div>}
                  {selectedOrder.depositAmount && <div><span className="text-gray-500">Acompte 50%:</span> <span className="font-bold text-orange-600">{Number(selectedOrder.depositAmount).toFixed(2)} د.ت</span></div>}
                </div>
              </div>

              {/* Payment proof */}
              {selectedOrder.paymentProofUrl && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">💳 Preuve de paiement</h4>
                  <img src={selectedOrder.paymentProofUrl} alt="Preuve" className="w-full max-h-48 object-contain rounded-lg" loading="lazy" />
                </div>
              )}

              {/* Status update */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">Changer le statut</h4>
                <div className="flex gap-2 flex-wrap">
                  {["confirmed", "paid", "shipped", "delivered", "cancelled"].map(s => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selectedOrder.status === s ? "default" : "outline"}
                      onClick={() => updateStatusMutation.mutate({ id: selectedOrder.id, status: s })}
                      disabled={updateStatusMutation.isPending}
                      className="text-xs"
                    >
                      {STATUS_LABELS[s]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Admin notes */}
              {selectedOrder.adminNotes && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Notes admin:</p>
                  <p className="text-sm text-gray-700">{selectedOrder.adminNotes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              {selectedOrder.status === "pending" && (
                <>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setShowConfirmDialog(true)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Confirmer
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Rejeter
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ Confirmer la commande</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Confirmer la commande de <strong>{selectedOrder?.customerName} {selectedOrder?.customerLastName}</strong> ?
            Un email de confirmation sera envoyé au client.
          </p>
          <Textarea
            placeholder="Note admin (optionnel)..."
            value={adminNote}
            onChange={e => setAdminNote(e.target.value)}
            className="mt-2"
          />
          <DialogFooter>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => confirmMutation.mutate({ id: selectedOrder.id, adminNote })}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? "En cours..." : "Confirmer"}
            </Button>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>❌ Rejeter la commande</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Rejeter la commande de <strong>{selectedOrder?.customerName} {selectedOrder?.customerLastName}</strong> ?
            Un email sera envoyé au client.
          </p>
          <Textarea
            placeholder="Raison du rejet (sera envoyée au client)..."
            value={adminNote}
            onChange={e => setAdminNote(e.target.value)}
            className="mt-2"
            required
          />
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate({ id: selectedOrder.id, reason: adminNote })}
              disabled={rejectMutation.isPending || !adminNote.trim()}
            >
              {rejectMutation.isPending ? "En cours..." : "Rejeter"}
            </Button>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
