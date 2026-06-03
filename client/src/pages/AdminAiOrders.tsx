'use client';
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search, RefreshCw, CheckCircle, XCircle, Package, Phone, MapPin, User,
  ExternalLink, MessageCircle, Download, TrendingUp, Clock, DollarSign,
  ChevronDown, Edit3, Save, X, History, Filter
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending_deposit: "bg-yellow-100 text-yellow-800 border-yellow-200",
  deposit_received:"bg-blue-100 text-blue-800 border-blue-200",
  confirmed:       "bg-indigo-100 text-indigo-800 border-indigo-200",
  processing:      "bg-purple-100 text-purple-800 border-purple-200",
  shipped:         "bg-orange-100 text-orange-800 border-orange-200",
  delivered:       "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled:       "bg-red-100 text-red-800 border-red-200",
  // legacy aliases
  pending:         "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid:            "bg-green-100 text-green-800 border-green-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending_deposit: "⏳ En attente dépôt",
  deposit_received:"💳 Dépôt reçu",
  confirmed:       "✅ Confirmé",
  processing:      "🔄 En traitement",
  shipped:         "🚚 Expédié",
  delivered:       "📦 Livré",
  cancelled:       "❌ Annulé",
  pending:         "⏳ En attente",
  paid:            "💰 Payé",
};

const ALL_STATUSES = ["pending_deposit","deposit_received","confirmed","processing","shipped","delivered","cancelled"];

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n: number | null | undefined) {
  if (!n) return "—";
  return (n / 1000).toFixed(3) + " د.ت";
}
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('fr-TN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function whatsappLink(phone: string, msg: string) {
  const p = phone.replace(/\D/g, '');
  const intl = p.startsWith('216') ? p : `216${p}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
}
function exportCSV(orders: any[]) {
  const headers = ["ID","Code suivi","Nom","Prénom","Téléphone","Gouvernorat","Moatamadia","Email","Produit","Lien","Prix TND","Acompte TND","Statut","Date","Notes admin"];
  const rows = orders.map(o => [
    o.id, o.trackingCode,
    o.customerName || '', o.customerLastName || '',
    o.phone || o.customerPhone || '',
    o.gouvernorat || '', o.moatamadia || '',
    o.email || o.userEmail || '',
    o.productName || '', o.productUrl || '',
    o.totalPrice ? (o.totalPrice/1000).toFixed(3) : '',
    o.depositAmount ? (o.depositAmount/1000).toFixed(3) : '',
    o.status || '',
    fmtDate(o.createdAt),
    (o.adminNotes || '').replace(/,/g,'؛'),
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `commandes-ai-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ── Stats card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminAiOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  const { data: orders = [], refetch, isLoading } = trpc.aiOrders.adminList.useQuery();

  const confirmMutation = trpc.aiOrders.confirm.useMutation({
    onSuccess: (data) => {
      toast.success("Commande confirmée ✅");
      refetch();
      setShowConfirmDialog(false);
      setSelectedOrder(null);
      setAdminNote("");
      // Auto-open WhatsApp to notify customer
      if (data?.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }
    },
    onError: (e) => toast.error(e.message),
  });
  const rejectMutation = trpc.aiOrders.reject.useMutation({
    onSuccess: () => { toast.success("Commande rejetée"); refetch(); setShowRejectDialog(false); setSelectedOrder(null); setAdminNote(""); },
    onError: (e) => toast.error(e.message),
  });
  const updateStatusMutation = trpc.aiOrders.updateStatus.useMutation({
    onSuccess: () => { toast.success("Statut mis à jour"); refetch(); if (selectedOrder) { const updated = orders.find((o: any) => o.id === selectedOrder.id); if (updated) setSelectedOrder(updated); } },
    onError: (e) => toast.error(e.message),
  });
  const updateNotesMutation = trpc.aiOrders.updateAdminNotes.useMutation({
    onSuccess: () => { toast.success("Notes sauvegardées"); refetch(); setEditingNotes(false); },
    onError: (e) => toast.error(e.message),
  });

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o: any) => ['pending_deposit','pending'].includes(o.status)).length;
    const confirmed = orders.filter((o: any) => ['confirmed','processing','shipped','delivered','deposit_received'].includes(o.status)).length;
    const totalCA = orders.reduce((s: number, o: any) => s + (o.totalPrice || 0), 0);
    const depositsReceived = orders.filter((o: any) => ['deposit_received','confirmed','processing','shipped','delivered'].includes(o.status))
      .reduce((s: number, o: any) => s + (o.depositAmount || 0), 0);
    return { total, pending, confirmed, totalCA, depositsReceived };
  }, [orders]);

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return orders.filter((o: any) => {
      const q = search.toLowerCase();
      const matchSearch = !search || (
        (o.customerName || "").toLowerCase().includes(q) ||
        (o.customerLastName || "").toLowerCase().includes(q) ||
        (o.phone || o.customerPhone || "").includes(q) ||
        (o.trackingCode || "").toLowerCase().includes(q) ||
        (o.productName || "").toLowerCase().includes(q) ||
        (o.gouvernorat || "").toLowerCase().includes(q)
      );
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  // ── Open detail dialog ───────────────────────────────────────────────────────
  const openDetail = (order: any) => {
    setSelectedOrder(order);
    setNotesValue(order.adminNotes || "");
    setEditingNotes(false);
  };

  // ── Parse statusHistory ──────────────────────────────────────────────────────
  const parseHistory = (raw: string | null | undefined) => {
    try { return JSON.parse(raw || "[]") as { status: string; note?: string; at: string }[]; }
    catch { return []; }
  };

  return (
    <div className="p-4 space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Commandes AI Chat</h2>
          <p className="text-sm text-gray-500">{orders.length} commande(s) au total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(orders)} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Total commandes" value={stats.total} color="bg-gray-100 text-gray-600" />
        <StatCard icon={Clock} label="En attente" value={stats.pending} color="bg-yellow-100 text-yellow-600" />
        <StatCard icon={TrendingUp} label="CA total" value={fmt(stats.totalCA)} color="bg-green-100 text-green-600" />
        <StatCard icon={DollarSign} label="Acomptes reçus" value={fmt(stats.depositsReceived)} color="bg-blue-100 text-blue-600" />
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Nom, téléphone, code suivi, gouvernorat..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {ALL_STATUSES.map(s => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s] || s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Orders list ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucune commande</p>
          <p className="text-sm">Modifiez les filtres ou attendez de nouvelles commandes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order: any) => {
            const phone = order.phone || order.customerPhone || "";
            const waMsg = `مرحبا ${order.customerName || ''}! كومندتك ${order.trackingCode} تأكدت ✅ — Bysis`;
            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openDetail(order)}
              >
                <div className="flex items-start gap-3">
                  {/* Product image */}
                  {order.productImageUrl ? (
                    <img src={order.productImageUrl} alt="Produit" className="w-14 h-14 rounded-lg object-cover shrink-0 border border-gray-100" loading="lazy" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-gray-300" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{order.customerName} {order.customerLastName}</span>
                      <Badge className={`text-xs border ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{phone}</span>
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
                    {order.totalPrice ? (
                      <p className="font-bold text-gray-900">{fmt(order.totalPrice)}</p>
                    ) : null}
                    {order.depositAmount ? (
                      <p className="text-xs text-orange-600">تسبقة: {fmt(order.depositAmount)}</p>
                    ) : null}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('fr-TN')}
                    </p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                  {order.status === "pending_deposit" || order.status === "pending" ? (
                    <>
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
                    </>
                  ) : null}
                  {phone && (
                    <a
                      href={whatsappLink(phone, waMsg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors border border-green-200"
                      onClick={e => e.stopPropagation()}
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Order Detail Dialog ── */}
      {selectedOrder && !showConfirmDialog && !showRejectDialog && (
        <Dialog open onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Commande {selectedOrder.trackingCode}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Product image + link */}
              {(selectedOrder.productImageUrl || selectedOrder.productUrl) && (
                <div className="flex gap-3 items-start bg-gray-50 rounded-xl p-3">
                  {selectedOrder.productImageUrl && (
                    <img src={selectedOrder.productImageUrl} alt="Produit" className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0" loading="lazy" />
                  )}
                  <div className="flex-1 min-w-0">
                    {selectedOrder.productName && (
                      <p className="font-semibold text-sm text-gray-900 mb-1">{selectedOrder.productName}</p>
                    )}
                    {selectedOrder.productUrl && (
                      <a href={selectedOrder.productUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <ExternalLink className="w-3 h-3" /> Voir le produit
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Customer info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2"><User className="w-4 h-4" /> Client</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Nom:</span> <span className="font-medium">{selectedOrder.customerName} {selectedOrder.customerLastName}</span></div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="font-medium">{selectedOrder.phone || selectedOrder.customerPhone}</span>
                  </div>
                  <div><span className="text-gray-500">Gouvernorat:</span> <span className="font-medium">{selectedOrder.gouvernorat}</span></div>
                  {selectedOrder.moatamadia && <div><span className="text-gray-500">Moatamadia:</span> <span className="font-medium">{selectedOrder.moatamadia}</span></div>}
                  {(selectedOrder.email || selectedOrder.userEmail) && (
                    <div className="col-span-2"><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedOrder.email || selectedOrder.userEmail}</span></div>
                  )}
                </div>
                {/* WhatsApp button */}
                {(selectedOrder.phone || selectedOrder.customerPhone) && (
                  <a
                    href={whatsappLink(
                      selectedOrder.phone || selectedOrder.customerPhone,
                      `مرحبا ${selectedOrder.customerName || ''}! كومندتك ${selectedOrder.trackingCode} — Bysis`
                    )}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Contacter via WhatsApp
                  </a>
                )}
              </div>

              {/* Price info */}
              <div className="bg-yellow-50 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">💰 Prix</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedOrder.totalPrice ? <div><span className="text-gray-500">Total:</span> <span className="font-bold text-gray-900">{fmt(selectedOrder.totalPrice)}</span></div> : null}
                  {selectedOrder.depositAmount ? <div><span className="text-gray-500">Acompte 50%:</span> <span className="font-bold text-orange-600">{fmt(selectedOrder.depositAmount)}</span></div> : null}
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
                  {ALL_STATUSES.map(s => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selectedOrder.status === s ? "default" : "outline"}
                      onClick={() => {
                        updateStatusMutation.mutate({ id: selectedOrder.id, status: s });
                        setSelectedOrder({ ...selectedOrder, status: s });
                      }}
                      disabled={updateStatusMutation.isPending}
                      className="text-xs"
                    >
                      {STATUS_LABELS[s]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Admin notes — editable */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><Edit3 className="w-3 h-3" /> Notes admin</p>
                  {!editingNotes ? (
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditingNotes(true)}>
                      <Edit3 className="w-3 h-3 mr-1" /> Modifier
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-green-600"
                        onClick={() => updateNotesMutation.mutate({ id: selectedOrder.id, adminNotes: notesValue })}
                        disabled={updateNotesMutation.isPending}>
                        <Save className="w-3 h-3 mr-1" /> Sauvegarder
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-red-500"
                        onClick={() => { setEditingNotes(false); setNotesValue(selectedOrder.adminNotes || ""); }}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {editingNotes ? (
                  <Textarea
                    value={notesValue}
                    onChange={e => setNotesValue(e.target.value)}
                    placeholder="Ajouter une note interne..."
                    className="text-sm min-h-[80px]"
                  />
                ) : (
                  <p className="text-sm text-gray-700 min-h-[40px]">{selectedOrder.adminNotes || <span className="text-gray-400 italic">Aucune note</span>}</p>
                )}
              </div>

              {/* Status history */}
              {(() => {
                const history = parseHistory(selectedOrder.statusHistory);
                if (history.length === 0) return null;
                return (
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><History className="w-3 h-3" /> Historique des statuts</p>
                    <div className="space-y-1.5">
                      {history.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className={`px-1.5 py-0.5 rounded border ${STATUS_COLORS[h.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {STATUS_LABELS[h.status] || h.status}
                          </span>
                          <span className="text-gray-400">{fmtDate(h.at)}</span>
                          {h.note && <span className="text-gray-600 italic">— {h.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <DialogFooter>
              {(selectedOrder.status === "pending_deposit" || selectedOrder.status === "pending") && (
                <>
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowConfirmDialog(true)}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Confirmer
                  </Button>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => setShowRejectDialog(true)}>
                    <XCircle className="w-4 h-4 mr-2" /> Rejeter
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Confirm Dialog ── */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>✅ Confirmer la commande</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">
            Confirmer la commande de <strong>{selectedOrder?.customerName} {selectedOrder?.customerLastName}</strong> ?
          </p>
          <Textarea placeholder="Note admin (optionnel)..." value={adminNote} onChange={e => setAdminNote(e.target.value)} className="mt-2" />
          <DialogFooter>
            <Button className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => confirmMutation.mutate({ id: selectedOrder.id, adminNote })}
              disabled={confirmMutation.isPending}>
              {confirmMutation.isPending ? "En cours..." : "Confirmer"}
            </Button>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ── */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>❌ Rejeter la commande</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">
            Rejeter la commande de <strong>{selectedOrder?.customerName} {selectedOrder?.customerLastName}</strong> ?
          </p>
          <Textarea
            placeholder="Raison du rejet (obligatoire)..."
            value={adminNote}
            onChange={e => setAdminNote(e.target.value)}
            className="mt-2"
            required
          />
          <DialogFooter>
            <Button variant="destructive"
              onClick={() => rejectMutation.mutate({ id: selectedOrder.id, reason: adminNote })}
              disabled={rejectMutation.isPending || !adminNote.trim()}>
              {rejectMutation.isPending ? "En cours..." : "Rejeter"}
            </Button>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
